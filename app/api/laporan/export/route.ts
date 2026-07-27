// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: API Endpoint untuk mengunduh rekapitulasi data tagihan & pembayaran
//            dalam format Microsoft Excel (.xlsx).
//            Atnan bertanggung jawab mengamankan endpoint ini (ADMIN & BENDAHARA).
// =========================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateExcelReportBuffer } from "@/lib/actions/laporan";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "BENDAHARA"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Hanya Admin dan Bendahara yang dapat mengekspor laporan." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      kelasId: searchParams.get("kelasId") || undefined,
      status: searchParams.get("status") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    const excelBuffer = await generateExcelReportBuffer(filters);

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `Rekap_Keuangan_SakuSantri_${timestamp}.xlsx`;

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Gagal mendownload laporan Excel:", error);
    return NextResponse.json(
      { error: error.message || "Gagal membuat laporan Excel." },
      { status: 500 }
    );
  }
}
