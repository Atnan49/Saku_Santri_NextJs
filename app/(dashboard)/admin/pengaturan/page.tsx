"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman pengaturan sistem super-admin untuk mengelola SPP,
//            Tahun Ajaran, Master Tagihan (Edit & Delete), Rekening Bank,
//            Akun Wali, Staf & User, serta Audit Log.
// =========================================================================

import React, { useState, useEffect } from "react";
import SidebarNav from "@/components/ui/SidebarNav";
import TopHeader from "@/components/ui/TopHeader";
import GlassCard from "@/components/ui/GlassCard";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { formatIDR } from "@/lib/utils";
import { getTahunAjaranList, createTahunAjaran, setActiveTahunAjaran } from "@/lib/actions/tahun-ajaran";
import { getJenisTagihanList, createJenisTagihan, updateJenisTagihan, deleteJenisTagihan } from "@/lib/actions/jenis-tagihan";
import {
  getWaliMuridList,
  updateUserPassword,
  getUserList,
  createStaffUser,
  getAuditLogList,
  deleteUser,
} from "@/lib/actions/user";
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
  UserPlus,
  Shield,
  Activity,
} from "lucide-react";

export default function AdminPengaturanPage() {
  const [activeTab, setActiveTab] = useState("Konfigurasi SPP");
  const [loading, setLoading] = useState(true);

  // Form State SPP Auto Generate
  const [nominalSPP, setNominalSPP] = useState("250000");
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

  // Reset Password State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<{ id: string; name: string } | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("santri123");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // State Staf User & Audit Log
  const [userList, setUserList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [staffName, setStaffName] = useState("");
  const [staffUsername, setStaffUsername] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState<"ADMIN" | "BENDAHARA" | "KOPERASI">("BENDAHARA");
  const [savingStaff, setSavingStaff] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, jData, wData, settings, uData, aLogs] = await Promise.all([
        getTahunAjaranList(),
        getJenisTagihanList(),
        getWaliMuridList(),
        getInstitutionSettings(),
        getUserList(),
        getAuditLogList(50).catch(() => []),
      ]);
      setTahunList(tData);
      setJenisList(jData);
      setWaliList(wData);
      setUserList(uData);
      setAuditLogs(aLogs);

      const sppMaster = jData.find((j: any) => j.type === "BULANAN");
      if (sppMaster) {
        setNominalSPP(String(sppMaster.nominal));
      }

      if (settings) {
        if (settings.INSTITUTION_NAME) setInstName(settings.INSTITUTION_NAME);
        if (settings.BANK_NAME_1) setBank1Name(settings.BANK_NAME_1);
        if (settings.BANK_ACC_1) setBank1Acc(settings.BANK_ACC_1);
        if (settings.BANK_HOLDER_1) setBank1Holder(settings.BANK_HOLDER_1);
        if (settings.BANK_NAME_2) setBank2Name(settings.BANK_NAME_2);
        if (settings.BANK_ACC_2) setBank2Acc(settings.BANK_ACC_2);
        if (settings.BANK_HOLDER_2) setBank2Holder(settings.BANK_HOLDER_2);
      }
    } catch (err) {
      console.error("Gagal memuat data pengaturan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffUsername || !staffPassword) return;
    setSavingStaff(true);
    try {
      await createStaffUser({
        name: staffName.trim(),
        username: staffUsername.trim(),
        email: staffEmail.trim() || undefined,
        password: staffPassword,
        role: staffRole,
      });
      alert(`Akun staf baru (${staffRole}) berhasil dibuat!`);
      setStaffName("");
      setStaffUsername("");
      setStaffEmail("");
      setStaffPassword("");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal membuat akun staf.");
    } finally {
      setSavingStaff(false);
    }
  };

  const handleDeleteStaffUser = async (userId: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun user "${name}"?`)) return;
    try {
      await deleteUser(userId);
      alert(`Akun "${name}" berhasil dihapus.`);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus user.");
    }
  };

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
      await loadData();
      setTimeout(() => setBankSavedAlert(false), 2000);
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan pengaturan bank.");
    } finally {
      setSavingBank(false);
    }
  };

  const handleCreateTahun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tahunAjaran) return;
    setSavingTahun(true);
    try {
      await createTahunAjaran(tahunAjaran.trim());
      setTahunAjaran("");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal membuat tahun ajaran.");
    } finally {
      setSavingTahun(false);
    }
  };

  const handleActivateTahun = async (id: string) => {
    try {
      await setActiveTahunAjaran(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal mengaktifkan tahun ajaran.");
    }
  };

  const handleCreateJenis = async (e: React.FormEvent) => {
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
      alert(err.message || "Gagal membuat jenis tagihan.");
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

  const staffUsers = userList.filter((u) => u.role !== "WALIMURID");

  return (
    <div className="app-container">
      <SidebarNav activeItem="PENGATURAN" userRole="ADMINISTRATOR" userName="Admin Tata Usaha" />

      <main className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader title="SISTEM KEUANGAN INSTITUSI - PORTAL ADMINISTRATOR TU" />

        <div className="page-body" style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>
              KONFIGURASI PUSAT ADMINISTRATOR SUPER
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.2rem" }}>
              Pengaturan Sistem & Parameter Keuangan
            </h1>
          </div>

          {/* Segmented Control Tabs */}
          <div style={{ width: "100%", overflowX: "auto" }}>
            <SegmentedControl
              options={["Konfigurasi SPP", "Tahun Ajaran", "Master Tagihan", "Rekening Bank", "Akun Wali", "Staf & User", "Audit Log"]}
              selectedValue={activeTab}
              onChange={(val) => setActiveTab(val)}
            />
          </div>

          {/* TAB 1: KONFIGURASI SPP */}
          {activeTab === "Konfigurasi SPP" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem" }}>
              <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
                  <div style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                      Parameter SPP Standar
                    </h3>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Nominal acuan SPP bulanan yang digunakan saat auto-generate tagihan.
                    </p>
                  </div>
                </div>

                {sppSavedAlert && (
                  <div style={{ backgroundColor: "var(--status-lunas-bg)", border: "1px solid var(--status-lunas)", borderRadius: "6px", padding: "0.75rem 1rem", color: "var(--status-lunas)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle2 size={18} />
                    <span>Pengaturan SPP berhasil diperbarui!</span>
                  </div>
                )}

                <form onSubmit={handleSaveSPP} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nominal SPP Standar per Bulan (Rp)</label>
                    <input
                      type="number"
                      required
                      value={nominalSPP}
                      onChange={(e) => setNominalSPP(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.9rem", marginTop: "0.2rem" }}
                    />
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
                <form onSubmit={handleCreateTahun} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
                  <button type="submit" disabled={savingTahun} style={{ padding: "0.65rem", backgroundColor: "var(--primary)", color: "#fff", border: "none", borderRadius: "4px", fontWeight: 700, cursor: "pointer" }}>
                    {savingTahun ? "Menyimpan..." : "Simpan Tahun Ajaran"}
                  </button>
                </form>
              </GlassCard>

              <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                  Daftar Tahun Ajaran
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {tahunList.map((t) => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: t.isActive ? "var(--primary-light)" : "transparent" }}>
                      <div>
                        <span style={{ fontWeight: 800, color: "var(--text-main)" }}>{t.year}</span>
                        {t.isActive && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)" }}>(AKTIF)</span>}
                      </div>
                      {!t.isActive && (
                        <button onClick={() => handleActivateTahun(t.id)} style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", fontWeight: 700, backgroundColor: "var(--primary)", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                          Set Aktif
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
                  Tambah Master Jenis Tagihan
                </h3>
                <form onSubmit={handleCreateJenis} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nama Jenis Tagihan</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Uang Gedung / Seragam"
                      value={jenisNama}
                      onChange={(e) => setJenisNama(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", marginTop: "0.2rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nominal Standar (Rp)</label>
                    <input
                      type="number"
                      required
                      placeholder="Contoh: 500000"
                      value={jenisNominal}
                      onChange={(e) => setJenisNominal(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", marginTop: "0.2rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Tipe Tagihan</label>
                    <select
                      value={jenisType}
                      onChange={(e) => setJenisType(e.target.value as any)}
                      style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", marginTop: "0.2rem" }}
                    >
                      <option value="BULANAN">Bulanan (Rutinan)</option>
                      <option value="TAHUNAN">Tahunan / Sekali</option>
                      <option value="BEBAS">Bebas (Insidental)</option>
                    </select>
                  </div>

                  <button type="submit" disabled={savingJenis} style={{ padding: "0.65rem", backgroundColor: "var(--primary)", color: "#fff", border: "none", borderRadius: "4px", fontWeight: 700, cursor: "pointer" }}>
                    {savingJenis ? "Memproses..." : "Simpan Jenis Tagihan"}
                  </button>
                </form>
              </GlassCard>

              <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                  Daftar Master Jenis Tagihan
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {jenisList.map((j) => (
                    <div key={j.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", border: "1px solid var(--border-glass)", borderRadius: "6px" }}>
                      <div>
                        <div style={{ fontWeight: 800, color: "var(--text-main)" }}>{j.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {formatIDR(Number(j.nominal))} ({j.type})
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <button
                          onClick={() => handleStartEditJenis(j)}
                          style={{ padding: "0.35rem 0.55rem", fontSize: "0.75rem", fontWeight: 700, backgroundColor: "var(--primary-light)", color: "var(--primary)", border: "1px solid var(--primary)", borderRadius: "4px", cursor: "pointer" }}
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          disabled={deletingJenisId === j.id}
                          onClick={() => handleDeleteJenis(j.id, j.name)}
                          style={{ padding: "0.35rem 0.55rem", fontSize: "0.75rem", fontWeight: 700, backgroundColor: "rgba(220, 38, 38, 0.1)", color: "var(--status-ditolak)", border: "1px solid rgba(220, 38, 38, 0.2)", borderRadius: "4px", cursor: "pointer" }}
                        >
                          <Trash2 size={12} /> Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* TAB 4: REKENING BANK */}
          {activeTab === "Rekening Bank" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "1.5rem" }}>
              <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
                  <div style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                      Informasi Rekening Pembayaran
                    </h3>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Nomor rekening yang tampil pada portal Wali Murid & invoice kwitansi.
                    </p>
                  </div>
                </div>

                {bankSavedAlert && (
                  <div style={{ backgroundColor: "var(--status-lunas-bg)", border: "1px solid var(--status-lunas)", borderRadius: "6px", padding: "0.75rem 1rem", color: "var(--status-lunas)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle2 size={18} />
                    <span>Informasi Rekening & Institusi berhasil diperbarui!</span>
                  </div>
                )}

                <form onSubmit={handleSaveBank} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nama Institusi / Pesantren</label>
                    <input
                      type="text"
                      required
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.88rem", marginTop: "0.2rem" }}
                    />
                  </div>

                  <div style={{ border: "1px dashed var(--border-glass)", padding: "1rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--primary)" }}>REKENING UTAMA (BANK 1)</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)" }}>Nama Bank</label>
                        <input
                          type="text"
                          required
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
                          value={bank1Acc}
                          onChange={(e) => setBank1Acc(e.target.value)}
                          style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)" }}>Atas Nama</label>
                      <input
                        type="text"
                        required
                        value={bank1Holder}
                        onChange={(e) => setBank1Holder(e.target.value)}
                        style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingBank}
                    style={{ padding: "0.75rem", backgroundColor: "var(--primary)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 800, cursor: savingBank ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
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
                      waliList.map((w: any) => (
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

          {/* TAB 6: STAF & USER MANAGEMENT (FULL CONTROL) */}
          {activeTab === "Staf & User" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <GlassCard style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
                  <div style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                    <Shield size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                      Buat Akun Staf / Pengelola Baru
                    </h3>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Tambah staf baru untuk Admin TU atau Bendahara Keuangan.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateStaff} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nama Lengkap Staf</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ust. Ahmad Fauzi"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem", marginTop: "0.2rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Username Login</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: bendahara2"
                      value={staffUsername}
                      onChange={(e) => setStaffUsername(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem", marginTop: "0.2rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Peran Akses (Role)</label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as any)}
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem", marginTop: "0.2rem" }}
                    >
                      <option value="BENDAHARA">BENDAHARA KEUANGAN</option>
                      <option value="ADMIN">ADMINISTRATOR TU</option>
                      <option value="KOPERASI">KASIR KOPERASI / MART</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Password Akses</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem", marginTop: "0.2rem" }}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      disabled={savingStaff}
                      style={{ padding: "0.7rem 1.5rem", backgroundColor: "var(--primary)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 800, cursor: savingStaff ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                      {savingStaff ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                      Buat Akun Staf
                    </button>
                  </div>
                </form>
              </GlassCard>

              {/* Table User Staf */}
              <GlassCard style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-main)" }}>
                  Daftar User Pengelola System (Admin & Staf)
                </h3>

                <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border-glass)", borderRadius: "8px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f7f3eb", borderBottom: "1px solid var(--border-glass)" }}>
                        <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071" }}>Nama Staf</th>
                        <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071" }}>Username</th>
                        <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071" }}>Role</th>
                        <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textAlign: "center" }}>Aksi Control</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffUsers.map((u: any) => (
                        <tr key={u.id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                          <td style={{ padding: "0.85rem 1rem", fontWeight: 800, color: "var(--text-main)" }}>{u.name}</td>
                          <td style={{ padding: "0.85rem 1rem", fontFamily: "'JetBrains Mono', monospace", color: "var(--primary)", fontWeight: 700 }}>{u.username}</td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 800, backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                              <button
                                onClick={() => handleOpenResetModal(u.id, u.name)}
                                style={{ padding: "0.35rem 0.6rem", fontSize: "0.75rem", fontWeight: 700, backgroundColor: "var(--status-menunggu-bg)", color: "var(--status-menunggu)", border: "1px solid var(--status-menunggu)", borderRadius: "4px", cursor: "pointer" }}
                              >
                                Reset Pass
                              </button>
                              <button
                                onClick={() => handleDeleteStaffUser(u.id, u.name)}
                                style={{ padding: "0.35rem 0.6rem", fontSize: "0.75rem", fontWeight: 700, backgroundColor: "rgba(220, 38, 38, 0.1)", color: "var(--status-ditolak)", border: "1px solid rgba(220, 38, 38, 0.2)", borderRadius: "4px", cursor: "pointer" }}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {/* TAB 7: AUDIT LOG VIEWER (FULL CONTROL) */}
          {activeTab === "Audit Log" && (
            <GlassCard style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
                <div style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                  <Activity size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                    Jejak Audit Aktivitas System (AuditLog)
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Rekam jejak real-time seluruh tindakan sensitif (pembayaran tunai, edit tagihan, void, topup, dll).
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border-glass)", borderRadius: "8px", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f7f3eb", borderBottom: "1px solid var(--border-glass)" }}>
                      <th style={{ padding: "0.85rem 1rem", fontSize: "0.72rem", fontWeight: 800, color: "#516071" }}>WAKTU</th>
                      <th style={{ padding: "0.85rem 1rem", fontSize: "0.72rem", fontWeight: 800, color: "#516071" }}>USER / EKSEKUTOR</th>
                      <th style={{ padding: "0.85rem 1rem", fontSize: "0.72rem", fontWeight: 800, color: "#516071" }}>TINDAKAN (ACTION)</th>
                      <th style={{ padding: "0.85rem 1rem", fontSize: "0.72rem", fontWeight: 800, color: "#516071" }}>ENTITAS</th>
                      <th style={{ padding: "0.85rem 1rem", fontSize: "0.72rem", fontWeight: 800, color: "#516071" }}>RINCIAN LOG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length > 0 ? (
                      auditLogs.map((log: any) => (
                        <tr key={log.id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                          <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.76rem" }}>
                            {new Date(log.createdAt).toLocaleString("id-ID")}
                          </td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <div style={{ fontWeight: 800, color: "var(--text-main)" }}>{log.user?.name || "System"}</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{log.user?.role}</div>
                          </td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 800, backgroundColor: "var(--primary-light)", color: "var(--primary)", fontFamily: "'JetBrains Mono', monospace" }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>
                            {log.entityType} ({log.entityId?.slice(-6)})
                          </td>
                          <td style={{ padding: "0.85rem 1rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.74rem", color: "var(--text-muted)", maxWidth: "350px", wordBreak: "break-all" }}>
                            {log.details || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                          Belum ada jejak audit tercatat.
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

      {/* Modal Reset Password */}
      {resetModalOpen && selectedUserForReset && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}>
          <GlassCard style={{ maxWidth: "440px", width: "100%", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <KeyRound size={20} style={{ color: "var(--status-menunggu)" }} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                  Reset Password User
                </h3>
              </div>
              <button onClick={() => setResetModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-main)" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Masukkan password baru untuk user <strong>{selectedUserForReset.name}</strong>:
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
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-app)",
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
                    borderRadius: "6px",
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
                    borderRadius: "6px",
                    cursor: isResettingPassword ? "not-allowed" : "pointer",
                  }}
                  onClick={handleConfirmResetPassword}
                >
                  {isResettingPassword ? "MEMPROSES..." : "KONFIRMASI RESET"}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
