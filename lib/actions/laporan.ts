// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Server Actions untuk agregasi data statistik dashboard (Admin,
//            Wali Murid, Bendahara) dan pembuatan data rekapitulasi laporan (.xlsx).
// =========================================================================

"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as utilsXlsx from "xlsx";

// ========== ADMIN DASHBOARD STATS ==========

export async function getAdminDashboardStats() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak.");
  }

  const [totalSiswa, pendingVerification, currentMonthBills] = await Promise.all([
    prisma.siswa.count(),
    prisma.tagihan.count({
      where: { status: "MENUNGGU_VERIFIKASI_ADMIN" },
    }),
    prisma.tagihan.aggregate({
      _sum: { nominalAkhir: true },
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  return {
    totalSiswa,
    pendingVerification,
    totalTagihanBulanIni: currentMonthBills._sum.nominalAkhir
      ? Number(currentMonthBills._sum.nominalAkhir)
      : 0,
  };
}

// ========== BENDAHARA DASHBOARD STATS ==========

export async function getBendaharaDashboardStats() {
  const session = await getServerSession(authOptions);
  if (!session || !["BENDAHARA", "ADMIN"].includes(session.user.role)) {
    throw new Error("Akses ditolak.");
  }

  const [totalLunas, totalTunggakan, pendingApproval, classTunggakanRaw] =
    await Promise.all([
      // Total dana diterima (LUNAS)
      prisma.tagihan.aggregate({
        _sum: { nominalAkhir: true },
        where: { status: "LUNAS" },
      }),

      // Total tunggakan (BELUM_BAYAR + DITOLAK)
      prisma.tagihan.aggregate({
        _sum: { nominalAkhir: true },
        where: {
          status: { in: ["BELUM_BAYAR", "DITOLAK_ADMIN", "DITOLAK_BENDAHARA"] },
        },
      }),

      // Total transaksi menunggu approval final
      prisma.tagihan.count({
        where: { status: "MENUNGGU_APPROVAL_BENDAHARA" },
      }),

      // Agregasi tunggakan per kelas
      prisma.siswa.findMany({
        select: {
          kelas: { select: { name: true } },
          tagihan: {
            where: {
              status: { in: ["BELUM_BAYAR", "DITOLAK_ADMIN", "DITOLAK_BENDAHARA"] },
            },
            select: { nominalAkhir: true },
          },
        },
      }),
    ]);

  // Aggregate tunggakan per nama kelas
  const tunggakanPerKelas: Record<string, number> = {};
  for (const item of classTunggakanRaw) {
    const kelasName = item.kelas.name;
    const studentTunggakan = item.tagihan.reduce(
      (sum: number, b: { nominalAkhir: any }) => sum + Number(b.nominalAkhir),
      0
    );
    tunggakanPerKelas[kelasName] =
      (tunggakanPerKelas[kelasName] || 0) + studentTunggakan;
  }

  return {
    totalDanaDiterima: totalLunas._sum.nominalAkhir
      ? Number(totalLunas._sum.nominalAkhir)
      : 0,
    totalTunggakan: totalTunggakan._sum.nominalAkhir
      ? Number(totalTunggakan._sum.nominalAkhir)
      : 0,
    pendingApproval,
    tunggakanPerKelas,
  };
}

// ========== WALI DASHBOARD DATA ==========

export async function getWaliDashboardData() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "WALIMURID") {
    throw new Error("Akses ditolak.");
  }

  const waliUserId = session.user.id;

  const wali = await prisma.waliMurid.findUnique({
    where: { userId: waliUserId },
    include: {
      user: { select: { name: true, phone: true } },
      siswa: {
        include: {
          kelas: { select: { name: true } },
          tagihan: {
            include: {
              jenisTagihan: { select: { name: true } },
              pembayaran: true,
            },
            orderBy: { dueDate: "desc" },
          },
        },
      },
    },
  });

  if (!wali) {
    throw new Error("Profil Wali Murid tidak ditemukan.");
  }

  return wali;
}

// ========== GENERATE REKAP EXCEL BUFFER ==========

export async function generateExcelReportBuffer(filters?: {
  kelasId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "BENDAHARA"].includes(session.user.role)) {
    throw new Error("Akses ditolak.");
  }

  const where: any = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.kelasId) where.siswa = { kelasId: filters.kelasId };
  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
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
      jenisTagihan: { select: { name: true } },
      tahunAjaran: { select: { year: true } },
      pembayaran: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Map ke format row Excel
  const rows = tagihanList.map((t: any, index: number) => ({
    No: index + 1,
    "Nama Santri": t.siswa.name,
    NISN: t.siswa.nisn,
    Kelas: t.siswa.kelas.name,
    "Wali Murid": t.siswa.wali.user.name,
    "No HP Wali": t.siswa.wali.user.phone || "-",
    "Jenis Tagihan": t.jenisTagihan.name,
    Periode: t.period || "-",
    "Tahun Ajaran": t.tahunAjaran.year,
    "Nominal Awal": Number(t.nominalAwal),
    "Potongan Beasiswa": Number(t.potongan),
    "Nominal Wajib Bayar": Number(t.nominalAkhir),
    "Jatuh Tempo": t.dueDate.toISOString().split("T")[0],
    Status: t.status,
    "Tanggal Pembayaran": t.pembayaran?.approvedAt
      ? t.pembayaran.approvedAt.toISOString().split("T")[0]
      : "-",
  }));

  // Buat worksheet dan workbook dengan xlsx
  const worksheet = utilsXlsx.utils.json_to_sheet(rows);
  const workbook = utilsXlsx.utils.book_new();
  utilsXlsx.utils.book_append_sheet(workbook, worksheet, "Rekapitulasi Tagihan");

  // Output ke Buffer
  const excelBuffer = utilsXlsx.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return excelBuffer;
}
