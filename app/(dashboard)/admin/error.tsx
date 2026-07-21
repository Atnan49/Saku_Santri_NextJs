// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend/UI) & Atnan (Backend/Logging)
// Deskripsi: Error Fallback khusus untuk dashboard Admin Tata Usaha.
//            Mencegah seluruh aplikasi crash jika ada kegagalan query di halaman admin.
// =========================================================================

"use client";

import React, { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin module error:", error);
  }, [error]);

  return (
    <div className="module-error-container">
      <h3>Gagal Memuat Data Admin</h3>
      <p className="description">Terjadi kesalahan saat memproses data tata usaha.</p>
      <button onClick={() => reset()} className="mac-btn">Coba Lagi</button>
    </div>
  );
}
