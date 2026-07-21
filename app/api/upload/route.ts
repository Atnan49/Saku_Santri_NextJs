// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: API Route untuk menghandle upload file bukti transfer ke
//            Vercel Blob Storage.
//            Atnan bertanggung jawab mengamankan endpoint ini agar hanya bisa
//            diakses oleh user yang terautentikasi (Wali Murid).
// =========================================================================

import { NextResponse } from "next/server";
// import { handleUpload } from "@vercel/blob/nextjs";

export async function POST(request: Request) {
  // TODO (Atnan): Integrasikan Vercel Blob client upload handler.
  // Menerima file multipart/form-data dan mengunggahnya ke Vercel Blob.
  
  try {
    // const { searchParams } = new URL(request.url);
    // const filename = searchParams.get('filename') || 'proof.png';
    // const blob = await put(filename, request.body!, { access: 'public' });
    // return NextResponse.json(blob);
    
    return NextResponse.json({ url: "https://blob.vercel-placeholder.com/proof.png" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
