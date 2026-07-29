// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Server Actions untuk Billing Engine — penagihan SPP bulanan
//            otomatis dan tagihan kegiatan/tahunan manual.
//            Termasuk logika kalkulasi potongan beasiswa siswa dan
//            pencegahan tagihan duplikat per periode.
// =========================================================================

"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyByRole, createNotification } from "./notification";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak. Hanya ADMIN yang dapat melakukan operasi ini.");
  }
  return session;
}

// ========== READ ==========

export async function getTagihanList(filters?: {
  status?: string;
  kelasId?: string;
  siswaId?: string;
  tahunAjaranId?: string;
  period?: string;
}) {
  const where: any = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.siswaId) where.siswaId = filters.siswaId;
  if (filters?.tahunAjaranId) where.tahunAjaranId = filters.tahunAjaranId;
  if (filters?.period) where.period = filters.period;
  if (filters?.kelasId) {
    where.siswa = { kelasId: filters.kelasId };
  }

  const tagihanList = await prisma.tagihan.findMany({
    where,
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
      jenisTagihan: { select: { name: true, type: true } },
      tahunAjaran: { select: { year: true } },
      pembayaran: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return tagihanList;
}

export async function getTagihanById(id: string) {
  const tagihan = await prisma.tagihan.findUnique({
    where: { id },
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
      tahunAjaran: true,
      pembayaran: true,
    },
  });

  return tagihan;
}

// ========== GENERATE SPP BULANAN OTOMATIS ==========

