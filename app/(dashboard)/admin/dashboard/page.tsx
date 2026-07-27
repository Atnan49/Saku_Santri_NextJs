"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Dashboard utama Admin Tata Usaha dengan layout macOS/iOS Ledger,
//            tata letak grid interaktif, statistik real-time, dan grafik Recharts.
// =========================================================================

import React, { useState, useEffect } from "react";
import SidebarNav from "@/components/ui/SidebarNav";
import TopHeader from "@/components/ui/TopHeader";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { getAdminDashboardStats } from "@/lib/actions/laporan";
import { formatIDR } from "@/lib/utils";
import {
  Users,
  Clock,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  FileCheck,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const chartData = [
  { bulan: "Jul", penerimaan: 12500000, tunggakan: 3200000 },
  { bulan: "Agu", penerimaan: 15800000, tunggakan: 2800000 },
  { bulan: "Sep", penerimaan: 14200000, tunggakan: 4100000 },
  { bulan: "Okt", penerimaan: 18900000, tunggakan: 2100000 },
  { bulan: "Nov", penerimaan: 16500000, tunggakan: 3500000 },
  { bulan: "Des", penerimaan: 21000000, tunggakan: 1800000 },
];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSiswa: 0,
    pendingVerification: 0,
    totalTagihanBulanIni: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getAdminDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Gagal memuat statistik admin:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const pendingVerificationList = [
    {
      id: "BYR-0982",
      santri: "M. Farhan Syahputra",
      kelas: "Kelas 5B",
      nominal: 450000,
      jenis: "SPP Bulanan",
      waktu: "10 menit lalu",
      status: "MENUNGGU_VERIFIKASI_ADMIN",
    },
    {
      id: "BYR-0981",
      santri: "Ahmad Santri",
      kelas: "Kelas 7A",
      nominal: 250000,
      jenis: "SPP Bulanan",
      waktu: "42 menit lalu",
      status: "MENUNGGU_VERIFIKASI_ADMIN",
    },
    {
      id: "BYR-0980",
      santri: "Siti Aminah Zahra",
      kelas: "Kelas 3A",
      nominal: 350000,
      jenis: "Buku Modul",
      waktu: "2 jam lalu",
      status: "MENUNGGU_VERIFIKASI_ADMIN",
    },
  ];

  return (
    <div className="app-container" style={{ display: "flex", minHeight: "100vh" }}>
      <SidebarNav activeItem="DASHBOARD" userRole="ADMINISTRATOR" userName="Admin Tata Usaha" />

      <main className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader title="SISTEM KEUANGAN INSTITUSI - PORTAL ADMINISTRATOR TU" />

        <div className="page-body" style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
              <Loader2 className="animate-spin" size={36} style={{ color: "var(--primary)" }} />
            </div>
          ) : (
            <>
              {/* SECTION 1: Summary Cards Grid */}
              <section>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
                  {/* Card 1: Total Siswa */}
                  <GlassCard className="interactive" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Total Siswa Aktif
                      </span>
                      <div style={{ padding: "0.5rem", borderRadius: "10px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                        <Users size={20} />
                      </div>
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-main)" }}>
                      {stats.totalSiswa} <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-muted)" }}>Santri</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--status-lunas)" }}>
                      <ArrowUpRight size={14} /> Terdaftar di Sistem Buku Besar
                    </div>
                  </GlassCard>

                  {/* Card 2: Menunggu Verifikasi */}
                  <GlassCard className="interactive" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Menunggu Verifikasi Admin
                      </span>
                      <div style={{ padding: "0.5rem", borderRadius: "10px", backgroundColor: "var(--status-menunggu-bg)", color: "var(--status-menunggu)" }}>
                        <Clock size={20} />
                      </div>
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-main)" }}>
                      {stats.pendingVerification} <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-muted)" }}>Berkas</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--status-menunggu)" }}>
                      Perlu Tindakan Admin TU
                    </div>
                  </GlassCard>

                  {/* Card 3: Total Tagihan Bulan Ini */}
                  <GlassCard className="interactive" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Tagihan Terbit Bulan Ini
                      </span>
                      <div style={{ padding: "0.5rem", borderRadius: "10px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                        <CreditCard size={20} />
                      </div>
                    </div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)" }}>
                      {formatIDR(stats.totalTagihanBulanIni)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Bulan Berjalan 2026
                    </div>
                  </GlassCard>
                </div>
              </section>

              {/* SECTION 2: Analytics Chart Recharts */}
              <section>
                <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <TrendingUp size={22} style={{ color: "var(--primary)" }} />
                      <div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                          Grafik Performa Penerimaan & Tunggakan Keuangan
                        </h3>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          Tren bulanan pemasukan kas vs total tunggakan santri.
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.78rem", fontWeight: 700 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--primary)" }}>
                        ● Penerimaan
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--status-ditolak)" }}>
                        ● Tunggakan
                      </span>
                    </div>
                  </div>

                  <div style={{ width: "100%", height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPenerimaan" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorTunggakan" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--status-ditolak)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--status-ditolak)" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" opacity={0.5} />
                        <XAxis dataKey="bulan" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(0)}M`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--bg-app)",
                            borderColor: "var(--border-glass)",
                            borderRadius: "8px",
                            color: "var(--text-main)",
                            fontSize: "0.82rem",
                          }}
                          formatter={(val: any) => [formatIDR(Number(val)), ""]}
                        />
                        <Area type="monotone" dataKey="penerimaan" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorPenerimaan)" name="Penerimaan" />
                        <Area type="monotone" dataKey="tunggakan" stroke="var(--status-ditolak)" strokeWidth={2} fillOpacity={1} fill="url(#colorTunggakan)" name="Tunggakan" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              {/* SECTION 3: Antrean Verifikasi Pembayaran */}
              <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FileCheck size={20} style={{ color: "var(--primary)" }} />
                    <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>
                      Antrean Verifikasi Setoran Terbaru
                    </h2>
                  </div>
                </div>

                <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-glass)", borderRadius: "16px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                    <thead>
                      <tr style={{ backgroundColor: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid var(--border-glass)" }}>
                        <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>ID Transaksi</th>
                        <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Nama Santri</th>
                        <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Jenis Tagihan</th>
                        <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Nominal</th>
                        <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                        <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "center" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingVerificationList.map((item) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                          <td style={{ padding: "0.9rem 1rem", fontWeight: 700, color: "var(--primary)" }}>{item.id}</td>
                          <td style={{ padding: "0.9rem 1rem", color: "var(--text-main)" }}>
                            <div style={{ fontWeight: 700 }}>{item.santri}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.kelas}</div>
                          </td>
                          <td style={{ padding: "0.9rem 1rem", color: "var(--text-main)" }}>{item.jenis}</td>
                          <td style={{ padding: "0.9rem 1rem", fontWeight: 800, color: "var(--text-main)" }}>{formatIDR(item.nominal)}</td>
                          <td style={{ padding: "0.9rem 1rem" }}>
                            <StatusBadge status={item.status} />
                          </td>
                          <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                              <button
                                style={{
                                  padding: "0.4rem 0.75rem",
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  backgroundColor: "var(--primary-light)",
                                  color: "var(--primary)",
                                  border: "1px solid var(--primary)",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                }}
                              >
                                <CheckCircle2 size={14} /> Verifikasi
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

