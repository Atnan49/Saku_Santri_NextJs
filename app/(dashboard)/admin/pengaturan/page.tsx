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
import { getJenisTagihanList, createJenisTagihan, updateJenisTagihan, deleteJenisTagihan } from "@/lib/actions/jenis-tagihan";
import { getWaliMuridList, updateUserPassword } from "@/lib/actions/user";
import { getInstitutionSettings, updateInstitutionSettings } from "@/lib/actions/settings";
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
  Pencil,
  Trash2,
  X,
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
  const [jenisType, setJenisType] = useState<"BULANAN" | "TAHUNAN" | "BEBAS">("BULANAN");
  const [jenisList, setJenisList] = useState<any[]>([]);
  const [savingJenis, setSavingJenis] = useState(false);

  // Edit & Delete State Jenis Tagihan
  const [editingJenis, setEditingJenis] = useState<any | null>(null);
  const [editJenisNama, setEditJenisNama] = useState("");
  const [editJenisNominal, setEditJenisNominal] = useState("");
  const [editJenisType, setEditJenisType] = useState<"BULANAN" | "TAHUNAN" | "BEBAS">("BULANAN");
  const [updatingJenis, setUpdatingJenis] = useState(false);
  const [deletingJenisId, setDeletingJenisId] = useState<string | null>(null);

  // Form State Rekening Bank & Institusi
  const [instName, setInstName] = useState("Pesantren Digital Saku Santri");
  const [bank1Name, setBank1Name] = useState("BANK SYARIAH INDONESIA (BSI)");
  const [bank1Acc, setBank1Acc] = useState("7182 9910 22");
  const [bank1Holder, setBank1Holder] = useState("a.n. Yayasan Pendidikan Digital");
  const [bank2Name, setBank2Name] = useState("BANK MANDIRI");
  const [bank2Acc, setBank2Acc] = useState("131 00 2938 1192");
  const [bank2Holder, setBank2Holder] = useState("a.n. Yayasan Pendidikan Digital");
  const [bankSavedAlert, setBankSavedAlert] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

  // State Wali Murid
  const [waliList, setWaliList] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, jData, wData, settings] = await Promise.all([
        getTahunAjaranList(),
        getJenisTagihanList(),
        getWaliMuridList(),
        getInstitutionSettings(),
      ]);
      setTahunList(tData);
      setJenisList(jData);
      setWaliList(wData);

      // Cari nominal SPP dari master jika ada
      const sppMaster = jData.find((j: any) => j.type === "BULANAN");
      if (sppMaster) {
        setNominalSPP(String(sppMaster.nominal));
      }

      // Load settings
      setInstName(settings.INSTITUTION_NAME);
      setBank1Name(settings.BANK_NAME_1);
      setBank1Acc(settings.BANK_ACC_1);
      setBank1Holder(settings.BANK_HOLDER_1);
      setBank2Name(settings.BANK_NAME_2);
      setBank2Acc(settings.BANK_ACC_2);
      setBank2Holder(settings.BANK_HOLDER_2);
    } catch (err) {
      console.error("Gagal memuat pengaturan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<{ id: string; name: string } | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("santri123");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleOpenResetModal = (userId: string, name: string) => {
    setSelectedUserForReset({ id: userId, name });
    setNewPasswordInput("santri123");
    setResetModalOpen(true);
  };

  const handleConfirmResetPassword = async () => {
    if (!selectedUserForReset || !newPasswordInput) return;
    if (newPasswordInput.trim().length < 6) {
      alert("Password minimal 6 karakter.");
      return;
    }
    setIsResettingPassword(true);
    try {
      await updateUserPassword(selectedUserForReset.id, newPasswordInput.trim());
      alert(`Password untuk ${selectedUserForReset.name} berhasil diperbarui!`);
      setResetModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Gagal mengubah password.");
    } finally {
      setIsResettingPassword(false);
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
      } else {
        await updateJenisTagihan(sppMaster.id, {
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

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBank(true);
    try {
      await updateInstitutionSettings({
        INSTITUTION_NAME: instName.trim(),
        BANK_NAME_1: bank1Name.trim(),
        BANK_ACC_1: bank1Acc.trim(),
        BANK_HOLDER_1: bank1Holder.trim(),
        BANK_NAME_2: bank2Name.trim(),
        BANK_ACC_2: bank2Acc.trim(),
        BANK_HOLDER_2: bank2Holder.trim(),
      });
      setBankSavedAlert(true);
      setTimeout(() => setBankSavedAlert(false), 2000);
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan data rekening.");
    } finally {
      setSavingBank(false);
    }
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

  const handleStartEditJenis = (j: any) => {
    setEditingJenis(j);
    setEditJenisNama(j.name);
    setEditJenisNominal(String(j.nominal));
    setEditJenisType(j.type);
  };

  const handleUpdateJenis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJenis || !editJenisNama || !editJenisNominal) return;
    setUpdatingJenis(true);
    try {
      await updateJenisTagihan(editingJenis.id, {
        name: editJenisNama.trim(),
        type: editJenisType,
        nominal: Number(editJenisNominal),
      });
      setEditingJenis(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui jenis tagihan.");
    } finally {
      setUpdatingJenis(false);
    }
  };

  const handleDeleteJenis = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus jenis tagihan "${name}"?`)) return;
    setDeletingJenisId(id);
    try {
      await deleteJenisTagihan(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus jenis tagihan.");
    } finally {
      setDeletingJenisId(null);
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
                        onChange={(e) => setJenisType(e.target.value as "BULANAN" | "TAHUNAN" | "BEBAS")}
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
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ fontWeight: 800, color: "var(--primary)" }}>
                          Rp {Number(j.nominal).toLocaleString("id-ID")}
                        </div>
                        <div style={{ display: "flex", gap: "0.35rem" }}>
                          <button
                            title="Edit Jenis Tagihan"
                            onClick={() => handleStartEditJenis(j)}
                            style={{
                              padding: "0.35rem 0.6rem",
                              backgroundColor: "var(--bg-surface-low)",
                              color: "var(--primary)",
                              border: "1px solid var(--border-glass)",
                              borderRadius: "4px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                            }}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            title="Hapus Jenis Tagihan"
                            disabled={deletingJenisId === j.id}
                            onClick={() => handleDeleteJenis(j.id, j.name)}
                            style={{
                              padding: "0.35rem 0.6rem",
                              backgroundColor: "rgba(220, 38, 38, 0.1)",
                              color: "var(--status-ditolak)",
                              border: "1px solid rgba(220, 38, 38, 0.2)",
                              borderRadius: "4px",
                              cursor: deletingJenisId === j.id ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                            }}
                          >
                            {deletingJenisId === j.id ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <>
                                <Trash2 size={14} /> Hapus
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* MODAL EDIT JENIS TAGIHAN */}
          {editingJenis && (
            <div style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
              padding: "1rem"
            }}>
              <GlassCard style={{ width: "100%", maxWidth: "480px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                    Edit Jenis Tagihan
                  </h3>
                  <button
                    onClick={() => setEditingJenis(null)}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleUpdateJenis} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nama Jenis Tagihan</label>
                    <input
                      type="text"
                      required
                      value={editJenisNama}
                      onChange={(e) => setEditJenisNama(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.9rem", marginTop: "0.2rem" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nominal Standar (Rp)</label>
                      <input
                        type="number"
                        required
                        value={editJenisNominal}
                        onChange={(e) => setEditJenisNominal(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.9rem", marginTop: "0.2rem" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Tipe Tagihan</label>
                      <select
                        value={editJenisType}
                        onChange={(e) => setEditJenisType(e.target.value as "BULANAN" | "TAHUNAN" | "BEBAS")}
                        style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.9rem", marginTop: "0.2rem" }}
                      >
                        <option value="BULANAN">Bulanan</option>
                        <option value="TAHUNAN">Tahunan</option>
                        <option value="BEBAS">Bebas/Kegiatan</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => setEditingJenis(null)}
                      style={{ padding: "0.6rem 1.25rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "transparent", color: "var(--text-main)", fontWeight: 700, cursor: "pointer" }}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={updatingJenis}
                      style={{ padding: "0.6rem 1.25rem", backgroundColor: "var(--primary)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 700, cursor: updatingJenis ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                      {updatingJenis ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
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
                      Pengaturan Rekening Bank & Informasi Pesantren
                    </h3>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Informasi ini ditampilkan secara dinamis ke Wali Murid saat melakukan transfer setoran.
                    </p>
                  </div>
                </div>

                {bankSavedAlert && (
                  <div style={{ backgroundColor: "var(--status-lunas-bg)", border: "1px solid var(--status-lunas)", borderRadius: "6px", padding: "0.75rem 1rem", color: "var(--status-lunas)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle2 size={18} />
                    <span>Data rekening bank & institusi berhasil diperbarui!</span>
                  </div>
                )}

                <form onSubmit={handleSaveBank} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nama Institusi / Pesantren</label>
                    <input
                      type="text"
                      required
                      placeholder="Pesantren Digital Saku Santri"
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.9rem", marginTop: "0.2rem" }}
                    />
                  </div>

                  {/* Rekening Utama (Bank 1) */}
                  <div style={{ border: "1px dashed var(--border-glass)", padding: "1rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--primary)" }}>REKENING UTAMA (BANK 1)</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)" }}>Nama Bank</label>
                        <input
                          type="text"
                          required
                          placeholder="BANK SYARIAH INDONESIA (BSI)"
                          value={bank1Name}
                          onChange={(e) => setBank1Name(e.target.value)}
                          style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)" }}>No. Rekening</label>
                        <input
                          type="text"
                          required
                          placeholder="7182 9910 22"
                          value={bank1Acc}
                          onChange={(e) => setBank1Acc(e.target.value)}
                          style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)" }}>Atas Nama (Pemilik Rekening)</label>
                      <input
                        type="text"
                        required
                        placeholder="a.n. Yayasan Pendidikan Digital"
                        value={bank1Holder}
                        onChange={(e) => setBank1Holder(e.target.value)}
                        style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>

                  {/* Rekening Sekunder (Bank 2) */}
                  <div style={{ border: "1px dashed var(--border-glass)", padding: "1rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--primary)" }}>REKENING ALTERNATIF (BANK 2)</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)" }}>Nama Bank</label>
                        <input
                          type="text"
                          required
                          placeholder="BANK MANDIRI"
                          value={bank2Name}
                          onChange={(e) => setBank2Name(e.target.value)}
                          style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)" }}>No. Rekening</label>
                        <input
                          type="text"
                          required
                          placeholder="131 00 2938 1192"
                          value={bank2Acc}
                          onChange={(e) => setBank2Acc(e.target.value)}
                          style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)" }}>Atas Nama (Pemilik Rekening)</label>
                      <input
                        type="text"
                        required
                        placeholder="a.n. Yayasan Pendidikan Digital"
                        value={bank2Holder}
                        onChange={(e) => setBank2Holder(e.target.value)}
                        style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingBank}
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "var(--primary)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: 800,
                      cursor: savingBank ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {savingBank ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    <span>{savingBank ? "Menyimpan..." : "SIMPAN PENGATURAN REKENING"}</span>
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
                              onClick={() => handleOpenResetModal(w.user.id, w.user.name)}
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

      {resetModalOpen && selectedUserForReset && (
        <div className="modal-overlay" onClick={() => setResetModalOpen(false)}>
          <div className="glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px", width: "100%", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <KeyRound size={20} style={{ color: "var(--status-menunggu)" }} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                  Reset Password Wali Murid
                </h3>
              </div>
              <button onClick={() => setResetModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-main)" }}>
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Masukkan password baru untuk wali murid <strong>{selectedUserForReset.name}</strong>:
              </p>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                  PASSWORD BARU (MINIMAL 6 KARAKTER)
                </label>
                <input
                  type="text"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "var(--text-main)",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    outline: "none",
                  }}
                  placeholder="Contoh: santri123"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  style={{
                    padding: "0.6rem 1.25rem",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    backgroundColor: "transparent",
                    color: "var(--text-main)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => setResetModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  disabled={isResettingPassword}
                  style={{
                    padding: "0.6rem 1.25rem",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    backgroundColor: "var(--status-menunggu)",
                    color: "#FFF",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isResettingPassword ? "not-allowed" : "pointer",
                  }}
                  onClick={handleConfirmResetPassword}
                >
                  {isResettingPassword ? "MEMPROSES..." : "KONFIRMASI RESET"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



