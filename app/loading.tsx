// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & UI/UX States)
// Deskripsi: Halaman loading global tingkat root.
//            Usva bertanggung jawab mendesain spinner / logo loading center
//            bergaya macOS blur dan iOS spinner.
// =========================================================================

import React from "react";

export default function RootLoading() {
  return (
    <div className="root-loading-container">
      {/* 
        TODO (Usva): 
        1. Desain container layar penuh dengan backdrop-blur.
        2. Tampilkan logo Saku Santri dengan efek pulsasi/fade dan iOS style spinner.
      */}
      <div className="spinner-wrapper">
        <div className="ios-spinner"></div>
        <p className="loading-text">Memuat halaman...</p>
      </div>
    </div>
  );
}
