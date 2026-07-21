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

// import { put } from "@vercel/blob";

export async function uploadPaymentProof(file: File) {
  // TODO (Atnan): Hubungkan dengan Vercel Blob menggunakan client token.
  // Contoh:
  // const blob = await put(file.name, file, {
  //   access: 'public',
  // });
  // return blob.url;
  
  console.log("Mengunggah berkas:", file.name);
  return "";
}
