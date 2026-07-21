// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: API Endpoint untuk memproses alur Pembayaran (Upload bukti,
//            Verifikasi TU Tahap 1, dan Approval Final Bendahara Tahap 2).
//            Atnan bertanggung jawab untuk:
//            1. Menerima data upload bukti bayar dari wali murid (POST).
//            2. Mengubah status pembayaran dan mencatat tanggal verifikasi/approval.
//            3. Memicu notifikasi WhatsApp setelah status berubah.
// =========================================================================

import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
  // TODO (Atnan): Logika simpan bukti pembayaran baru oleh wali murid
  return NextResponse.json({ message: "Upload bukti bayar berhasil disimpan" });
}

export async function PUT(request: Request) {
  // TODO (Atnan): Logika update status pembayaran (Approve/Reject)
  // - Jika ADMIN approve -> Status: MENUNGGU_APPROVAL_BENDAHARA
  // - Jika BENDAHARA approve -> Status: LUNAS, lalu trigger WA sukses
  // - Jika di-reject -> Status: DITOLAK_x, trigger WA alasan penolakan
  try {
    const body = await request.json();
    const { pembayaranId, action, catatan, role } = body;
    
    // Proses workflow status berdasarkan role & action
    
    return NextResponse.json({ success: true, message: "Status pembayaran diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
