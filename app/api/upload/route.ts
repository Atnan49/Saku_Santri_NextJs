// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: API Route untuk menghandle upload file bukti transfer ke
//            Vercel Blob Storage / Local Filesystem Fallback (WebP Support).
// =========================================================================

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

// Tipe file yang diizinkan
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File bukti pembayaran wajib diunggah." },
        { status: 400 }
      );
    }

    // Validasi tipe file
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isImage && !isPdf) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF." },
        { status: 400 }
      );
    }

    // Validasi ukuran (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file melebihi batas maksimum 10MB." },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    let extension = "png";
    if (isPdf) {
      extension = "pdf";
    } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
      extension = "jpg";
    } else if (file.type === "image/webp") {
      extension = "webp";
    } else if (file.name.includes(".")) {
      extension = file.name.split(".").pop()?.toLowerCase() || "png";
    }
    const filename = `bukti-${timestamp}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    // 1. Coba upload ke Vercel Blob jika BLOB_READ_WRITE_TOKEN tersedia
    const rawToken = process.env.BLOB_READ_WRITE_TOKEN;
    const blobToken = rawToken ? rawToken.trim().replace(/^["']|["']$/g, "") : "";
    if (blobToken) {
      try {
        const blob = await put(`bukti-bayar/${filename}`, file, {
          access: "public",
          token: blobToken,
        });
        return NextResponse.json({
          success: true,
          url: blob.url,
          filename: blob.pathname,
        });
      } catch (blobErr: any) {
        console.error("Vercel Blob upload failed:", blobErr);
        if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
          let customMsg = blobErr?.message || "Token tidak valid";
          if (customMsg.includes("private store") || customMsg.includes("public access")) {
            customMsg = "Vercel Blob Store Anda saat ini berstatus 'Private'. Silakan ubah status Store menjadi 'Public' di Vercel Dashboard (Storage -> saku-santri-next-js-blob -> Settings -> Access Mode) agar gambar bukti transfer dapat diakses oleh browser Admin.";
          }
          return NextResponse.json(
            { error: `Gagal upload ke Vercel Blob Storage: ${customMsg}` },
            { status: 500 }
          );
        }
      }
    } else {
      if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "BLOB_READ_WRITE_TOKEN tidak ditemukan di Vercel Environment Variables. Harap tambahkan token tersebut di Vercel Dashboard lalu Redeploy." },
          { status: 500 }
        );
      }
    }

    // 2. Fallback Local Filesystem Storage (Hanya untuk Pengembangan Lokal / Non-Vercel)
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${filename}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: filename,
      });
    } catch (fsErr: any) {
      console.error("Local storage write error:", fsErr);
      return NextResponse.json(
        { error: `Gagal menyimpan file ke penyimpanan lokal: ${fsErr?.message || fsErr}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengunggah file." },
      { status: 500 }
    );
  }
}
