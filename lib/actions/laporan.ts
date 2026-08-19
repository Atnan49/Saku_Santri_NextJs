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

// ========== ADMIN DASHBOARD STATS ==========

export async function getAdminDashboardStats() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak.");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalSiswa, pendingVerification, currentMonthBills, monthlyChartRaw] = await Promise.all([
    (prisma as any).siswa.count({ where: { status: "AKTIF" } }),
    (prisma as any).tagihan.count({
      where: { status: "MENUNGGU_VERIFIKASI_ADMIN" },
    }),
    (prisma as any).tagihan.aggregate({
      _sum: { nominalAkhir: true },
      where: {
        createdAt: { gte: startOfMonth },
      },
    }),
    // Aggregasi 6 bulan terakhir untuk chart area
    (prisma as any).tagihan.findMany({
      where: {
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
        },
      },
      select: {
        createdAt: true,
        nominalAkhir: true,
        nominalTerbayar: true,
        status: true,
      },
    }),
  ]);

  // Grouping per bulan untuk Chart (6 bulan terakhir)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const monthlyChartMap = new Map<string, { bulan: string; penerimaan: number; tunggakan: number }>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = `${monthNames[d.getMonth()]}`;
    monthlyChartMap.set(key, { bulan: label, penerimaan: 0, tunggakan: 0 });
  }

  for (const bill of monthlyChartRaw) {
    const d = new Date(bill.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyChartMap.has(key)) {
      const entry = monthlyChartMap.get(key)!;
      const terbayar = Number(bill.nominalTerbayar || 0);
      const sisa = Math.max(0, Number(bill.nominalAkhir) - terbayar);
      entry.penerimaan += terbayar;
      entry.tunggakan += sisa;
    }
  }

  return {
    totalSiswa,
    pendingVerification,
    totalTagihanBulanIni: currentMonthBills._sum.nominalAkhir
      ? Number(currentMonthBills._sum.nominalAkhir)
      : 0,
    chartData: Array.from(monthlyChartMap.values()),
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
      // Total dana diterima (nominalTerbayar)
      (prisma as any).tagihan.aggregate({
        _sum: { nominalTerbayar: true },
      }),

      // Total tunggakan (nominalAkhir - nominalTerbayar) untuk status non-LUNAS
      (prisma as any).tagihan.findMany({
        where: {
          status: { notIn: ["LUNAS"] },
        },
        select: { nominalAkhir: true, nominalTerbayar: true },
      }),

      // Total transaksi menunggu approval final
      (prisma as any).tagihan.count({
        where: { status: "MENUNGGU_APPROVAL_BENDAHARA" },
      }),

      // Agregasi tunggakan per kelas
      (prisma as any).siswa.findMany({
        where: { status: "AKTIF" },
        select: {
          kelas: { select: { name: true } },
          tagihan: {
            where: {
              status: { notIn: ["LUNAS"] },
            },
            select: { nominalAkhir: true, nominalTerbayar: true },
          },
        },
      }),
    ]);

  const totalTunggakanSum = totalTunggakan.reduce((sum: number, t: any) => {
    return sum + Math.max(0, Number(t.nominalAkhir) - Number(t.nominalTerbayar));
  }, 0);

  // Aggregate tunggakan per nama kelas
  const tunggakanPerKelas: Record<string, number> = {};
  for (const item of (classTunggakanRaw as any[])) {
    const kelasName = item.kelas.name;
    const studentTunggakan = item.tagihan.reduce(
      (sum: number, b: { nominalAkhir: any; nominalTerbayar: any }) =>
        sum + Math.max(0, Number(b.nominalAkhir) - Number(b.nominalTerbayar)),
      0
    );
    tunggakanPerKelas[kelasName] =
      (tunggakanPerKelas[kelasName] || 0) + studentTunggakan;
  }

  return {
    totalDanaDiterima: totalLunas._sum.nominalTerbayar
      ? Number(totalLunas._sum.nominalTerbayar)
      : 0,
    totalTunggakan: totalTunggakanSum,
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

  const wali = await (prisma as any).waliMurid.findUnique({
    where: { userId: waliUserId },
    include: {
      user: { select: { name: true, phone: true } },
      siswa: {
        include: {
          kelas: { select: { name: true } },
          tagihan: {
            include: {
              jenisTagihan: { select: { name: true } },
              tahunAjaran: { select: { year: true } },
              pembayaran: {
                include: {
                  approvedByUser: { select: { name: true } },
                },
                orderBy: { createdAt: "desc" },
              },
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
  if (filters?.kelasId && filters.kelasId !== "SEMUA") where.siswa = { kelasId: filters.kelasId };
  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
  }

  const tagihanList = await (prisma as any).tagihan.findMany({
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
      pembayaran: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  // Map ke format row Excel
  const rows = tagihanList.map((t: any, index: number) => {
    const nominalAkhir = Number(t.nominalAkhir);
    const nominalTerbayar = Number(t.nominalTerbayar || 0);
    const sisa = Math.max(0, nominalAkhir - nominalTerbayar);
    const latestPayment = t.pembayaran?.[0];

    return {
      No: index + 1,
      "Nama Santri": t.siswa?.name || "-",
      NISN: t.siswa?.nisn || "-",
      Kelas: t.siswa?.kelas?.name || "-",
      "Wali Murid": t.siswa?.wali?.user?.name || "-",
      "No HP Wali": t.siswa?.wali?.user?.phone || "-",
      "Jenis Tagihan": t.jenisTagihan?.name || "-",
      Periode: t.period || "-",
      "Tahun Ajaran": t.tahunAjaran?.year || "-",
      "Nominal Tagihan": nominalAkhir,
      "Telah Terbayar": nominalTerbayar,
      "Sisa Tagihan": sisa,
      "Jatuh Tempo": t.dueDate ? t.dueDate.toISOString().split("T")[0] : "-",
      Status: t.status,
      "Setoran Terakhir": latestPayment?.approvedAt
        ? new Date(latestPayment.approvedAt).toISOString().split("T")[0]
        : "-",
    };
  });

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
