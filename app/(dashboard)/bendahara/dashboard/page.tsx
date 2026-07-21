// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Dashboard utama untuk Bendahara / Kepala Sekolah.
//            Menampilkan rekapitulasi keuangan total, tunggakan per kelas,
//            dan grafik tren penerimaan.
//            - Usva: Mendesain dashboard layout macOS, visualisasi data statistik,
//                    dan metrik keuangan penting dengan visual glassmorphism premium.
//            - Atnan: Melakukan query agregasi data (SUM, COUNT) dari tabel Tagihan
//                     dan Pembayaran menggunakan Prisma.
// =========================================================================

import React from "react";
import MacWindowHeader from "@/components/ui/MacWindowHeader";
import GlassCard from "@/components/ui/GlassCard";

export default async function BendaharaDashboardPage() {
  // TODO (Atnan): Hitung agregat keuangan: total dana masuk (LUNAS),
  //               total tunggakan (BELUM_BAYAR), dan persentase pembayaran.

  return (
    <div className="bendahara-dashboard-container">
      <MacWindowHeader title="Dashboard Bendahara & Kepala Sekolah" />

      <div className="dashboard-grid">
        <GlassCard className="summary-card accent-green">
          <h3>Total Dana Diterima</h3>
          <p className="summary-value">Rp 0</p>
        </GlassCard>

        <GlassCard className="summary-card accent-red">
          <h3>Total Tunggakan SPP</h3>
          <p className="summary-value">Rp 0</p>
        </GlassCard>

        <GlassCard className="summary-card">
          <h3>Menunggu Approval Final</h3>
          <p className="summary-value">0 Transaksi</p>
        </GlassCard>
      </div>

      <div className="charts-grid">
        {/* TODO (Usva): Tambahkan grafik presentasi rekap tunggakan per kelas */}
        <GlassCard className="chart-card">
          <h3>Tunggakan Berdasarkan Kelas</h3>
          <div className="chart-placeholder">[Grafik Batang Tunggakan Kelas]</div>
        </GlassCard>
      </div>
    </div>
  );
}
