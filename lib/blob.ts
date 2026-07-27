// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Helper untuk menangani pengunggahan berkas bukti transfer ke
//            Vercel Blob Storage secara aman.
//            Atnan bertanggung jawab untuk:
//            1. Mengatur upload handler (API Route / Server Action) yang
//               menggunakan library `@vercel/blob`.
//            2. Memastikan tipe berkas yang diunggah hanya berupa Gambar (.jpg, .png)
//               atau dokumen PDF bukti transfer.
// =========================================================================

import { put, del } from "@vercel/blob";

// Tipe file yang diizinkan untuk bukti pembayaran
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadPaymentProof(file: File): Promise<string> {
  // Validasi tipe file
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Tipe file tidak didukung. Hanya JPG, PNG, WebP, dan PDF yang diizinkan."
    );
  }

  // Validasi ukuran file
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran file melebihi batas maksimum 5MB.");
  }

  // Generate nama file unik
  const timestamp = Date.now();
  const extension = file.name.split(".").pop() || "png";
  const filename = `bukti-bayar/${timestamp}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const blob = await put(filename, file, {
    access: "public",
  });

  return blob.url;
}

export async function deletePaymentProof(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error("Gagal menghapus file dari Vercel Blob:", error);
    // Non-critical error — jangan block flow utama
  }
}
