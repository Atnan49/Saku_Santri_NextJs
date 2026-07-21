// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & UI/UX States)
// Deskripsi: Loading skeleton screen khusus untuk modul Admin Tata Usaha.
//            Menggunakan layout grid yang persis dengan dashboard asli
//            namun dengan placeholder abu-abu/berdenyut (Shimmer Effect).
// =========================================================================

import React from "react";

export default function AdminLoading() {
  return (
    <div className="admin-loading-wrapper">
      <div className="skeleton-header shimmer"></div>
      
      <div className="skeleton-grid">
        <div className="skeleton-card shimmer"></div>
        <div className="skeleton-card shimmer"></div>
        <div className="skeleton-card shimmer"></div>
      </div>

      <div className="skeleton-table-card shimmer"></div>
    </div>
  );
}
