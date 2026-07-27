// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: API Route untuk menghandle upload file bukti transfer ke
//            Vercel Blob Storage.
//            Atnan bertanggung jawab mengamankan endpoint ini agar hanya bisa
//            diakses oleh user yang terautentikasi (Wali Murid).
// =========================================================================

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Tipe file yang diizinkan
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export async function POST(request: Request) {
  try {
    // Validasi session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Anda harus login untuk mengunggah bukti pembayaran." },
        { status: 401 }
      );
    }

    // Hanya wali murid yang boleh upload bukti bayar
    if (session.user.role !== "WALIMURID") {
      return NextResponse.json(
        { error: "Hanya Wali Murid yang dapat mengunggah bukti pembayaran." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File bukti pembayaran wajib diunggah." },
        { status: 400 }
      );
    }

    // Validasi tipe file
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF." },
        { status: 400 }
      );
    }

    // Validasi ukuran (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file melebihi batas maksimum 5MB." },
        { status: 400 }
      );
    }

    // Upload ke Vercel Blob
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "png";
    const filename = `bukti-bayar/${timestamp}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: blob.pathname,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengunggah file." },
      { status: 500 }
    );
  }
}
