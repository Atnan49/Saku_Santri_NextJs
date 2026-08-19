"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Modul pelaporan, ekspor rekap keuangan, dan cetak ulang kwitansi.
// =========================================================================

import React, { useState } from "react";
import SidebarNav from "@/components/ui/SidebarNav";
import TopHeader from "@/components/ui/TopHeader";
import GlassCard from "@/components/ui/GlassCard";
import DigitalReceiptModal, { DigitalReceiptData } from "@/components/ui/DigitalReceiptModal";
import { searchKwitansi } from "@/lib/actions/pembayaran";
import { formatIDR } from "@/lib/utils";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Search,
  Loader2,
  FileCheck2,
} from "lucide-react";

export default function BendaharaLaporanPage() {
  const [downloading, setDownloading] = useState(false);
  const [kelasFilter, setKelasFilter] = useState("SEMUA");

  // State Search & Modal Kwitansi
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DigitalReceiptData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [activeReceipt, setActiveReceipt] = useState<DigitalReceiptData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownloadExcel = () => {
    setDownloading(true);
    window.location.href = `/api/laporan/export${kelasFilter !== "SEMUA" ? `?kelasId=${kelasFilter}` : ""}`;
    setTimeout(() => {
      setDownloading(false);
    }, 1500);
  };

  const handleSearchKwitansi = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setHasSearched(true);
    try {
      const results = await searchKwitansi(searchQuery);
      setSearchResults(results);
      if (results.length === 1) {
        // Jika hasil hanya 1, langsung buka pratinjau kwitansi
        setActiveReceipt(results[0]);
        setIsModalOpen(true);
      }
    } catch (err: any) {
      alert(err.message || "Gagal mencari kwitansi.");
    } finally {
      setSearching(false);
    }
  };

  const handleOpenReceipt = (receipt: DigitalReceiptData) => {
    setActiveReceipt(receipt);
    setIsModalOpen(true);
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
                  data-testid="btn-download-excel"
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
                    Cari & cetak bukti transaksi setoran yang telah berstatus LUNAS.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSearchKwitansi} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Cari No. Kwitansi / Nama Santri</label>
                  <input
                    type="text"
                    data-testid="input-search-kwitansi"
                    placeholder="Contoh: KW-231024 atau nama santri..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.88rem", marginTop: "0.2rem" }}
                  />
                </div>

                <button
                  type="submit"
                  data-testid="btn-search-kwitansi"
                  disabled={searching}
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
                  {searching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                  {searching ? "Mencari Datatransaksi..." : "Cari & Cetak Kwitansi PDF"}
                </button>
              </form>
            </GlassCard>
          </div>

          {/* HASIL PENCARIAN KWITANSI */}
          {hasSearched && (
            <GlassCard style={{ padding: "1.5rem", marginTop: "0.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "1rem" }}>
                Hasil Pencarian Kwitansi Resmi ({searchResults.length})
              </h3>

              {searchResults.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  Tidak ada data kwitansi LUNAS yang cocok dengan pencarian &quot;{searchQuery}&quot;.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-glass)", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.72rem", textAlign: "left" }}>
                        <th style={{ padding: "0.75rem" }}>No. Kwitansi</th>
                        <th style={{ padding: "0.75rem" }}>Tanggal</th>
                        <th style={{ padding: "0.75rem" }}>Santri / Wali</th>
                        <th style={{ padding: "0.75rem" }}>Pembayaran</th>
                        <th style={{ padding: "0.75rem" }}>Nominal</th>
                        <th style={{ padding: "0.75rem", textAlign: "right" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((item) => (
                        <tr key={item.receiptNo} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                          <td style={{ padding: "0.75rem", fontWeight: 800, color: "var(--primary)" }}>
                            {item.receiptNo}
                          </td>
                          <td style={{ padding: "0.75rem" }}>{item.date}</td>
                          <td style={{ padding: "0.75rem" }}>
                            <div style={{ fontWeight: 700 }}>{item.studentName} ({item.studentClass})</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Wali: {item.receivedFrom}</div>
                          </td>
                          <td style={{ padding: "0.75rem" }}>{item.paymentFor}</td>
                          <td style={{ padding: "0.75rem", fontWeight: 800 }}>{formatIDR(item.amount)}</td>
                          <td style={{ padding: "0.75rem", textAlign: "right" }}>
                            <button
                              onClick={() => handleOpenReceipt(item)}
                              style={{
                                padding: "0.4rem 0.8rem",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                backgroundColor: "var(--primary)",
                                color: "#FFF",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                              }}
                            >
                              <Printer size={14} /> Pratinjau / Cetak Kwitansi
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          )}

        </div>
      </main>

      <DigitalReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={activeReceipt}
      />
    </div>
  );
}