export async function generateMonthlyBills(data: {
  jenisTagihanId: string;
  tahunAjaranId: string;
  period: string; // Format: "YYYY-MM"
  dueDate: string; // ISO date string
}) {
  await requireAdmin();

  // Validasi format periode
  const periodPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!periodPattern.test(data.period)) {
    throw new Error('Format periode harus "YYYY-MM" (contoh: "2025-09").');
  }

  // Ambil jenis tagihan
  const jenisTagihan = await prisma.jenisTagihan.findUnique({
    where: { id: data.jenisTagihanId },
  });
  if (!jenisTagihan) {
    throw new Error("Jenis tagihan tidak ditemukan.");
  }

  // Validasi tahun ajaran
  const tahunAjaran = await prisma.tahunAjaran.findUnique({
    where: { id: data.tahunAjaranId },
  });
  if (!tahunAjaran) {
    throw new Error("Tahun ajaran tidak ditemukan.");
  }

  // Ambil semua siswa AKTIF sahaja
  const allSiswa: any[] = await (prisma as any).siswa.findMany({
    where: { status: "AKTIF" },
    include: {
      wali: {
        include: {
          user: { select: { id: true, phone: true, name: true } },
        },
      },
    },
  });

  if (allSiswa.length === 0) {
    throw new Error("Tidak ada siswa AKTIF terdaftar di database.");
  }

  // Cek tagihan duplikat untuk periode ini
  const existingBills = await prisma.tagihan.findMany({
    where: {
      jenisTagihanId: data.jenisTagihanId,
      tahunAjaranId: data.tahunAjaranId,
      period: data.period,
    },
    select: { siswaId: true },
  });

  const existingSiswaIds = new Set(existingBills.map((b: any) => b.siswaId));

  // Filter siswa yang belum memiliki tagihan untuk periode ini
  const siswaToGenerate = allSiswa.filter((s: any) => !existingSiswaIds.has(s.id));

  if (siswaToGenerate.length === 0) {
    throw new Error(
      `Semua siswa aktif sudah memiliki tagihan ${jenisTagihan.name} untuk periode ${data.period}.`
    );
  }

  const nominalAwalNum = Number(jenisTagihan.nominal);
  const dueDate = new Date(data.dueDate);
  const isBulanan = jenisTagihan.type === "BULANAN";

  // Buat data tagihan untuk setiap siswa
  const tagihanData = siswaToGenerate.map((siswa: any) => {
    // Potongan beasiswa HANYA berlaku untuk jenis tagihan BULANAN
    const potonganNum = isBulanan ? Number(siswa.potonganTetap) : 0;
    const nominalAkhirNum = Math.max(0, nominalAwalNum - potonganNum);
    const autoLunas = nominalAkhirNum === 0;

    return {
      siswaId: siswa.id,
      jenisTagihanId: data.jenisTagihanId,
      tahunAjaranId: data.tahunAjaranId,
      nominalAwal: nominalAwalNum,
      potongan: potonganNum,
      nominalAkhir: nominalAkhirNum,
      nominalTerbayar: autoLunas ? nominalAwalNum : 0,
      dueDate,
      period: data.period,
      status: autoLunas ? ("LUNAS" as const) : ("BELUM_BAYAR" as const),
      catatanTagihan: autoLunas
        ? "Lunas otomatis (Beasiswa 100%)"
        : potonganNum > 0
        ? `Potongan beasiswa: Rp ${potonganNum.toLocaleString("id-ID")}`
        : null,
    };
  });

  // Bulk create tagihan
  const result = await prisma.tagihan.createMany({
    data: tagihanData,
  });

  // Kirim notifikasi WhatsApp ke setiap wali murid (non-blocking)
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const [year, month] = data.period.split("-");
  const monthName = monthNames[parseInt(month) - 1];

  // Group siswa by wali untuk menghindari pengiriman WA ganda
  const waliMap = new Map<string, { phone: string; userId: string; anakNames: string[] }>();
  for (const siswa of siswaToGenerate) {
    const phone = siswa.wali?.user?.phone;
    const userId = siswa.wali?.user?.id;
    if (phone && userId) {
      const key = phone;
      if (!waliMap.has(key)) {
        waliMap.set(key, { phone, userId, anakNames: [] });
      }
      waliMap.get(key)!.anakNames.push(siswa.name);
    }
  }

  // Kirim WA & notifikasi in-app (async, non-blocking)
  for (const [, waliInfo] of waliMap) {
    const anakList = waliInfo.anakNames.join(", ");
    const waMessage = `Assalamu'alaikum, Wr. Wb.\n\nInformasi tagihan ${jenisTagihan.name} periode ${monthName} ${year} telah diterbitkan untuk: ${anakList}.\n\nSilakan cek aplikasi Saku Santri untuk detail dan pembayaran.\n\nTerima kasih. 🙏`;

    sendWhatsAppMessage({
      targetPhone: waliInfo.phone,
      message: waMessage,
    }).catch((err) => console.error("Gagal kirim WA:", err));

    createNotification(
      waliInfo.userId,
      `Tagihan Baru: ${jenisTagihan.name}`,
      `Tagihan ${jenisTagihan.name} periode ${monthName} ${year} telah diterbitkan untuk ${anakList}.`
    ).catch((err) => console.error("Gagal buat notifikasi:", err));
  }

  revalidatePath("/admin/tagihan");
  revalidatePath("/admin/dashboard");
  revalidatePath("/wali/dashboard");

  return {
    success: true,
    generated: result.count,
    skipped: existingSiswaIds.size,
    message: `${result.count} tagihan berhasil digenerate. ${existingSiswaIds.size} siswa dilewati (sudah ada tagihan).`,
  };
}

// ========== TAGIHAN MANUAL (KEGIATAN/TAHUNAN) ==========

