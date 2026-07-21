// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: API Endpoint untuk operasi data Tagihan (SPP bulanan, tahunan).
//            Menerima trigger POST untuk generate tagihan otomatis per periode.
//            Atnan bertanggung jawab untuk:
//            1. Validasi role request (hanya ADMIN yang boleh memicu endpoint ini).
//            2. Mengambil semua siswa aktif dari database.
//            3. Membuat data Tagihan baru dengan nominal standar dikurangi potongan siswa.
// =========================================================================

import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  // TODO (Atnan): Logika mengambil daftar tagihan berdasarkan filter
  return NextResponse.json({ message: "Endpoint Tagihan GET ready" });
}

export async function POST(request: Request) {
  // TODO (Atnan): Logika generate tagihan massal untuk siswa aktif
  try {
    // 1. Cek sesi & pastikan role === ADMIN
    // 2. Baca payload (periode bulan, tahun ajaran)
    // 3. Loop data siswa, hitung nominalAkhir = nominalAwal - potonganTetap
    // 4. Buat records tagihan secara bulk
    return NextResponse.json({ success: true, message: "Tagihan berhasil digenerate" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
