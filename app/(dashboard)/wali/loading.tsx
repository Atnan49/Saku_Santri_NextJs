// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & UI/UX States)
// Deskripsi: Loading skeleton screen khusus untuk portal Wali Murid (iOS View).
//            Usva bertanggung jawab membuat shimmer placeholder tumpukan kartu
//            dan daftar tagihan agar transisi memuat data terasa sangat halus.
// =========================================================================

import React from "react";

export default function WaliLoading() {
  return (
    <div className="ios-viewport">
      <div className="skeleton-ios-header shimmer"></div>
      
      {/* Skeleton Wallet Card */}
      <div className="skeleton-wallet-card shimmer"></div>

      <div className="skeleton-ios-list">
        <div className="skeleton-ios-item shimmer"></div>
        <div className="skeleton-ios-item shimmer"></div>
        <div className="skeleton-ios-item shimmer"></div>
      </div>
    </div>
  );
}
