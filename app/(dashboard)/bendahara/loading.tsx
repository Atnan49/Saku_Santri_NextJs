// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & UI/UX States)
// Deskripsi: Loading skeleton screen khusus untuk modul Bendahara & Kepala Sekolah.
//            Usva bertanggung jawab membuat placeholder grafik, summary card,
//            dan antrean approval final bertema macOS shimmer.
// =========================================================================

import React from "react";

export default function BendaharaLoading() {
  return (
    <div className="bendahara-loading-wrapper">
      <div className="skeleton-header shimmer"></div>
      
      <div className="skeleton-grid">
        <div className="skeleton-card card-accent-green shimmer"></div>
        <div className="skeleton-card card-accent-red shimmer"></div>
        <div className="skeleton-card shimmer"></div>
      </div>

      <div className="skeleton-charts-section">
        <div className="skeleton-chart shimmer"></div>
      </div>
    </div>
  );
}
