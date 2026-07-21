// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Dashboard Portal Wali Murid (iOS Mobile View).
//            Menyajikan tampilan tabungan/kartu anak bergaya Apple Wallet untuk
//            multi-anak dan daftar tagihan aktif per anak.
//            - Usva: Mendesain stacked cards (Apple Wallet style) yang interaktif (swipe/tap),
//                    bottom sheet detail tagihan, dan daftar tagihan bergaya iOS list.
//            - Atnan: Mengambil data siswa (anak-anak dari wali murid yang sedang login)
//                     dan tagihan-tagihan mereka dari DB prisma.
// =========================================================================

import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";

export default async function WaliDashboardPage() {
  // TODO (Atnan): Dapatkan session user wali murid, lalu ambil data profil wali murid,
  //               anak-anaknya, dan status tagihan masing-masing anak.

  return (
    <div className="ios-viewport">
      <header className="ios-header">
        <span className="greeting">Assalamu'alaikum,</span>
        <h1 className="wali-name">Nama Wali Murid</h1>
      </header>

      <section className="ios-wallet-section">
        {/* 
          TODO (Usva): 
          1. Desain tumpukan kartu anak (iOS Wallet Stack) di sini.
          2. Klik kartu anak untuk mengganti fokus tagihan anak yang aktif.
        */}
        <div className="wallet-cards-stack">
          <GlassCard className="wallet-card wallet-card-active">
            <span className="student-badge">Siswa 1</span>
            <h2>Nama Anak Pertama</h2>
            <p className="student-info">Kelas 7A | NISN: 123456</p>
            <div className="card-footer">
              <span>Sisa Tagihan:</span>
              <span className="tagihan-amount">Rp 0</span>
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="ios-bill-list-section">
        <h3>Daftar Tagihan</h3>
        {/* 
          TODO (Usva): Buat list tagihan bergaya iOS list item.
          Ketuk tagihan untuk memicu bottom sheet detail.
        */}
        <div className="ios-list">
          <div className="ios-list-item">
            <div className="item-info">
              <span className="item-title">SPP Bulan Juli 2026</span>
              <span className="item-due">Jatuh tempo: 10 Juli 2026</span>
            </div>
            <div className="item-status-amount">
              <span className="item-amount">Rp 500.000</span>
              <StatusBadge status="BELUM_BAYAR" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