export async function createManualBill(data: {
  siswaIds: string[]; // Bisa 1 atau banyak siswa
  jenisTagihanId: string;
  tahunAjaranId: string;
  nominalAwal: number;
  dueDate: string;
  period?: string;
  catatanTagihan?: string;
}) {
  await requireAdmin();

  if (data.siswaIds.length === 0) {
    throw new Error("Pilih minimal 1 siswa.");
  }

  if (data.nominalAwal <= 0) {
    throw new Error("Nominal tagihan harus lebih dari 0.");
  }

  const jenisTagihan = await prisma.jenisTagihan.findUnique({
    where: { id: data.jenisTagihanId },
  });
  if (!jenisTagihan) {
    throw new Error("Jenis tagihan tidak ditemukan.");
  }

  const dueDate = new Date(data.dueDate);
  const nominalAwalNum = data.nominalAwal;
  const isBulanan = jenisTagihan.type === "BULANAN";

  // Cek duplikasi tagihan manual untuk siswa-siswa ini jika ada periode
  const existingBills = data.period
    ? await prisma.tagihan.findMany({
        where: {
          jenisTagihanId: data.jenisTagihanId,
          tahunAjaranId: data.tahunAjaranId,
          period: data.period,
          siswaId: { in: data.siswaIds },
        },
        select: { siswaId: true },
      })
    : [];

  const existingSiswaIds = new Set(existingBills.map((b: any) => b.siswaId));
  const targetSiswaIds = data.siswaIds.filter((id) => !existingSiswaIds.has(id));

  if (targetSiswaIds.length === 0) {
    throw new Error("Semua siswa yang dipilih sudah memiliki tagihan ini untuk periode tersebut.");
  }

  // Ambil data siswa
  const siswaList = await prisma.siswa.findMany({
    where: { id: { in: targetSiswaIds } },
  });

  const tagihanData = siswaList.map((siswa: any) => {
    // Beasiswa hanya memotong jika jenis tagihan adalah BULANAN
    const potonganNum = isBulanan ? Number(siswa.potonganTetap) : 0;
    const nominalAkhirNum = Math.max(0, nominalAwalNum - potonganNum);
    const autoLunas = nominalAkhirNum === 0;

    return {
      siswaId: siswa.id,
      jenisTagihanId: data.jenisTagihanId,
      tahunAjaranId: data.tahunAjaranId,
      nominalAwal: nominalAwalNum,
      potongan: potonganNum,
      nominalAkhir: nominalAkhirNum,
      nominalTerbayar: autoLunas ? nominalAwalNum : 0,
      dueDate,
      period: data.period || "",
      catatanTagihan: data.catatanTagihan || null,
      status: autoLunas ? ("LUNAS" as const) : ("BELUM_BAYAR" as const),
    };
  });

  const result = await prisma.tagihan.createMany({
    data: tagihanData,
  });

  revalidatePath("/admin/tagihan");
  revalidatePath("/admin/dashboard");

  return {
    success: true,
    generated: result.count,
    skipped: existingSiswaIds.size,
    message: `${result.count} tagihan manual berhasil dibuat. ${existingSiswaIds.size > 0 ? `${existingSiswaIds.size} dilewati (sudah ada).` : ""}`,
  };
}

// ========== UPDATE TAGIHAN ==========

export async function updateTagihan(
  id: string,
  data: {
    nominalAwal?: number;
    potongan?: number;
    dueDate?: string;
    catatanTagihan?: string;
  }
) {
  await requireAdmin();

  const tagihan = await prisma.tagihan.findUnique({ where: { id } });
  if (!tagihan) {
    throw new Error("Tagihan tidak ditemukan.");
  }

  if (tagihan.status !== "BELUM_BAYAR") {
    throw new Error("Hanya tagihan berstatus BELUM BAYAR yang dapat diedit.");
  }

  const updateData: any = {};

  if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
  if (data.catatanTagihan !== undefined) updateData.catatanTagihan = data.catatanTagihan;

  if (data.nominalAwal !== undefined || data.potongan !== undefined) {
    const nominalAwalNum = data.nominalAwal !== undefined
      ? data.nominalAwal
      : Number(tagihan.nominalAwal);
    const potonganNum = data.potongan !== undefined
      ? data.potongan
      : Number(tagihan.potongan);

    const nominalAkhirNum = Math.max(0, nominalAwalNum - potonganNum);

    updateData.nominalAwal = nominalAwalNum;
    updateData.potongan = potonganNum;
    updateData.nominalAkhir = nominalAkhirNum;
  }

  const updated = await prisma.tagihan.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/tagihan");
  return updated;
}

