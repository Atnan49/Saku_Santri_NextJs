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
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTagihanList, generateMonthlyBills } from "@/lib/actions/tagihan";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters: any = {};

    if (searchParams.get("status")) filters.status = searchParams.get("status");
    if (searchParams.get("kelasId")) filters.kelasId = searchParams.get("kelasId");
    if (searchParams.get("siswaId")) filters.siswaId = searchParams.get("siswaId");
    if (searchParams.get("tahunAjaranId")) filters.tahunAjaranId = searchParams.get("tahunAjaranId");
    if (searchParams.get("period")) filters.period = searchParams.get("period");

    const tagihanList = await getTagihanList(filters);

    return NextResponse.json({ success: true, data: tagihanList });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya Admin yang dapat men-generate tagihan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { jenisTagihanId, tahunAjaranId, period, dueDate } = body;

    if (!jenisTagihanId || !tahunAjaranId || !period || !dueDate) {
      return NextResponse.json(
        { error: "jenisTagihanId, tahunAjaranId, period, dan dueDate wajib diisi." },
        { status: 400 }
      );
    }

    const result = await generateMonthlyBills({
      jenisTagihanId,
      tahunAjaranId,
      period,
      dueDate,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
