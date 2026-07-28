// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Server Actions untuk Fitur Uang Saku Santri & POS Koperasi / Mart.
//            Fungsionalitas:
//            1. Topup Saldo Saku oleh Wali Murid (dengan verifikasi Admin/Bendahara).
//            2. Pengaturan Limit Harian Jajan oleh Wali Murid.
//            3. Transaksi Pembelian Kasir Koperasi dengan validasi Saldo Saku
//               & Limit Harian.
//            4. Notifikasi WhatsApp otomatis pada setiap topup & transaksi belanja.
// =========================================================================

"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification, notifyByRole } from "./notification";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { formatIDR } from "@/lib/utils";

// ========== WALI MURID: Submit Topup Saldo Saku ==========

export async function submitTopupSaku(data: {
  siswaId: string;
  nominal: number;
  buktiUrl?: string;
  catatanWali?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "WALIMURID") {
    throw new Error("Akses ditolak. Hanya Wali Murid yang dapat mengajukan isi saldo saku.");
  }

  if (data.nominal < 10000) {
    throw new Error("Nominal topup saku minimal Rp 10.000.");
  }

  // Validasi bahwa siswa adalah anak dari wali yang login
  const siswa = await prisma.siswa.findUnique({
    where: { id: data.siswaId },
    include: {
      wali: { select: { userId: true } },
    },
  });

  if (!siswa || siswa.wali.userId !== session.user.id) {
    throw new Error("Siswa tidak ditemukan atau bukan terhubung dengan akun Anda.");
  }

  const topup = await prisma.topupSaku.create({
    data: {
      siswaId: data.siswaId,
      nominal: data.nominal,
      buktiUrl: data.buktiUrl || null,
      catatanWali: data.catatanWali || null,
      status: "MENUNGGU_VERIFIKASI",
    },
  });

  // Notifikasi in-app ke Admin & Bendahara
  await notifyByRole(
    "ADMIN",
    "Pengajuan Topup Saku Baru",
    `Topup uang saku untuk ${siswa.name} sebesar ${formatIDR(data.nominal)} menunggu verifikasi.`
  );

  revalidatePath("/wali/dashboard");
  revalidatePath("/admin/dashboard");

  return { success: true, message: "Pengajuan topup uang saku berhasil dikirim.", topupId: topup.id };
}

// ========== ADMIN / BENDAHARA: Verifikasi Topup Saku ==========

