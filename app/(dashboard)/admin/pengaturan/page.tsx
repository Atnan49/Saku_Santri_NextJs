"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman pengaturan sistem untuk mengelola Konfigurasi SPP Bulanan
//            Otomatis, Master Jenis Tagihan, Tahun Ajaran, dan Rekening Bank.
// =========================================================================

import React, { useState, useEffect } from "react";
import SidebarNav from "@/components/ui/SidebarNav";
import TopHeader from "@/components/ui/TopHeader";
import GlassCard from "@/components/ui/GlassCard";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { formatIDR } from "@/lib/utils";
import { getTahunAjaranList, createTahunAjaran, setActiveTahunAjaran } from "@/lib/actions/tahun-ajaran";
import { getJenisTagihanList, createJenisTagihan } from "@/lib/actions/jenis-tagihan";
import { getWaliMuridList, updateUserPassword } from "@/lib/actions/user";
import {
  Settings,
  Calendar,
  Receipt,
  Building2,
  CheckCircle2,
  Save,
  CreditCard,
  Sparkles,
  Layers,
  CalendarDays,
  Users,
  KeyRound,
  Loader2,
} from "lucide-react";

export default function AdminPengaturanPage() {
  const [activeTab, setActiveTab] = useState("Konfigurasi SPP");
  const [loading, setLoading] = useState(true);

  // Form State SPP Auto Generate
  const [nominalSPP, setNominalSPP] = useState("250000");
  const [dueDateDay, setDueDateDay] = useState("10");
  const [sppSavedAlert, setSppSavedAlert] = useState(false);

  // Form State Tahun Ajaran
  const [tahunAjaran, setTahunAjaran] = useState("");
  const [tahunList, setTahunList] = useState<any[]>([]);
  const [savingTahun, setSavingTahun] = useState(false);

  // Form State Jenis Tagihan
  const [jenisNama, setJenisNama] = useState("");
  const [jenisNominal, setJenisNominal] = useState("");
  const [jenisType, setJenisType] = useState<"BULANAN" | "TAHUNAN">("BULANAN");
  const [jenisList, setJenisList] = useState<any[]>([]);
  const [savingJenis, setSavingJenis] = useState(false);

  // Form State Rekening Bank
  const [bankBca, setBankBca] = useState("1234567890");
  const [bankBsi, setBankBsi] = useState("7700123456");
  const [atasNama, setAtasNama] = useState("Yayasan Pondok Pesantren");
  const [bankSavedAlert, setBankSavedAlert] = useState(false);

  // State Wali Murid
  const [waliList, setWaliList] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, jData, wData] = await Promise.all([
        getTahunAjaranList(),
        getJenisTagihanList(),
        getWaliMuridList(),
      ]);
      setTahunList(tData);
      setJenisList(jData);
      setWaliList(wData);

      // Cari nominal SPP dari master jika ada
      const sppMaster = jData.find((j: any) => j.type === "BULANAN");
      if (sppMaster) {
        setNominalSPP(String(sppMaster.nominal));
      }
    } catch (err) {
      console.error("Gagal memuat pengaturan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetPassword = async (userId: string, waliName: string) => {
    const newPass = prompt(`Masukkan password baru untuk Wali ${waliName} (minimal 6 karakter):`, "wali123");
    if (!newPass) return;
    try {
      await updateUserPassword(userId, newPass);
      alert(`Password untuk ${waliName} berhasil diubah menjadi: ${newPass}`);
    } catch (err: any) {
      alert(err.message || "Gagal mengubah password.");
    }
  };

  const handleSaveSPP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sppMaster = jenisList.find((j: any) => j.type === "BULANAN");
      if (!sppMaster) {
        await createJenisTagihan({
          name: "SPP Bulanan Standar",
          type: "BULANAN",
          nominal: Number(nominalSPP),
        });
      }
      setSppSavedAlert(true);
      await loadData();
      setTimeout(() => setSppSavedAlert(false), 2000);
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan konfigurasi SPP.");
    }
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    setBankSavedAlert(true);
    setTimeout(() => setBankSavedAlert(false), 2000);
  };

  const handleAddTahun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tahunAjaran) return;
    setSavingTahun(true);
    try {
      await createTahunAjaran(tahunAjaran.trim());
      setTahunAjaran("");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal menambah tahun ajaran.");
    } finally {
      setSavingTahun(false);
    }
  };

  const handleSetActiveTahun = async (id: string) => {
    try {
      await setActiveTahunAjaran(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal mengaktifkan tahun ajaran.");
    }
  };

  const handleAddJenis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenisNama || !jenisNominal) return;
    setSavingJenis(true);
    try {
      await createJenisTagihan({
        name: jenisNama.trim(),
        type: jenisType,
        nominal: Number(jenisNominal),
      });
      setJenisNama("");
      setJenisNominal("");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal menambah jenis tagihan.");
    } finally {
      setSavingJenis(false);
    }
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
              Pengaturan Sistem & Parameter Keuangan
            </h1>
          </div>

          {/* Segmented Control Tabs */}
          <div style={{ maxWidth: "750px" }}>
            <SegmentedControl
              options={["Konfigurasi SPP", "Tahun Ajaran", "Master Tagihan", "Rekening Bank", "Akun Wali"]}
              selectedValue={activeTab}
              onChange={(val) => setActiveTab(val)}
            />
          </div>

          {/* TAB 1: KONFIGURASI SPP BULANAN OTOMATIS */}
          {activeTab === "Konfigurasi SPP" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem" }}>
              <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
                  <div style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                      Parameter Generator SPP Otomatis
                    </h3>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Atur acuan dasar nominal SPP dan jatuh tempo untuk penerbitan bulanan.
                    </p>
                  </div>
                </div>

                {sppSavedAlert && (
                  <div style={{ backgroundColor: "var(--status-lunas-bg)", border: "1px solid var(--status-lunas)", borderRadius: "6px", padding: "0.75rem 1rem", color: "var(--status-lunas)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle2 size={18} />
                    <span>Konfigurasi SPP Bulanan berhasil diperbarui!</span>
                  </div>
                )}

                <form onSubmit={handleSaveSPP} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nominal Standar SPP Bulanan (Rp)</label>
                    <input
                      type="number"
                      required
                      placeholder="250000"
                      value={nominalSPP}
                      onChange={(e) => setNominalSPP(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.9rem", marginTop: "0.2rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Batas Tanggal Jatuh Tempo Setiap Bulan</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>Tanggal</span>
                      <select
                        value={dueDateDay}
                        onChange={(e) => setDueDateDay(e.target.value)}
                        style={{ padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.9rem" }}
                      >
                        <option value="5">5</option>
                        <option value="10">10 (Rekomendasi)</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                        <option value="25">25</option>
                      </select>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>setiap bulannya</span>
                    </div>
                  </div>

                  <div style={{ backgroundColor: "var(--bg-surface-low)", border: "1px solid var(--border-glass)", borderRadius: "6px", padding: "0.85rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <strong>Sistem Potongan Beasiswa:</strong> Santri yang memiliki potongan beasiswa tetap akan otomatis dikurangi dari nominal acuan Rp {Number(nominalSPP).toLocaleString("id-ID")}.
                  </div>

                  <button type="submit" style={{ padding: "0.75rem", backgroundColor: "var(--primary)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <Save size={18} /> Simpan Parameter SPP
                  </button>
                </form>
              </GlassCard>
            </div>
          )}

          {/* TAB 2: TAHUN AJARAN */}
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
                          onClick={() => handleSetActiveTahun(t.id)}
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

          {/* TAB 3: MASTER TAGIHAN */}
          {activeTab === "Master Tagihan" && (
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
                      placeholder="Contoh: Uang Gedung / Buku Modul"
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
                        onChange={(e) => setJenisType(e.target.value as "BULANAN" | "TAHUNAN")}
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

          {/* TAB 4: REKENING BANK */}
          {activeTab === "Rekening Bank" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem" }}>
              <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
                  <div style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                      Rekening Bank Pembayaran Pesantren
                    </h3>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Nomor rekening ini ditampilkan ke Wali Murid saat melakukan transfer setoran.
                    </p>
                  </div>
                </div>

                {bankSavedAlert && (
                  <div style={{ backgroundColor: "var(--status-lunas-bg)", border: "1px solid var(--status-lunas)", borderRadius: "6px", padding: "0.75rem 1rem", color: "var(--status-lunas)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle2 size={18} />
                    <span>Rekening Bank Pesantren berhasil diperbarui!</span>
                  </div>
                )}

                <form onSubmit={handleSaveBank} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Atas Nama Rekening (Pemilik)</label>
                    <input
                      type="text"
                      required
                      placeholder="Yayasan Pondok Pesantren..."
                      value={atasNama}
                      onChange={(e) => setAtasNama(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.9rem", marginTop: "0.2rem" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>No. Rekening BCA</label>
                      <input
                        type="text"
                        placeholder="1234567890"
                        value={bankBca}
                        onChange={(e) => setBankBca(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.9rem", marginTop: "0.2rem" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>No. Rekening BSI</label>
                      <input
                        type="text"
                        placeholder="7700123456"
                        value={bankBsi}
                        onChange={(e) => setBankBsi(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.9rem", marginTop: "0.2rem" }}
                      />
                    </div>
                  </div>

                  <button type="submit" style={{ padding: "0.75rem", backgroundColor: "var(--primary)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <Save size={18} /> Simpan Data Rekening
                  </button>
                </form>
              </GlassCard>
            </div>
          )}

          {/* TAB 5: AKUN WALI MURID */}
          {activeTab === "Akun Wali" && (
            <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
                <div style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                  <Users size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                    Manajemen Akun Login Wali Murid
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Akun ini otomatis dibuat saat menambah santri baru. Gunakan fitur Reset Password jika wali murid lupa kata sandi.
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border-glass)", borderRadius: "8px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f7f3eb", borderBottom: "1px solid var(--border-glass)" }}>
                      <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase" }}>Nama Wali</th>
                      <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase" }}>No. HP (Username Login)</th>
                      <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase" }}>Jumlah Anak</th>
                      <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase", textAlign: "center" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waliList.length > 0 ? (
                      waliList.map((w) => (
                        <tr key={w.id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                          <td style={{ padding: "0.9rem 1rem", fontWeight: 700, color: "var(--text-main)" }}>{w.user?.name || "-"}</td>
                          <td style={{ padding: "0.9rem 1rem", fontFamily: "'JetBrains Mono', monospace", color: "var(--primary)", fontWeight: 700 }}>
                            {w.user?.phone || w.user?.username || "-"}
                          </td>
                          <td style={{ padding: "0.9rem 1rem", color: "var(--text-muted)", fontWeight: 600 }}>
                            {w._count?.siswa || 0} Santri
                          </td>
                          <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                            <button
                              onClick={() => handleResetPassword(w.user.id, w.user.name)}
                              style={{
                                padding: "0.4rem 0.75rem",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                backgroundColor: "var(--status-menunggu-bg)",
                                color: "var(--status-menunggu)",
                                border: "1px solid var(--status-menunggu)",
                                borderRadius: "4px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                              }}
                            >
                              <KeyRound size={14} /> Reset Password
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                          Belum ada akun wali murid yang terdaftar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </div>
      </main>
    </div>
  );
}



