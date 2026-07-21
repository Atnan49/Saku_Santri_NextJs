// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & UI/UX States)
// Deskripsi: Halaman 404 Not Found global.
//            Usva bertanggung jawab mendesain ilustrasi grafis 404 bertema
//            kaca buram dan tombol kembali ke halaman utama bergaya iOS.
// =========================================================================

import React from "react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="not-found-container">
      {/* 
        TODO (Usva): Desain visual 404 yang estetik.
      */}
      <div className="not-found-card">
        <span className="not-found-code">404</span>
        <h2>Halaman Tidak Ditemukan</h2>
        <p className="description">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link href="/" className="mac-btn mac-btn-primary">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