// ========== DELETE TAGIHAN ==========

export async function deleteTagihan(id: string) {
  await requireAdmin();

  const tagihan = await prisma.tagihan.findUnique({
    where: { id },
    include: { pembayaran: true },
  });

  if (!tagihan) {
    throw new Error("Tagihan tidak ditemukan.");
  }

  if (tagihan.status !== "BELUM_BAYAR") {
    throw new Error("Hanya tagihan berstatus BELUM BAYAR yang dapat dihapus.");
  }

  // Hapus semua pembayaran terkait jika ada
  await prisma.pembayaran.deleteMany({
    where: { tagihanId: id },
  });

  await prisma.tagihan.delete({
    where: { id },
  });

  revalidatePath("/admin/tagihan");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

// ========== ADMIN FULL CONTROL: DIRECT CASH PAYMENT (MEJA TU) ==========

export async function adminDirectCashPayment(data: {
  tagihanId: string;
  nominalSetoran: number;
  catatan?: string;
}) {
  const session = await requireAdmin();

  if (data.nominalSetoran <= 0) {
    throw new Error("Nominal setoran tunai harus lebih dari 0.");
  }

  const tagihan = await (prisma as any).tagihan.findUnique({
    where: { id: data.tagihanId },
    include: {
      siswa: {
        include: {
          wali: { include: { user: { select: { id: true, name: true, phone: true } } } },
          kelas: { select: { name: true } },
        },
      },
      jenisTagihan: { select: { name: true } },
    },
  });

  if (!tagihan) {
    throw new Error("Tagihan tidak ditemukan.");
  }

  const nominalAkhir = Number(tagihan.nominalAkhir);
  const prevTerbayar = Number(tagihan.nominalTerbayar || 0);
  const sisa = Math.max(0, nominalAkhir - prevTerbayar);

  if (sisa <= 0 || tagihan.status === "LUNAS") {
    throw new Error("Tagihan ini sudah LUNAS.");
  }

  if (data.nominalSetoran > sisa) {
    throw new Error(`Nominal setoran (Rp ${data.nominalSetoran.toLocaleString("id-ID")}) melebihi sisa tagihan (Rp ${sisa.toLocaleString("id-ID")}).`);
  }

  const newTerbayar = prevTerbayar + data.nominalSetoran;
  const isFullyPaid = newTerbayar >= nominalAkhir;
  const finalStatus = isFullyPaid ? "LUNAS" : "DIBAYAR_SEBAGIAN";

  // Buat record pembayaran langsung LUNAS/Verified
  const pembayaran = await (prisma as any).pembayaran.create({
    data: {
      tagihanId: data.tagihanId,
      nominalDisetor: data.nominalSetoran,
      buktiUrl: "/uploads/cash_tu.png", // Marker pembayaran tunai TU
      catatanWali: "Pembayaran Tunai di Kasir TU",
      catatanAdmin: data.catatan || "Setoran Tunai di Kantor Tata Usaha.",
      catatanBendahara: "Disetujui oleh Admin TU (Setoran Tunai).",
      verifiedAt: new Date(),
      verifiedByUserId: session.user.id,
      approvedAt: new Date(),
      approvedByUserId: session.user.id,
    },
  });

  // Update tagihan
  await (prisma as any).tagihan.update({
    where: { id: data.tagihanId },
    data: {
      nominalTerbayar: newTerbayar,
      status: finalStatus,
    },
  });

  // Audit Log
  await (prisma as any).auditLog.create({
    data: {
      userId: session.user.id,
      action: "CASH_PAYMENT_TU",
      entityType: "Tagihan",
      entityId: tagihan.id,
      details: JSON.stringify({
        nominalSetoran: data.nominalSetoran,
        newTerbayar,
        finalStatus,
        catatan: data.catatan,
      }),
    },
  });

  revalidatePath("/admin/tagihan");
  revalidatePath("/admin/dashboard");
  revalidatePath("/bendahara/approval");
  revalidatePath("/bendahara/dashboard");
  revalidatePath("/wali/dashboard");

  return {
    success: true,
    message: isFullyPaid
      ? "Pembayaran tunai berhasil dicatat. Tagihan berstatus LUNAS!"
      : `Pembayaran tunai Rp ${data.nominalSetoran.toLocaleString("id-ID")} berhasil dicatat (Cicilan).`,
    pembayaranId: pembayaran.id,
  };
}

// ========== ADMIN FULL CONTROL: UPDATE BILL DETAILS ==========

export async function adminUpdateBill(
  id: string,
  data: {
    nominalAkhir?: number;
    dueDate?: string;
    period?: string;
    catatanTagihan?: string;
  }
) {
  const session = await requireAdmin();

  const tagihan = await (prisma as any).tagihan.findUnique({
    where: { id },
  });

  if (!tagihan) {
    throw new Error("Tagihan tidak ditemukan.");
  }

  const updateData: any = {};
  if (data.nominalAkhir !== undefined) {
    if (data.nominalAkhir < 0) throw new Error("Nominal tagihan tidak boleh negatif.");
    updateData.nominalAkhir = data.nominalAkhir;
    
    // Perbarui status jika nominal terbayar sudah mencukupi
    const terbayar = Number(tagihan.nominalTerbayar || 0);
    if (terbayar >= data.nominalAkhir && data.nominalAkhir > 0) {
      updateData.status = "LUNAS";
    }
  }

  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
  if (data.period) updateData.period = data.period.trim();
  if (data.catatanTagihan !== undefined) updateData.catatanTagihan = data.catatanTagihan.trim();

  const updatedBill = await (prisma as any).tagihan.update({
    where: { id },
    data: updateData,
  });

  // Audit Log
  await (prisma as any).auditLog.create({
    data: {
      userId: session.user.id,
      action: "EDIT_BILL",
      entityType: "Tagihan",
      entityId: id,
      details: JSON.stringify(updateData),
    },
  });

  revalidatePath("/admin/tagihan");
  revalidatePath("/admin/dashboard");
  revalidatePath("/wali/dashboard");

  return updatedBill;
}

// ========== ADMIN FULL CONTROL: VOID / CANCEL BILL ==========

export async function adminVoidBill(id: string, alasan: string) {
  const session = await requireAdmin();

  if (!alasan || alasan.trim().length === 0) {
    throw new Error("Alasan pembatalan tagihan wajib diisi.");
  }

  const tagihan = await (prisma as any).tagihan.findUnique({
    where: { id },
    include: { pembayaran: true },
  });

  if (!tagihan) {
    throw new Error("Tagihan tidak ditemukan.");
  }

  // Audit log sebelum menghapus
  await (prisma as any).auditLog.create({
    data: {
      userId: session.user.id,
      action: "VOID_BILL",
      entityType: "Tagihan",
      entityId: id,
      details: JSON.stringify({
        alasan,
        tagihanDetails: {
          siswaId: tagihan.siswaId,
          nominalAkhir: Number(tagihan.nominalAkhir),
          status: tagihan.status,
        },
      }),
    },
  });

  // Hapus semua record pembayaran terkait
  await (prisma as any).pembayaran.deleteMany({
    where: { tagihanId: id },
  });

  // Hapus tagihan
  await (prisma as any).tagihan.delete({
    where: { id },
  });

  revalidatePath("/admin/tagihan");
  revalidatePath("/admin/dashboard");
  revalidatePath("/wali/dashboard");

  return { success: true, message: `Tagihan berhasil dibatalkan/dihapus. Alasan: ${alasan}` };
}
