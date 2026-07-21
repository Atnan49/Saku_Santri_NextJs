// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend/UI) & Atnan (Backend/Logging)
// Deskripsi: Error Fallback khusus untuk dashboard Bendahara & Kepala Sekolah.
//            Mengamankan halaman agar data transaksi aman jika query agregat error.
// =========================================================================

"use client";

import React, { useEffect } from "react";

export default function BendaharaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Bendahara module error:", error);
  }, [error]);

  return (
    <div className="module-error-container">
      <h3>Gagal Memuat Laporan Keuangan</h3>
      <p className="description">Terjadi kesalahan saat memproses data agregat keuangan pesantren.</p>
      <button onClick={() => reset()} className="mac-btn">Coba Lagi</button>
    </div>
  );
}
