// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: API Endpoint untuk Kasir Koperasi memproses transaksi
//            pembelian santri di Koperasi / Mart Sekolah.
// =========================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processTransaksiKoperasi } from "@/lib/actions/uang-saku";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["KOPERASI", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Hanya Kasir Koperasi atau Admin yang dapat memproses transaksi." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nisn, totalBelanja, catatanBarang } = body;

    if (!nisn || !totalBelanja) {
      return NextResponse.json(
        { error: "nisn dan totalBelanja wajib diisi." },
        { status: 400 }
      );
    }

    const result = await processTransaksiKoperasi({
      nisn,
      totalBelanja: Number(totalBelanja),
      catatanBarang,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
