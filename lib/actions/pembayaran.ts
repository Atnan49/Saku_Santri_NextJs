// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Server Actions untuk alur Dual-Approval Pembayaran.
//            State Machine:
//            BELUM_BAYAR → (Wali upload bukti) → MENUNGGU_VERIFIKASI_ADMIN
//            → (Admin approve) → MENUNGGU_APPROVAL_BENDAHARA
//            → (Bendahara approve) → LUNAS
//            Pada setiap tahap penolakan, status kembali ke DITOLAK_x
//            dan wali murid dapat mengunggah ulang.
// =========================================================================

"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification, notifyByRole } from "./notification";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { formatIDR } from "@/lib/utils";

// ========== WALI MURID: Submit Bukti Bayar ==========

export async function submitPaymentProof(data: {
  tagihanId: string;
  buktiUrl: string;
  catatanWali?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "WALIMURID") {
    throw new Error("Akses ditolak. Hanya Wali Murid yang dapat mengunggah bukti bayar.");
  }

  // Ambil data tagihan beserta relasi siswa, wali, dan pembayaran
  const tagihan = await prisma.tagihan.findUnique({
    where: { id: data.tagihanId },
    include: {
      siswa: {
        include: {
          wali: { select: { id: true, userId: true } },
        },
      },
      jenisTagihan: { select: { name: true } },
      pembayaran: true,
    },
  });

  if (!tagihan) {
    throw new Error("Tagihan tidak ditemukan.");
  }

  // Validasi bahwa tagihan milik anak dari wali yang login
  if (tagihan.siswa.wali.userId !== session.user.id) {
    throw new Error("Anda tidak memiliki akses ke tagihan ini.");
  }

  // Validasi status tagihan (hanya BELUM_BAYAR atau DITOLAK yang boleh di-resubmit)
  const allowedStatuses = ["BELUM_BAYAR", "DITOLAK_ADMIN", "DITOLAK_BENDAHARA"];
  if (!allowedStatuses.includes(tagihan.status)) {
    throw new Error(
      `Tagihan ini tidak dapat dibayar (status saat ini: ${tagihan.status}).`
    );
  }

  // Hapus pembayaran lama jika ada (re-submission setelah ditolak)
  if (tagihan.pembayaran) {
    await prisma.pembayaran.delete({
      where: { tagihanId: data.tagihanId },
    });
  }

  // Buat record pembayaran baru
  await prisma.pembayaran.create({
    data: {
      tagihanId: data.tagihanId,
      buktiUrl: data.buktiUrl,
      catatanWali: data.catatanWali || null,
    },
  });

  // Update status tagihan
  await prisma.tagihan.update({
    where: { id: data.tagihanId },
    data: { status: "MENUNGGU_VERIFIKASI_ADMIN" },
  });

  // Notifikasi ke semua ADMIN
  await notifyByRole(
    "ADMIN",
    "Bukti Pembayaran Baru",
    `${tagihan.siswa.name} telah mengunggah bukti pembayaran untuk ${tagihan.jenisTagihan.name}. Silakan verifikasi.`
  );

  revalidatePath("/wali/dashboard");
  revalidatePath("/admin/verifikasi");
  revalidatePath("/admin/dashboard");

  return { success: true, message: "Bukti pembayaran berhasil dikirim." };
}

// ========== ADMIN: Verifikasi Tahap 1 ==========

