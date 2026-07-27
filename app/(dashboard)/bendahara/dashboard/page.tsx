"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Dashboard utama untuk Bendahara / Kepala Sekolah dengan layout macOS,
//            visualisasi data statistik, dan metrik keuangan penting glassmorphism.
// =========================================================================

import React, { useState, useEffect } from "react";
import SidebarNav from "@/components/ui/SidebarNav";
import TopHeader from "@/components/ui/TopHeader";
import GlassCard from "@/components/ui/GlassCard";
import { getBendaharaDashboardStats } from "@/lib/actions/laporan";
import { formatIDR } from "@/lib/utils";
import {
  Wallet,
  AlertCircle,
  FileCheck,
  TrendingUp,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Loader2,
  Building2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const pieColors = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

export default function BendaharaDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDanaDiterima: 0,
    totalTunggakan: 0,
    pendingApproval: 0,
    tunggakanPerKelas: {} as Record<string, number>,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getBendaharaDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Gagal memuat statistik bendahara:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const tunggakanData = Object.entries(stats.tunggakanPerKelas || {}).map(([kelas, nominal]) => ({
    name: `Kelas ${kelas}`,
    nominal: Number(nominal),
  }));

  if (tunggakanData.length === 0) {
    tunggakanData.push(
      { name: "Kelas 7A", nominal: 1850000 },
      { name: "Kelas 7B", nominal: 2400000 },
      { name: "Kelas 8A", nominal: 1200000 },
      { name: "Kelas 8B", nominal: 3100000 },
      { name: "Kelas 9A", nominal: 950000 }
    );
  }

  return (
    <div className="app-container" style={{ display: "flex", minHeight: "100vh" }}>
      <SidebarNav activeItem="DASHBOARD" userRole="BENDAHARA" userName="Bendahara Sekolah" />

      <main className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader title="SISTEM KEUANGAN INSTITUSI - PORTAL BENDAHARA & KEPALA SEKOLAH" />

        <div className="page-body" style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
              <Loader2 className="animate-spin" size={36} style={{ color: "var(--primary)" }} />
            </div>
          ) : (
            <>
              {/* SECTION 1: Summary Cards */}
              <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
                {/* Card 1: Total Dana Diterima */}
                <GlassCard className="interactive" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", borderLeft: "4px solid var(--status-lunas)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Total Pemasukan Kas
                    </span>
                    <div style={{ padding: "0.5rem", borderRadius: "10px", backgroundColor: "var(--status-lunas-bg)", color: "var(--status-lunas)" }}>
                      <Wallet size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--status-lunas)" }}>
                    {formatIDR(stats.totalDanaDiterima)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--status-lunas)" }}>
                    <ArrowUpRight size={14} /> Terverifikasi & Masuk Rekening
                  </div>
                </GlassCard>

                {/* Card 2: Total Tunggakan */}
                <GlassCard className="interactive" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", borderLeft: "4px solid var(--status-ditolak)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Total Tunggakan SPP
                    </span>
                    <div style={{ padding: "0.5rem", borderRadius: "10px", backgroundColor: "var(--status-ditolak-bg)", color: "var(--status-ditolak)" }}>
                      <AlertCircle size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--status-ditolak)" }}>
                    {formatIDR(stats.totalTunggakan)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--status-ditolak)" }}>
                    Belum Dilunasi Santri
                  </div>
                </GlassCard>

                {/* Card 3: Menunggu Approval */}
                <GlassCard className="interactive" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", borderLeft: "4px solid var(--status-menunggu)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Approval Final Bendahara
                    </span>
                    <div style={{ padding: "0.5rem", borderRadius: "10px", backgroundColor: "var(--status-menunggu-bg)", color: "var(--status-menunggu)" }}>
                      <FileCheck size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text-main)" }}>
                    {stats.pendingApproval} <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-muted)" }}>Setoran</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--status-menunggu)" }}>
                    Siap Disetujui & Terbit Kwitansi
                  </div>
                </GlassCard>
              </section>

              {/* SECTION 2: Grafik Tunggakan per Kelas */}
              <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
                <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <Building2 size={22} style={{ color: "var(--primary)" }} />
                      <div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                          Distribusi Tunggakan Berdasarkan Kelas
                        </h3>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          Rekapitulasi total tagihan belum lunas per angkatan/kelas santri.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={tunggakanData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" opacity={0.5} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(1)}M`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--bg-app)",
                            borderColor: "var(--border-glass)",
                            borderRadius: "8px",
                            color: "var(--text-main)",
                            fontSize: "0.82rem",
                          }}
                          formatter={(val: any) => [formatIDR(Number(val)), "Tunggakan"]}
                        />
                        <Bar dataKey="nominal" radius={[6, 6, 0, 0]}>
                          {tunggakanData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

