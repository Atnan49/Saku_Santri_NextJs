// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: API Route untuk memicu pengiriman pesan WhatsApp secara asynchronous
//            atau menerima webhook status pengiriman pesan dari provider (Fonnte/Wablas).
//            Atnan bertanggung jawab membuat endpoint ini aman dan andal.
// =========================================================================

import { NextResponse } from "next/server";
// import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const { targetPhone, message } = await request.json();
    
    // Kirim pesan WhatsApp menggunakan helper di lib/whatsapp.ts
    // await sendWhatsAppMessage({ targetPhone, message });
    
    return NextResponse.json({ success: true, message: "WhatsApp message triggered" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
