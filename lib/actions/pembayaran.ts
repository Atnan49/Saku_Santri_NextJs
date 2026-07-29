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
  nominalDisetor?: number;
  catatanWali?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "WALIMURID") {
    throw new Error("Akses ditolak. Hanya Wali Murid yang dapat mengunggah bukti bayar.");
  }

  if (!data.buktiUrl || data.buktiUrl.trim().length === 0) {
    throw new Error("Bukti pembayaran (gambar/PDF) wajib diunggah.");
  }

  // Ambil data tagihan beserta relasi siswa dan wali
  const tagihan = await (prisma as any).tagihan.findUnique({
    where: { id: data.tagihanId },
    include: {
      siswa: {
        include: {
          wali: { select: { id: true, userId: true } },
        },
      },
      jenisTagihan: { select: { name: true } },
    },
  });

  if (!tagihan) {
    throw new Error("Tagihan tidak ditemukan.");
  }

  // Validasi bahwa tagihan milik anak dari wali yang login
  if (tagihan.siswa.wali.userId !== session.user.id) {
    throw new Error("Anda tidak memiliki akses ke tagihan ini.");
  }

  const sisaWajibBayar = Math.max(0, Number(tagihan.nominalAkhir) - Number(tagihan.nominalTerbayar || 0));
  if (sisaWajibBayar <= 0 || tagihan.status === "LUNAS") {
    throw new Error("Tagihan ini sudah LUNAS.");
  }

  const setoran = data.nominalDisetor && data.nominalDisetor > 0 ? data.nominalDisetor : sisaWajibBayar;
  if (setoran > sisaWajibBayar) {
    throw new Error(`Nominal setoran (Rp ${setoran.toLocaleString("id-ID")}) melebihi sisa sisa tagihan (Rp ${sisaWajibBayar.toLocaleString("id-ID")}).`);
  }

  // Validasi status tagihan
  const allowedStatuses = ["BELUM_BAYAR", "DIBAYAR_SEBAGIAN", "DITOLAK_ADMIN", "DITOLAK_BENDAHARA"];
  if (!allowedStatuses.includes(tagihan.status)) {
    throw new Error(
      `Tagihan ini sedang dalam proses verifikasi/approval (${tagihan.status}).`
    );
  }

  // Buat record pembayaran baru
  await (prisma as any).pembayaran.create({
    data: {
      tagihanId: data.tagihanId,
      nominalDisetor: setoran,
      buktiUrl: data.buktiUrl,
      catatanWali: data.catatanWali || null,
    },
  });

  // Update status tagihan
  await (prisma as any).tagihan.update({
    where: { id: data.tagihanId },
    data: { status: "MENUNGGU_VERIFIKASI_ADMIN" },
  });

  // Notifikasi ke semua ADMIN
  await notifyByRole(
    "ADMIN",
    "Bukti Pembayaran Baru",
    `${tagihan.siswa.name} telah mengunggah bukti pembayaran ${formatIDR(setoran)} untuk ${tagihan.jenisTagihan.name}. Silakan verifikasi.`
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

  const pembayaran = await (prisma as any).pembayaran.findUnique({
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
    // Pastikan ada bukti transfer
    if (!pembayaran.buktiUrl) {
      throw new Error("Tidak dapat menyetujui pembayaran tanpa bukti transfer.");
    }

    // Approve → lanjut ke Tahap 2 (Bendahara)
    await (prisma as any).pembayaran.update({
      where: { id: data.pembayaranId },
      data: {
        verifiedAt: new Date(),
        verifiedByUserId: session.user.id,
        catatanAdmin: data.catatan || "Diverifikasi oleh Admin TU.",
      },
    });

    await (prisma as any).tagihan.update({
      where: { id: pembayaran.tagihanId },
      data: { status: "MENUNGGU_APPROVAL_BENDAHARA" },
    });

    // Catat AuditLog
    await (prisma as any).auditLog.create({
      data: {
        userId: session.user.id,
        action: "VERIFY_PAYMENT_ADMIN",
        entityType: "Pembayaran",
        entityId: pembayaran.id,
        details: JSON.stringify({ tagihanId: pembayaran.tagihanId, setoran: Number(pembayaran.nominalDisetor) }),
      },
    });

    // Notifikasi ke Bendahara
    await notifyByRole(
      "BENDAHARA",
      "Menunggu Approval Final",
      `Pembayaran ${jenisName} (${formatIDR(Number(pembayaran.nominalDisetor))}) dari ${siswa.name} (${siswa.kelas.name}) telah diverifikasi Admin. Menunggu persetujuan Anda.`
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

    await (prisma as any).pembayaran.update({
      where: { id: data.pembayaranId },
      data: {
        catatanAdmin: data.catatan,
      },
    });

    await (prisma as any).tagihan.update({
      where: { id: pembayaran.tagihanId },
      data: { status: "DITOLAK_ADMIN" },
    });

    // Catat AuditLog
    await (prisma as any).auditLog.create({
      data: {
        userId: session.user.id,
        action: "REJECT_PAYMENT_ADMIN",
        entityType: "Pembayaran",
        entityId: pembayaran.id,
        details: JSON.stringify({ reason: data.catatan }),
      },
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

  const pembayaran = await (prisma as any).pembayaran.findUnique({
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

  const tagihan = pembayaran.tagihan;
  const siswa = tagihan.siswa;
  const waliPhone = siswa.wali.user.phone;
  const waliUserId = siswa.wali.user.id;
  const jenisName = tagihan.jenisTagihan.name;

  if (data.action === "approve") {
    const disetor = Number(pembayaran.nominalDisetor);
    const prevTerbayar = Number(tagihan.nominalTerbayar || 0);
    const nominalAkhir = Number(tagihan.nominalAkhir);
    const newTerbayar = prevTerbayar + disetor;

    const isFullyPaid = newTerbayar >= nominalAkhir;
    const finalStatus = isFullyPaid ? "LUNAS" : "DIBAYAR_SEBAGIAN";

    // Approve final
    await (prisma as any).pembayaran.update({
      where: { id: data.pembayaranId },
      data: {
        approvedAt: new Date(),
        approvedByUserId: session.user.id,
        catatanBendahara: data.catatan || "Disetujui oleh Bendahara.",
      },
    });

    await (prisma as any).tagihan.update({
      where: { id: tagihan.id },
      data: {
        nominalTerbayar: newTerbayar,
        status: finalStatus,
      },
    });

    // AuditLog
    await (prisma as any).auditLog.create({
      data: {
        userId: session.user.id,
        action: "APPROVE_PAYMENT_BENDAHARA",
        entityType: "Pembayaran",
        entityId: pembayaran.id,
        details: JSON.stringify({
          tagihanId: tagihan.id,
          disetor,
          totalTerbayar: newTerbayar,
          finalStatus,
        }),
      },
    });

    const setoranFormat = formatIDR(disetor);

    // Notifikasi ke Wali
    await createNotification(
      waliUserId,
      isFullyPaid ? "🎉 Pembayaran LUNAS!" : "💳 Pembayaran Cicilan Disetujui",
      isFullyPaid
        ? `Pembayaran ${jenisName} sebesar ${setoranFormat} untuk ${siswa.name} telah disetujui dan berstatus LUNAS. Terima kasih!`
        : `Pembayaran cicilan ${jenisName} sebesar ${setoranFormat} untuk ${siswa.name} telah disetujui. Sisa tagihan: ${formatIDR(nominalAkhir - newTerbayar)}.`
    );

    // Notifikasi ke Admin
    await notifyByRole(
      "ADMIN",
      isFullyPaid ? "Pembayaran Lunas" : "Pembayaran Parsial Disetujui",
      `Pembayaran ${jenisName} dari ${siswa.name} (${setoranFormat}) telah disetujui Bendahara.`
    );

    // WA ke Wali
    if (waliPhone) {
      const waMsg = isFullyPaid
        ? `🎉 Alhamdulillah! Pembayaran ${jenisName} sebesar ${setoranFormat} untuk ${siswa.name} telah LUNAS.\n\nTerima kasih atas pembayaran Anda. Kwitansi dapat diunduh melalui aplikasi Saku Santri. 🙏`
        : `💳 Pembayaran Cicilan Disetujui!\n\nPembayaran ${jenisName} sebesar ${setoranFormat} untuk ${siswa.name} telah diterima.\nTotal Terbayar: ${formatIDR(newTerbayar)} dari ${formatIDR(nominalAkhir)}\nSisa Tagihan: ${formatIDR(nominalAkhir - newTerbayar)}\n\nTerima kasih. 🙏`;

      sendWhatsAppMessage({
        targetPhone: waliPhone,
        message: waMsg,
      }).catch((err) => console.error("Gagal kirim WA:", err));
    }
  } else {
    // Reject → kembali ke Wali (jika belum pernah bayar) atau DIBAYAR_SEBAGIAN (jika sudah ada terbayar)
    if (!data.catatan || data.catatan.trim().length === 0) {
      throw new Error("Alasan penolakan wajib diisi.");
    }

    const prevTerbayar = Number(tagihan.nominalTerbayar || 0);
    const rollbackStatus = prevTerbayar > 0 ? "DIBAYAR_SEBAGIAN" : "DITOLAK_BENDAHARA";

    await (prisma as any).pembayaran.update({
      where: { id: data.pembayaranId },
      data: {
        catatanBendahara: data.catatan,
      },
    });

    await (prisma as any).tagihan.update({
      where: { id: tagihan.id },
      data: { status: rollbackStatus },
    });

    // AuditLog
    await (prisma as any).auditLog.create({
      data: {
        userId: session.user.id,
        action: "REJECT_PAYMENT_BENDAHARA",
        entityType: "Pembayaran",
        entityId: pembayaran.id,
        details: JSON.stringify({ reason: data.catatan }),
      },
    });

    // Notifikasi ke Wali
    await createNotification(
      waliUserId,
      "Pembayaran Ditolak (Bendahara)",
      `Pembayaran ${jenisName} untuk ${siswa.name} ditolak oleh Bendahara. Alasan: ${data.catatan}. Silakan hubungi pihak sekolah.`
    );

    // Notifikasi ke Admin
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
      ? "Pembayaran disetujui."
      : "Pembayaran ditolak. Wali murid akan diberitahu.",
  };
}

export async function bendaharaApproveBulkPayments(pembayaranIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "BENDAHARA") {
    throw new Error("Akses ditolak. Hanya Bendahara yang dapat menyetujui pembayaran.");
  }

  if (!pembayaranIds || pembayaranIds.length === 0) {
    throw new Error("Pilih minimal 1 pembayaran untuk disetujui.");
  }

  let count = 0;
  for (const id of pembayaranIds) {
    try {
      await bendaharaApprovePayment({
        pembayaranId: id,
        action: "approve",
        catatan: "Disetujui secara massal oleh Bendahara.",
      });
      count++;
    } catch (err) {
      console.error(`Gagal approve pembayaran ID ${id}:`, err);
    }
  }

  revalidatePath("/bendahara/approval");
  revalidatePath("/bendahara/dashboard");
  revalidatePath("/admin/dashboard");
  revalidatePath("/wali/dashboard");

  return { success: true, count };
}

// ========== QUERIES untuk Halaman Verifikasi & Approval ==========

export async function getPembayaranForAdminVerification() {
  const pembayaran = await prisma.pembayaran.findMany({
    where: {
      tagihan: { status: "MENUNGGU_VERIFIKASI_ADMIN" },
      verifiedAt: null,
      catatanAdmin: null,
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
    orderBy: { createdAt: "desc" },
  });

  // Ambil hanya 1 record bukti pembayaran terbaru untuk setiap tagihanId
  const latestMap = new Map<string, typeof pembayaran[0]>();
  for (const item of pembayaran) {
    if (!latestMap.has(item.tagihanId)) {
      latestMap.set(item.tagihanId, item);
    }
  }

  return Array.from(latestMap.values());
}

export async function getPembayaranForBendaharaApproval() {
  const pembayaran = await prisma.pembayaran.findMany({
    where: {
      tagihan: { status: "MENUNGGU_APPROVAL_BENDAHARA" },
      approvedAt: null,
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
    orderBy: { createdAt: "desc" },
  });

  // Ambil hanya 1 record bukti pembayaran terbaru untuk setiap tagihanId
  const latestMap = new Map<string, typeof pembayaran[0]>();
  for (const item of pembayaran) {
    if (!latestMap.has(item.tagihanId)) {
      latestMap.set(item.tagihanId, item);
    }
  }

  return Array.from(latestMap.values());
}

// ========== SEARCH & FETCH PAID RECEIPTS (UNTUK CETAK KWITANSI) ==========

export async function searchKwitansi(query?: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Anda harus login untuk mencari kwitansi.");
  }

  const whereClause: any = {
    tagihan: {
      status: "LUNAS",
    },
  };

  if (query && query.trim().length > 0) {
    const q = query.trim();
    whereClause.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { tagihan: { siswa: { name: { contains: q, mode: "insensitive" } } } },
      { tagihan: { siswa: { wali: { user: { name: { contains: q, mode: "insensitive" } } } } } },
      { tagihan: { jenisTagihan: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const list = await (prisma as any).pembayaran.findMany({
    where: whereClause,
    include: {
      tagihan: {
        include: {
          siswa: {
            include: {
              kelas: true,
              wali: {
                include: {
                  user: { select: { name: true, phone: true } },
                },
              },
            },
          },
          jenisTagihan: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return list.map((p: any) => ({
    pembayaranId: p.id,
    receiptNo: `KW-${p.id.slice(-6).toUpperCase()}`,
    date: p.approvedAt ? new Date(p.approvedAt).toISOString().split("T")[0] : new Date(p.createdAt).toISOString().split("T")[0],
    receivedFrom: p.tagihan?.siswa?.wali?.user?.name || "Wali Santri",
    studentName: p.tagihan?.siswa?.name || "Santri",
    studentClass: p.tagihan?.siswa?.kelas?.name || "-",
    amount: Number(p.nominalDisetor || p.tagihan?.nominalAkhir) || 0,
    paymentFor: p.tagihan?.jenisTagihan?.name || "SPP Bulanan",
    verifiedBy: "Bendahara / Admin TU",
    paymentMethod: p.catatanWali || "Bank Transfer / Tunai",
  }));
}