export async function adminVerifyPayment(data: {
  pembayaranId: string;
  action: "approve" | "reject";
  catatan?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak. Hanya Admin yang dapat memverifikasi pembayaran.");
  }

  const pembayaran = await prisma.pembayaran.findUnique({
    where: { id: data.pembayaranId },
    include: {
      tagihan: {
        include: {
          siswa: {
            include: {
              wali: {
                include: {
                  user: { select: { id: true, phone: true, name: true } },
                },
              },
              kelas: { select: { name: true } },
            },
          },
          jenisTagihan: { select: { name: true } },
        },
      },
    },
  });

  if (!pembayaran) {
    throw new Error("Data pembayaran tidak ditemukan.");
  }

  if (pembayaran.tagihan.status !== "MENUNGGU_VERIFIKASI_ADMIN") {
    throw new Error("Pembayaran ini tidak dalam status menunggu verifikasi admin.");
  }

  const siswa = pembayaran.tagihan.siswa;
  const waliPhone = siswa.wali.user.phone;
  const waliUserId = siswa.wali.user.id;
  const jenisName = pembayaran.tagihan.jenisTagihan.name;

  if (data.action === "approve") {
    // Approve → lanjut ke Tahap 2 (Bendahara)
    await prisma.pembayaran.update({
      where: { id: data.pembayaranId },
      data: {
        verifiedAt: new Date(),
        catatanAdmin: data.catatan || "Diverifikasi oleh Admin TU.",
      },
    });

    await prisma.tagihan.update({
      where: { id: pembayaran.tagihanId },
      data: { status: "MENUNGGU_APPROVAL_BENDAHARA" },
    });

    // Notifikasi ke Bendahara
    await notifyByRole(
      "BENDAHARA",
      "Menunggu Approval Final",
      `Pembayaran ${jenisName} dari ${siswa.name} (${siswa.kelas.name}) telah diverifikasi Admin. Menunggu persetujuan Anda.`
    );

    // Notifikasi ke Wali
    await createNotification(
      waliUserId,
      "Pembayaran Diverifikasi",
      `Bukti pembayaran ${jenisName} untuk ${siswa.name} telah diverifikasi Admin. Menunggu persetujuan final Bendahara.`
    );

    // WA ke Wali
    if (waliPhone) {
      sendWhatsAppMessage({
        targetPhone: waliPhone,
        message: `✅ Bukti pembayaran ${jenisName} untuk ${siswa.name} telah diverifikasi oleh Admin TU. Menunggu persetujuan final Bendahara.`,
      }).catch((err) => console.error("Gagal kirim WA:", err));
    }
  } else {
    // Reject → kembali ke Wali
    if (!data.catatan || data.catatan.trim().length === 0) {
      throw new Error("Alasan penolakan wajib diisi.");
    }

    await prisma.pembayaran.update({
      where: { id: data.pembayaranId },
      data: {
        catatanAdmin: data.catatan,
      },
    });

    await prisma.tagihan.update({
      where: { id: pembayaran.tagihanId },
      data: { status: "DITOLAK_ADMIN" },
    });

    // Notifikasi ke Wali
    await createNotification(
      waliUserId,
      "Pembayaran Ditolak (Admin)",
      `Bukti pembayaran ${jenisName} untuk ${siswa.name} ditolak oleh Admin. Alasan: ${data.catatan}. Silakan unggah ulang bukti yang benar.`
    );

    // WA ke Wali
    if (waliPhone) {
      sendWhatsAppMessage({
        targetPhone: waliPhone,
        message: `❌ Pembayaran ${jenisName} untuk ${siswa.name} ditolak oleh Admin.\n\nAlasan: ${data.catatan}\n\nSilakan unggah ulang bukti pembayaran yang benar melalui aplikasi Saku Santri.`,
      }).catch((err) => console.error("Gagal kirim WA:", err));
    }
  }

  revalidatePath("/admin/verifikasi");
  revalidatePath("/admin/dashboard");
  revalidatePath("/bendahara/approval");
  revalidatePath("/bendahara/dashboard");
  revalidatePath("/wali/dashboard");

  return {
    success: true,
    message: data.action === "approve"
      ? "Pembayaran berhasil diverifikasi dan diteruskan ke Bendahara."
      : "Pembayaran ditolak. Wali murid akan diberitahu.",
  };
}

// ========== BENDAHARA: Approval Final Tahap 2 ==========

