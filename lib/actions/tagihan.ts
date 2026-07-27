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

  // Ambil jenis tagihan untuk mendapatkan nominal standar
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

  // Ambil semua siswa aktif
  const allSiswa = await prisma.siswa.findMany({
    include: {
      wali: {
        include: {
          user: { select: { id: true, phone: true, name: true } },
        },
      },
    },
  });

  if (allSiswa.length === 0) {
    throw new Error("Tidak ada siswa terdaftar di database.");
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
      `Semua siswa sudah memiliki tagihan ${jenisTagihan.name} untuk periode ${data.period}.`
    );
  }

  const nominalAwalNum = Number(jenisTagihan.nominal);
  const dueDate = new Date(data.dueDate);

  // Buat data tagihan untuk setiap siswa
  const tagihanData = siswaToGenerate.map((siswa: any) => {
    const potonganNum = Number(siswa.potonganTetap);
    const nominalAkhirNum = Math.max(0, nominalAwalNum - potonganNum);

    return {
      siswaId: siswa.id,
      jenisTagihanId: data.jenisTagihanId,
      tahunAjaranId: data.tahunAjaranId,
      nominalAwal: nominalAwalNum,
      potongan: potonganNum,
      nominalAkhir: nominalAkhirNum,
      dueDate,
      period: data.period,
      status: "BELUM_BAYAR" as const,
      catatanTagihan: potonganNum > 0
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
    const phone = siswa.wali.user.phone;
    const userId = siswa.wali.user.id;
    if (phone) {
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

  const dueDate = new Date(data.dueDate);
  const nominalAwalNum = data.nominalAwal;

  // Ambil data siswa untuk menghitung potongan
  const siswaList = await prisma.siswa.findMany({
    where: { id: { in: data.siswaIds } },
  });

  const tagihanData = siswaList.map((siswa: any) => {
    const potonganNum = Number(siswa.potonganTetap);
    const nominalAkhirNum = Math.max(0, nominalAwalNum - potonganNum);

    return {
      siswaId: siswa.id,
      jenisTagihanId: data.jenisTagihanId,
      tahunAjaranId: data.tahunAjaranId,
      nominalAwal: nominalAwalNum,
      potongan: potonganNum,
      nominalAkhir: nominalAkhirNum,
      dueDate,
      period: data.period || "",
      catatanTagihan: data.catatanTagihan || null,
      status: "BELUM_BAYAR" as const,
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
    message: `${result.count} tagihan manual berhasil dibuat.`,
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

  // Hapus pembayaran terkait jika ada
  if (tagihan.pembayaran) {
    await prisma.pembayaran.delete({
      where: { id: tagihan.pembayaran.id },
    });
  }

  await prisma.tagihan.delete({
    where: { id },
  });

  revalidatePath("/admin/tagihan");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