export async function verifyTopupSaku(data: {
  topupId: string;
  action: "approve" | "reject";
  catatan?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "BENDAHARA"].includes(session.user.role)) {
    throw new Error("Akses ditolak. Hanya Admin atau Bendahara yang dapat memverifikasi topup.");
  }

  const topup = await prisma.topupSaku.findUnique({
    where: { id: data.topupId },
    include: {
      siswa: {
        include: {
          wali: {
            include: {
              user: { select: { id: true, phone: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!topup) {
    throw new Error("Data topup saku tidak ditemukan.");
  }

  if (topup.status !== "MENUNGGU_VERIFIKASI") {
    throw new Error("Topup ini sudah diproses sebelumnya.");
  }

  const siswa = topup.siswa;
  const waliUserId = siswa.wali.user.id;
  const waliPhone = siswa.wali.user.phone;
  const nominalFormat = formatIDR(topup.nominal.toString());

  if (data.action === "approve") {
    // Approve → Saldo siswa bertambah
    await prisma.$transaction([
      prisma.topupSaku.update({
        where: { id: data.topupId },
        data: {
          status: "BERHASIL",
          verifiedAt: new Date(),
          catatanAdmin: data.catatan || "Topup disetujui.",
        },
      }),
      prisma.siswa.update({
        where: { id: topup.siswaId },
        data: {
          saldoSaku: { increment: Number(topup.nominal) },
        },
      }),
    ]);

    // Ambil saldo terbaru untuk notifikasi
    const updatedSiswa = await prisma.siswa.findUnique({
      where: { id: topup.siswaId },
      select: { saldoSaku: true },
    });
    const sisaSaldo = updatedSiswa ? formatIDR(updatedSiswa.saldoSaku.toString()) : "Rp 0";

    // Notifikasi in-app ke Wali
    await createNotification(
      waliUserId,
      "Topup Saldo Saku Berhasil! 💳",
      `Topup sebesar ${nominalFormat} untuk ${siswa.name} telah disetujui. Saldo saku saat ini: ${sisaSaldo}.`
    );

    // WA ke Wali
    if (waliPhone) {
      sendWhatsAppMessage({
        targetPhone: waliPhone,
        message: `💳 Topup Uang Saku Berhasil!\n\nTopup sebesar ${nominalFormat} untuk santri ${siswa.name} telah disetujui.\n\nSisa Saldo Saku: ${sisaSaldo}\n\nTerima kasih. 🙏`,
      }).catch((err) => console.error("Gagal kirim WA:", err));
    }
  } else {
    // Reject → Topup Ditolak
    if (!data.catatan || data.catatan.trim().length === 0) {
      throw new Error("Alasan penolakan wajib diisi.");
    }

    await prisma.topupSaku.update({
      where: { id: data.topupId },
      data: {
        status: "DITOLAK",
        catatanAdmin: data.catatan,
      },
    });

    // Notifikasi in-app ke Wali
    await createNotification(
      waliUserId,
      "Topup Saldo Saku Ditolak",
      `Topup sebesar ${nominalFormat} untuk ${siswa.name} ditolak. Alasan: ${data.catatan}`
    );

    // WA ke Wali
    if (waliPhone) {
      sendWhatsAppMessage({
        targetPhone: waliPhone,
        message: `❌ Topup Uang Saku Ditolak\n\nTopup sebesar ${nominalFormat} untuk santri ${siswa.name} ditolak.\n\nAlasan: ${data.catatan}`,
      }).catch((err) => console.error("Gagal kirim WA:", err));
    }
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/bendahara/dashboard");
  revalidatePath("/wali/dashboard");

  return {
    success: true,
    message: data.action === "approve"
      ? "Topup disetujui. Saldo saku santri berhasil ditambahkan."
      : "Topup ditolak. Wali murid telah diberitahu.",
  };
}

// ========== WALI MURID: Update Limit Harian Jajan ==========

export async function updateLimitHarian(data: {
  siswaId: string;
  limitHarian: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "WALIMURID") {
    throw new Error("Akses ditolak. Hanya Wali Murid yang dapat mengatur limit harian.");
  }

  if (data.limitHarian < 0) {
    throw new Error("Limit harian tidak boleh negatif.");
  }

  const siswa = await prisma.siswa.findUnique({
    where: { id: data.siswaId },
    include: { wali: { select: { userId: true } } },
  });

  if (!siswa || siswa.wali.userId !== session.user.id) {
    throw new Error("Siswa tidak ditemukan atau bukan terhubung dengan akun Anda.");
  }

  const updated = await prisma.siswa.update({
    where: { id: data.siswaId },
    data: { limitHarian: data.limitHarian },
  });

  revalidatePath("/wali/dashboard");

  return {
    success: true,
    message: `Limit jajan harian ${siswa.name} diubah menjadi ${formatIDR(data.limitHarian)}/hari.`,
    updated,
  };
}

// ========== KASIR KOPERASI: Transaksi Belanja Santri ==========

export async function processTransaksiKoperasi(data: {
  nisn: string;
  totalBelanja: number;
  catatanBarang?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !["KOPERASI", "ADMIN"].includes(session.user.role)) {
    throw new Error("Akses ditolak. Hanya Kasir Koperasi atau Admin yang dapat memproses transaksi.");
  }

  if (data.totalBelanja <= 0) {
    throw new Error("Total belanja harus lebih dari Rp 0.");
  }

  const cleanNisn = data.nisn.trim();

  // Eksekusi seluruh alur validasi & update dalam SATU Interactive Transaction untuk cegah Race Condition
  return await prisma.$transaction(async (tx) => {
    // 1. Cari & Kunci data siswa
    const siswa = await tx.siswa.findUnique({
      where: { nisn: cleanNisn },
      include: {
        kelas: { select: { name: true } },
        wali: {
          include: {
            user: { select: { id: true, phone: true, name: true } },
          },
        },
      },
    });

    if (!siswa) {
      throw new Error(`Siswa dengan NISN "${cleanNisn}" tidak ditemukan.`);
    }

    const currentSaldo = Number(siswa.saldoSaku);
    const limitHarian = Number(siswa.limitHarian);

    // 2. Validasi Saldo Cukup
    if (currentSaldo < data.totalBelanja) {
      throw new Error(
        `Saldo saku ${siswa.name} tidak mencukupi (Saldo: ${formatIDR(currentSaldo)}, Belanja: ${formatIDR(data.totalBelanja)}).`
      );
    }

    // 3. Validasi Limit Harian Jajan
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayPurchases = await tx.transaksiKoperasi.aggregate({
      _sum: { totalBelanja: true },
      where: {
        siswaId: siswa.id,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const spentToday = todayPurchases._sum.totalBelanja
      ? Number(todayPurchases._sum.totalBelanja)
      : 0;

    if (spentToday + data.totalBelanja > limitHarian) {
      const remainingLimit = Math.max(0, limitHarian - spentToday);
      throw new Error(
        `Transaksi ditolak! Belanja melebihi limit harian ${siswa.name}.\nLimit Harian: ${formatIDR(limitHarian)}\nSudah Belanja Hari Ini: ${formatIDR(spentToday)}\nSisa Limit Hari Ini: ${formatIDR(remainingLimit)}`
      );
    }

    // 4. Catat Transaksi Koperasi
    const transaksi = await tx.transaksiKoperasi.create({
      data: {
        siswaId: siswa.id,
        kasirId: session.user.id,
        totalBelanja: data.totalBelanja,
        catatanBarang: data.catatanBarang || null,
      },
    });

    // 5. Potong Saldo Siswa
    const updatedSiswa = await tx.siswa.update({
      where: { id: siswa.id },
      data: {
        saldoSaku: { decrement: data.totalBelanja },
      },
    });

    const newSaldo = Number(updatedSiswa.saldoSaku);
    const sisaLimit = limitHarian - (spentToday + data.totalBelanja);
    const waliUserId = siswa.wali.user.id;
    const waliPhone = siswa.wali.user.phone;
    const totalBelanjaFormat = formatIDR(data.totalBelanja);

    // Notifikasi in-app ke Wali (async)
    createNotification(
      waliUserId,
      "Transaksi Koperasi Sekolah 🛒",
      `${siswa.name} telah berbelanja ${totalBelanjaFormat} di Koperasi (${data.catatanBarang || "Barang Koperasi"}). Sisa saldo: ${formatIDR(newSaldo)}.`
    ).catch((err) => console.error("Gagal buat notifikasi:", err));

    // Kirim WA Notifikasi ke Wali (async)
    if (waliPhone) {
      const itemsText = data.catatanBarang ? `\nBarang: ${data.catatanBarang}` : "";
      sendWhatsAppMessage({
        targetPhone: waliPhone,
        message: `🛒 Transaksi Koperasi / Mart Sekolah\n\nSantri: ${siswa.name} (${siswa.kelas.name})\nTotal Belanja: ${totalBelanjaFormat}${itemsText}\n\nSisa Saldo Saku: ${formatIDR(newSaldo)}\nSisa Limit Hari Ini: ${formatIDR(sisaLimit)}\n\nTerima kasih. 🙏`,
      }).catch((err) => console.error("Gagal kirim WA:", err));
    }

    revalidatePath("/koperasi/dashboard");
    revalidatePath("/wali/dashboard");

    return {
      success: true,
      message: `Transaksi belanja ${siswa.name} sebesar ${totalBelanjaFormat} berhasil diproses.`,
      transaksi,
      sisaSaldo: newSaldo,
      sisaLimit,
    };
  });
}

// ========== QUERIES RIWAYAT UANG SAKU & TOPUP ==========

export async function getRiwayatUangSaku(siswaId: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Tidak terautentikasi.");
  }

  // Jika role Wali, pastikan siswaId adalah anaknya
  if (session.user.role === "WALIMURID") {
    const isChild = await prisma.siswa.findFirst({
      where: {
        id: siswaId,
        wali: { userId: session.user.id },
      },
    });
    if (!isChild) {
      throw new Error("Akses ditolak. Anda tidak memiliki akses ke riwayat siswa ini.");
    }
  }

  const [topupList, belanjaList] = await Promise.all([
    prisma.topupSaku.findMany({
      where: { siswaId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.transaksiKoperasi.findMany({
      where: { siswaId },
      include: { kasir: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return { topupList, belanjaList };
}

export async function getTopupListForVerification() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "BENDAHARA"].includes(session.user.role)) {
    throw new Error("Akses ditolak.");
  }

  const topups = await prisma.topupSaku.findMany({
    where: { status: "MENUNGGU_VERIFIKASI" },
    include: {
      siswa: {
        include: {
          kelas: { select: { name: true } },
          wali: {
            include: {
              user: { select: { name: true, phone: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return topups;
}

// ========== ADMIN FULL CONTROL: TOPUP TUNAI DI MEJA TU ==========

export async function adminTopUpCash(data: {
  siswaId: string;
  nominal: number;
  catatan?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak. Hanya Admin yang dapat memproses topup tunai.");
  }

  if (data.nominal <= 0) {
    throw new Error("Nominal topup tunai harus lebih dari 0.");
  }

  return await prisma.$transaction(async (tx) => {
    const siswa = await tx.siswa.findUnique({
      where: { id: data.siswaId },
      include: {
        wali: {
          include: { user: { select: { id: true, name: true, phone: true } } },
        },
        kelas: { select: { name: true } },
      },
    });

    if (!siswa) {
      throw new Error("Data santri tidak ditemukan.");
    }

    const prevSaldo = Number(siswa.saldoSaku);
    const newSaldo = prevSaldo + data.nominal;

    // Update Saldo Santri
    await tx.siswa.update({
      where: { id: data.siswaId },
      data: { saldoSaku: newSaldo },
    });

    // Buat Topup Record
    const topup = await (tx as any).topupSaku.create({
      data: {
        siswaId: data.siswaId,
        nominal: data.nominal,
        buktiUrl: "/uploads/topup_cash_tu.png",
        status: "BERHASIL",
        catatan: data.catatan || "Top-up Tunai di Kasir Meja TU.",
      },
    });

    // Catat AuditLog
    await (tx as any).auditLog.create({
      data: {
        userId: session.user.id,
        action: "TOPUP_CASH_TU",
        entityType: "TopupSaku",
        entityId: topup.id,
        details: JSON.stringify({
          siswaId: data.siswaId,
          nominal: data.nominal,
          newSaldo,
        }),
      },
    });

    const nominalFormat = formatIDR(data.nominal);
    const waliUserId = siswa.wali.user.id;
    const waliPhone = siswa.wali.user.phone;

    // In-app Notification
    createNotification(
      waliUserId,
      "💵 Top-up Tunai Berhasil",
      `Top-up Saku Santri tunai di TU untuk ${siswa.name} (${nominalFormat}) telah berhasil. Saldo baru: ${formatIDR(newSaldo)}.`
    ).catch(() => {});

    // WA Notification
    if (waliPhone) {
      sendWhatsAppMessage({
        targetPhone: waliPhone,
        message: `💵 TOP-UP SAKU SANTRI TUNAI (TU)\n\nSantri: ${siswa.name} (${siswa.kelas.name})\nNominal Top-up: ${nominalFormat}\nSaldo Saku Terbaru: ${formatIDR(newSaldo)}\n\nTerima kasih. 🙏`,
      }).catch((err) => console.error("Gagal kirim WA:", err));
    }

    revalidatePath("/admin/santri");
    revalidatePath("/wali/dashboard");

    return {
      success: true,
      message: `Top-up tunai ${nominalFormat} untuk ${siswa.name} berhasil dicatat. Saldo baru: ${formatIDR(newSaldo)}.`,
      newSaldo,
    };
  });
}

// ========== ADMIN FULL CONTROL: UBAH LIMIT JAJAN HARIAN ==========

export async function adminUpdateLimitHarian(siswaId: string, limitHarian: number) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak. Hanya Admin yang dapat mengubah limit harian.");
  }

  if (limitHarian < 0) {
    throw new Error("Limit harian tidak boleh kurang dari 0.");
  }

  const updatedSiswa = await prisma.siswa.update({
    where: { id: siswaId },
    data: { limitHarian },
  });

  // AuditLog
  await (prisma as any).auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE_LIMIT_HARIAN",
      entityType: "Siswa",
      entityId: siswaId,
      details: JSON.stringify({ limitHarian }),
    },
  });

  revalidatePath("/admin/santri");
  revalidatePath("/koperasi/dashboard");
  revalidatePath("/wali/dashboard");

  return updatedSiswa;
}
