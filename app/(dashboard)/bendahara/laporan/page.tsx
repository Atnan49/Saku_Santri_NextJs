"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Modul pelaporan dan ekspor rekap keuangan.
// =========================================================================

import React, { useState } from "react";
import SidebarNav from "@/components/ui/SidebarNav";
import TopHeader from "@/components/ui/TopHeader";
import GlassCard from "@/components/ui/GlassCard";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  Loader2,
  FileText,
} from "lucide-react";

export default function BendaharaLaporanPage() {
  const [downloading, setDownloading] = useState(false);
  const [kelasFilter, setKelasFilter] = useState("SEMUA");

  const handleDownloadExcel = () => {
    setDownloading(true);
    window.location.href = `/api/laporan/export${kelasFilter !== "SEMUA" ? `?kelasId=${kelasFilter}` : ""}`;
    setTimeout(() => {
      setDownloading(false);
    }, 1500);
  };

  return (
    <div className="app-container">
      <SidebarNav activeItem="LAPORAN" userRole="BENDAHARA" userName="Bendahara Sekolah" />

      <main className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader title="SISTEM KEUANGAN INSTITUSI - PORTAL BENDAHARA & KEPALA SEKOLAH" />

        <div className="page-body" style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>
              PELAPORAN & ARSIP
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.2rem" }}>
              Laporan Keuangan & Ekspor Rekapitulasi Data
            </h1>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem" }}>
            
            {/* Card 1: Ekspor Excel */}
            <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
                <div style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "var(--status-lunas-bg)", color: "var(--status-lunas)" }}>
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                    Ekspor Rekapitulasi Keuangan Excel
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Unduh file Microsoft Excel (.xlsx) berisi seluruh data setoran & tunggakan.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Filter Berdasarkan Kelas</label>
                  <select
                    value={kelasFilter}
                    onChange={(e) => setKelasFilter(e.target.value)}
                    style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.88rem", marginTop: "0.2rem" }}
                  >
                    <option value="SEMUA">Semua Angkatan / Kelas</option>
                    <option value="7A">Kelas 7A</option>
                    <option value="7B">Kelas 7B</option>
                    <option value="8A">Kelas 8A</option>
                  </select>
                </div>

                <button
                  onClick={handleDownloadExcel}
                  disabled={downloading}
                  style={{
                    padding: "0.75rem 1.25rem",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    backgroundColor: "var(--primary)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {downloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                  {downloading ? "Mengunduh Berkas..." : "Unduh Rekapitulasi Excel (.xlsx)"}
                </button>
              </div>
            </GlassCard>

            {/* Card 2: Cetak Ulang Kwitansi */}
            <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
                <div style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                  <Printer size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                    Cetak Ulang Kwitansi Pembayaran
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Cetak bukti transaksi setoran yang telah berstatus LUNAS.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Cari No. Kwitansi / Nama Santri</label>
                  <input
                    type="text"
                    placeholder="Contoh: KW-231024 atau Ahmad"
                    style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.88rem", marginTop: "0.2rem" }}
                  />
                </div>

                <button
                  style={{
                    padding: "0.75rem 1.25rem",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    backgroundColor: "#ffffff",
                    color: "var(--primary)",
                    border: "1px solid var(--primary)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Printer size={18} /> Cari & Cetak Kwitansi PDF
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}