export async function bendaharaApprovePayment(data: {
  pembayaranId: string;
  action: "approve" | "reject";
  catatan?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "BENDAHARA") {
    throw new Error("Akses ditolak. Hanya Bendahara yang dapat menyetujui pembayaran.");
  }

  const pembayaran = await prisma.pembayaran.findUnique({
    where: { id: data.pembayaranId },
    include: {
      tagihan: {
        include: {
          siswa: {
            include: {
              wali: {
                include: {
                  user: { select: { id: true, phone: true, name: true } },
                },
              },
              kelas: { select: { name: true } },
            },
          },
          jenisTagihan: { select: { name: true } },
        },
      },
    },
  });

  if (!pembayaran) {
    throw new Error("Data pembayaran tidak ditemukan.");
  }

  if (pembayaran.tagihan.status !== "MENUNGGU_APPROVAL_BENDAHARA") {
    throw new Error("Pembayaran ini tidak dalam status menunggu approval bendahara.");
  }

  const siswa = pembayaran.tagihan.siswa;
  const waliPhone = siswa.wali.user.phone;
  const waliUserId = siswa.wali.user.id;
  const jenisName = pembayaran.tagihan.jenisTagihan.name;
  const nominal = formatIDR(pembayaran.tagihan.nominalAkhir.toString());

  if (data.action === "approve") {
    // Approve final → LUNAS
    await prisma.pembayaran.update({
      where: { id: data.pembayaranId },
      data: {
        approvedAt: new Date(),
        catatanBendahara: data.catatan || "Disetujui oleh Bendahara.",
      },
    });

    await prisma.tagihan.update({
      where: { id: pembayaran.tagihanId },
      data: { status: "LUNAS" },
    });

    // Notifikasi ke Wali
    await createNotification(
      waliUserId,
      "🎉 Pembayaran LUNAS!",
      `Pembayaran ${jenisName} sebesar ${nominal} untuk ${siswa.name} telah disetujui dan berstatus LUNAS. Terima kasih!`
    );

    // Notifikasi ke Admin
    await notifyByRole(
      "ADMIN",
      "Pembayaran Lunas",
      `Pembayaran ${jenisName} dari ${siswa.name} telah disetujui Bendahara dan berstatus LUNAS.`
    );

    // WA ke Wali
    if (waliPhone) {
      sendWhatsAppMessage({
        targetPhone: waliPhone,
        message: `🎉 Alhamdulillah! Pembayaran ${jenisName} sebesar ${nominal} untuk ${siswa.name} telah LUNAS.\n\nTerima kasih atas pembayaran Anda. Kwitansi dapat diunduh melalui aplikasi Saku Santri. 🙏`,
      }).catch((err) => console.error("Gagal kirim WA:", err));
    }
  } else {
    // Reject → kembali ke Wali
    if (!data.catatan || data.catatan.trim().length === 0) {
      throw new Error("Alasan penolakan wajib diisi.");
    }

    await prisma.pembayaran.update({
      where: { id: data.pembayaranId },
      data: {
        catatanBendahara: data.catatan,
      },
    });

    await prisma.tagihan.update({
      where: { id: pembayaran.tagihanId },
      data: { status: "DITOLAK_BENDAHARA" },
    });

    // Notifikasi ke Wali
    await createNotification(
      waliUserId,
      "Pembayaran Ditolak (Bendahara)",
      `Pembayaran ${jenisName} untuk ${siswa.name} ditolak oleh Bendahara. Alasan: ${data.catatan}. Silakan hubungi pihak sekolah.`
    );

    // Notifikasi ke Admin (agar mengetahui penolakan)
    await notifyByRole(
      "ADMIN",
      "Pembayaran Ditolak Bendahara",
      `Pembayaran ${jenisName} dari ${siswa.name} ditolak oleh Bendahara. Alasan: ${data.catatan}`
    );

    // WA ke Wali
    if (waliPhone) {
      sendWhatsAppMessage({
        targetPhone: waliPhone,
        message: `❌ Pembayaran ${jenisName} untuk ${siswa.name} ditolak oleh Bendahara.\n\nAlasan: ${data.catatan}\n\nSilakan hubungi pihak sekolah atau unggah ulang bukti pembayaran melalui aplikasi Saku Santri.`,
      }).catch((err) => console.error("Gagal kirim WA:", err));
    }
  }

  revalidatePath("/bendahara/approval");
  revalidatePath("/bendahara/dashboard");
  revalidatePath("/admin/verifikasi");
  revalidatePath("/admin/dashboard");
  revalidatePath("/wali/dashboard");

  return {
    success: true,
    message: data.action === "approve"
      ? "Pembayaran disetujui dan berstatus LUNAS."
      : "Pembayaran ditolak. Wali murid akan diberitahu.",
  };
}

// ========== QUERIES untuk Halaman Verifikasi & Approval ==========

export async function getPembayaranForAdminVerification() {
  const pembayaran = await prisma.pembayaran.findMany({
    where: {
      tagihan: { status: "MENUNGGU_VERIFIKASI_ADMIN" },
    },
    include: {
      tagihan: {
        include: {
          siswa: {
            include: {
              kelas: { select: { name: true } },
              wali: {
                include: {
                  user: { select: { name: true } },
                },
              },
            },
          },
          jenisTagihan: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return pembayaran;
}

export async function getPembayaranForBendaharaApproval() {
  const pembayaran = await prisma.pembayaran.findMany({
    where: {
      tagihan: { status: "MENUNGGU_APPROVAL_BENDAHARA" },
    },
    include: {
      tagihan: {
        include: {
          siswa: {
            include: {
              kelas: { select: { name: true } },
              wali: {
                include: {
                  user: { select: { name: true } },
                },
              },
            },
          },
          jenisTagihan: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return pembayaran;
}
