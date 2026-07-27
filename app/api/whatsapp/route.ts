// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: API Route untuk memicu pengiriman pesan WhatsApp secara asynchronous
//            atau menguji koneksi API WhatsApp (Fonnte/Wablas).
//            Atnan bertanggung jawab membuat endpoint ini aman dan andal.
// =========================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "BENDAHARA"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Hanya Admin atau Bendahara yang dapat memicu notifikasi WhatsApp." },
        { status: 403 }
      );
    }

    const { targetPhone, message } = await request.json();

    if (!targetPhone || !message) {
      return NextResponse.json(
        { error: "targetPhone dan message wajib diisi." },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppMessage({ targetPhone, message });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Pesan WhatsApp berhasil dikirim/dijadwalkan.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
