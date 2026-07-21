/** @type {import('next').NextConfig} */
// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend) & Usva (Frontend)
// Deskripsi: File konfigurasi Next.js.
//            Atnan & Usva bertanggung jawab mengonfigurasi pengaturan Next.js di sini:
//            - Remote patterns untuk whitelisting domain gambar Vercel Blob Storage.
// =========================================================================

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com", // Mengizinkan loading gambar bukti dari Vercel Blob
      },
    ],
  },
};

export default nextConfig;
