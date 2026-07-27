// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: API Endpoint untuk memproses alur Pembayaran (Upload bukti,
//            Verifikasi TU Tahap 1, dan Approval Final Bendahara Tahap 2).
//            Atnan bertanggung jawab untuk:
//            1. Menerima data upload bukti bayar dari wali murid (POST).
//            2. Mengubah status pembayaran dan mencatat tanggal verifikasi/approval (PUT).
//            3. Memicu notifikasi WhatsApp setelah status berubah.
// =========================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  submitPaymentProof,
  adminVerifyPayment,
  bendaharaApprovePayment,
  getPembayaranForAdminVerification,
  getPembayaranForBendaharaApproval,
} from "@/lib/actions/pembayaran";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    if (mode === "verifikasi" && session.user.role === "ADMIN") {
      const data = await getPembayaranForAdminVerification();
      return NextResponse.json({ success: true, data });
    }

    if (mode === "approval" && session.user.role === "BENDAHARA") {
      const data = await getPembayaranForBendaharaApproval();
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json(
      { error: "Mode atau role tidak valid." },
      { status: 400 }
    );
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
        { error: "Hanya Wali Murid yang dapat mengunggah bukti pembayaran." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tagihanId, buktiUrl, catatanWali } = body;

    if (!tagihanId || !buktiUrl) {
      return NextResponse.json(
        { error: "tagihanId dan buktiUrl wajib diisi." },
        { status: 400 }
      );
    }

    const result = await submitPaymentProof({
      tagihanId,
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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pembayaranId, action, catatan } = body;

    if (!pembayaranId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "pembayaranId dan action ('approve' | 'reject') wajib diisi." },
        { status: 400 }
      );
    }

    if (session.user.role === "ADMIN") {
      const result = await adminVerifyPayment({
        pembayaranId,
        action,
        catatan,
      });
      return NextResponse.json(result);
    }

    if (session.user.role === "BENDAHARA") {
      const result = await bendaharaApprovePayment({
        pembayaranId,
        action,
        catatan,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Role pengguna tidak diizinkan untuk aksi ini." },
      { status: 403 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
