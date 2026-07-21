// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Dashboard utama untuk Admin Tata Usaha.
//            Menyajikan summary tagihan bulanan/tahunan, antrean verifikasi,
//            dan grafik statistik tren keuangan pesantren.
//            - Usva: Membuat tata letak grid macOS Dashboard dengan header window,
//                    visualisasi grafik statistik (menggunakan chart.js/recharts),
//                    dan widget ringkasan data yang ciamik.
//            - Atnan: Menyediakan data real-time dari database melalui Server Components
//                     atau Fetch API (koneksi Prisma).
// =========================================================================

import React from "react";
import MacWindowHeader from "@/components/ui/MacWindowHeader";
import GlassCard from "@/components/ui/GlassCard";

export default async function AdminDashboardPage() {
  // TODO (Atnan): Ambil data rekapitulasi (total tagihan, total siswa, antrean verifikasi) dari DB prisma.
  
  return (
    <div className="admin-dashboard-container">
      <MacWindowHeader title="Dashboard Tata Usaha" />
      
      <div className="dashboard-grid">
        {/* 
          TODO (Usva): Desain kartu-kartu summary ini dengan GlassCard.
        */}
        <GlassCard className="summary-card">
          <h3>Total Siswa</h3>
          <p className="summary-value">0</p>
        </GlassCard>

        <GlassCard className="summary-card">
          <h3>Menunggu Verifikasi</h3>
          <p className="summary-value">0 Transaksi</p>
        </GlassCard>

        <GlassCard className="summary-card">
          <h3>Total Tagihan Bulan Ini</h3>
          <p className="summary-value">Rp 0</p>
        </GlassCard>
      </div>

      <div className="dashboard-charts-section">
        {/* TODO (Usva): Tambahkan visualisasi grafik di sini */}
        <GlassCard className="chart-card">
          <h3>Grafik Penerimaan & Tunggakan</h3>
          <div className="chart-placeholder">[Grafik Tren Keuangan]</div>
        </GlassCard>
      </div>
    </div>
  );
}
