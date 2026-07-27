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
import { getBendaharaDashboardStats } from "@/lib/actions/laporan";
import { formatIDR } from "@/lib/utils";

export default async function BendaharaDashboardPage() {
  const stats = await getBendaharaDashboardStats().catch(() => ({
    totalDanaDiterima: 0,
    totalTunggakan: 0,
    pendingApproval: 0,
    tunggakanPerKelas: {},
  }));

  return (
    <div className="bendahara-dashboard-container">
      <MacWindowHeader title="Dashboard Bendahara & Kepala Sekolah" />

      <div className="dashboard-grid">
        <GlassCard className="summary-card accent-green">
          <h3>Total Dana Diterima</h3>
          <p className="summary-value">{formatIDR(stats.totalDanaDiterima)}</p>
        </GlassCard>

        <GlassCard className="summary-card accent-red">
          <h3>Total Tunggakan SPP</h3>
          <p className="summary-value">{formatIDR(stats.totalTunggakan)}</p>
        </GlassCard>

        <GlassCard className="summary-card">
          <h3>Menunggu Approval Final</h3>
          <p className="summary-value">{stats.pendingApproval} Transaksi</p>
        </GlassCard>
      </div>

      <div className="charts-grid">
        <GlassCard className="chart-card">
          <h3>Tunggakan Berdasarkan Kelas</h3>
          <div className="chart-placeholder">
            {Object.keys(stats.tunggakanPerKelas).length > 0 ? (
              <ul>
                {Object.entries(stats.tunggakanPerKelas).map(([kelas, nominal]) => (
                  <li key={kelas}>
                    <strong>Kelas {kelas}:</strong> {formatIDR(nominal)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>[Tidak ada tunggakan kelas]</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
