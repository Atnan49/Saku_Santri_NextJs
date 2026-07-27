"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman pengaturan sistem untuk mengelola Tahun Ajaran,
//            Jenis Tagihan, dan Manajemen User.
// =========================================================================

import React, { useState } from "react";
import SidebarNav from "@/components/ui/SidebarNav";
import TopHeader from "@/components/ui/TopHeader";
import GlassCard from "@/components/ui/GlassCard";
import SegmentedControl from "@/components/ui/SegmentedControl";
import {
  Settings,
  Calendar,
  Tag,
  Users,
  Plus,
  CheckCircle2,
  Lock,
  Save,
} from "lucide-react";

export default function AdminPengaturanPage() {
  const [activeTab, setActiveTab] = useState("Tahun Ajaran");

  // Form State Tahun Ajaran
  const [tahunAjaran, setTahunAjaran] = useState("2025/2026");
  const [tahunList, setTahunList] = useState([
    { id: "1", year: "2025/2026", isActive: true },
    { id: "2", year: "2024/2025", isActive: false },
  ]);

  // Form State Jenis Tagihan
  const [jenisNama, setJenisNama] = useState("");
  const [jenisNominal, setJenisNominal] = useState("");
  const [jenisType, setJenisType] = useState("BULANAN");
  const [jenisList, setJenisList] = useState([
    { id: "1", name: "SPP Bulanan", type: "BULANAN", nominal: 250000 },
    { id: "2", name: "Uang Gedung", type: "TAHUNAN", nominal: 1000000 },
  ]);

  const handleAddTahun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tahunAjaran) return;
    setTahunList([{ id: String(Date.now()), year: tahunAjaran, isActive: false }, ...tahunList]);
    setTahunAjaran("");
  };

  const handleAddJenis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenisNama || !jenisNominal) return;
    setJenisList([
      { id: String(Date.now()), name: jenisNama, type: jenisType, nominal: Number(jenisNominal) },
      ...jenisList,
    ]);
    setJenisNama("");
    setJenisNominal("");
  };

  return (
    <div className="app-container">
      <SidebarNav activeItem="PENGATURAN" userRole="ADMINISTRATOR" userName="Admin Tata Usaha" />

      <main className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader title="SISTEM KEUANGAN INSTITUSI - PORTAL ADMINISTRATOR TU" />

        <div className="page-body" style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>
              KONFIGURASI PUSAT
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.2rem" }}>
              Pengaturan Sistem & Master Data
            </h1>
          </div>

          {/* Segmented Control Tabs */}
          <div style={{ maxWidth: "500px" }}>
            <SegmentedControl
              options={["Tahun Ajaran", "Jenis Tagihan"]}
              selectedValue={activeTab}
              onChange={(val) => setActiveTab(val)}
            />
          </div>

          {/* TAB 1: TAHUN AJARAN */}
          {activeTab === "Tahun Ajaran" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
              <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                  Tambah Tahun Ajaran
                </h3>
                <form onSubmit={handleAddTahun} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Format Tahun Ajaran</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 2026/2027"
                      value={tahunAjaran}
                      onChange={(e) => setTahunAjaran(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", marginTop: "0.2rem" }}
                    />
                  </div>
                  <button type="submit" style={{ padding: "0.65rem", backgroundColor: "var(--primary)", color: "#fff", border: "none", borderRadius: "4px", fontWeight: 700, cursor: "pointer" }}>
                    Simpan Tahun Ajaran
                  </button>
                </form>
              </GlassCard>

              <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                  Daftar Tahun Ajaran
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {tahunList.map((t) => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)" }}>
                      <span style={{ fontWeight: 800, color: "var(--text-main)" }}>{t.year}</span>
                      {t.isActive ? (
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--status-lunas)", backgroundColor: "var(--status-lunas-bg)", padding: "0.25rem 0.6rem", borderRadius: "999px" }}>AKTIF</span>
                      ) : (
                        <button
                          onClick={() => setTahunList(tahunList.map((x) => ({ ...x, isActive: x.id === t.id })))}
                          style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", background: "none", cursor: "pointer" }}
                        >
                          Aktifkan
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* TAB 2: JENIS TAGIHAN */}
          {activeTab === "Jenis Tagihan" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
              <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                  Tambah Jenis Tagihan Baru
                </h3>
                <form onSubmit={handleAddJenis} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nama Jenis Tagihan</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: SPP Bulanan / Seragam"
                      value={jenisNama}
                      onChange={(e) => setJenisNama(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", marginTop: "0.2rem" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nominal Standar (Rp)</label>
                      <input
                        type="number"
                        required
                        placeholder="250000"
                        value={jenisNominal}
                        onChange={(e) => setJenisNominal(e.target.value)}
                        style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", marginTop: "0.2rem" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Tipe Tagihan</label>
                      <select
                        value={jenisType}
                        onChange={(e) => setJenisType(e.target.value)}
                        style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", marginTop: "0.2rem" }}
                      >
                        <option value="BULANAN">Bulanan</option>
                        <option value="TAHUNAN">Tahunan</option>
                        <option value="BEBAS">Bebas/Kegiatan</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" style={{ padding: "0.65rem", backgroundColor: "var(--primary)", color: "#fff", border: "none", borderRadius: "4px", fontWeight: 700, cursor: "pointer" }}>
                    Simpan Jenis Tagihan
                  </button>
                </form>
              </GlassCard>

              <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                  Daftar Master Jenis Tagihan
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {jenisList.map((j) => (
                    <div key={j.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)" }}>
                      <div>
                        <div style={{ fontWeight: 800, color: "var(--text-main)" }}>{j.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Tipe: {j.type}</div>
                      </div>
                      <div style={{ fontWeight: 800, color: "var(--primary)" }}>
                        Rp {j.nominal.toLocaleString("id-ID")}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


