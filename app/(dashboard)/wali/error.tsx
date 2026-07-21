// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend/UI) & Atnan (Backend/Logging)
// Deskripsi: Error Fallback khusus untuk portal Wali Murid.
//            Mencegah kegagalan load database / verifikasi mengacaukan
//            tampilan dashboard wali murid.
// =========================================================================

"use client";

import React, { useEffect } from "react";

export default function WaliError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Wali portal error:", error);
  }, [error]);

  return (
    <div className="ios-viewport module-error-container">
      <h3>Terjadi Kesalahan Koneksi</h3>
      <p className="description">Gagal memuat daftar tagihan anak. Pastikan koneksi internet stabil.</p>
      <button onClick={() => reset()} className="ios-btn ios-btn-primary">Muat Ulang</button>
    </div>
  );
}
