// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: API Endpoint untuk pengajuan topup uang saku (POST) dan
//            verifikasi topup uang saku (PUT).
// =========================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  submitTopupSaku,
  verifyTopupSaku,
  getTopupListForVerification,
} from "@/lib/actions/uang-saku";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "BENDAHARA"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getTopupListForVerification();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "WALIMURID") {
      return NextResponse.json(
        { error: "Hanya Wali Murid yang dapat mengajukan isi saldo saku." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { siswaId, nominal, buktiUrl, catatanWali } = body;

    if (!siswaId || !nominal) {
      return NextResponse.json(
        { error: "siswaId dan nominal wajib diisi." },
        { status: 400 }
      );
    }

    const result = await submitTopupSaku({
      siswaId,
      nominal: Number(nominal),
      buktiUrl,
      catatanWali,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "BENDAHARA"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Hanya Admin atau Bendahara yang dapat memverifikasi topup." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { topupId, action, catatan } = body;

    if (!topupId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "topupId dan action ('approve' | 'reject') wajib diisi." },
        { status: 400 }
      );
    }

    const result = await verifyTopupSaku({
      topupId,
      action,
      catatan,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
