// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend/UI) & Atnan (Backend/Logging)
// Deskripsi: Error Boundary tingkat root untuk menangani error runtime di aplikasi.
//            - Usva: Mendesain halaman error bertema macOS Dialog box.
//            - Atnan: Menyediakan aksi "Coba Lagi" (reset) dan logging error
//                     ke logger eksternal (Sentry/Logtail).
// =========================================================================

"use client";

import React, { useEffect } from "react";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    // TODO (Atnan): Log error ke service logger (misal: Sentry)
    console.error("Runtime error terdeteksi:", error);
  }, [error]);

  return (
    <div className="error-boundary-container">
      {/* 
        TODO (Usva): Desain dialog box peringatan bergaya macOS Warning Dialog.
      */}
      <div className="error-dialog-box">
        <span className="warning-icon">⚠️</span>
        <h2>Terjadi Kesalahan Sistem</h2>
        <p className="error-description">
          Aplikasi mengalami kegagalan tak terduga. Silakan coba memuat ulang halaman.
        </p>
        <div className="dialog-actions">
          <button onClick={() => reset()} className="mac-btn mac-btn-primary">
            Coba Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
