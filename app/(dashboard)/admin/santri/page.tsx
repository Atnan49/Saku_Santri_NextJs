"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman pengelolaan data master Santri, Kelas, dan Wali Murid.
// =========================================================================

import React, { useState, useEffect } from "react";
import SidebarNav from "@/components/ui/SidebarNav";
import TopHeader from "@/components/ui/TopHeader";
import GlassCard from "@/components/ui/GlassCard";
import { formatIDR } from "@/lib/utils";
import { getSantriList, createSantri, updateSantri, deleteSantri } from "@/lib/actions/santri";
import { getKelasList, createKelas } from "@/lib/actions/kelas";
import { createWaliMuridUser, getWaliMuridList } from "@/lib/actions/user";
import { adminTopUpCash, adminUpdateLimitHarian } from "@/lib/actions/uang-saku";
import {
  Users,
  UserPlus,
  Search,
  BookOpen,
  UserCheck,
  Plus,
  X,
  CheckCircle2,
  Trash2,
  Edit,
  Loader2,
  DollarSign,
  Sliders,
  Coins,
} from "lucide-react";

export default function AdminSantriPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [santriList, setSantriList] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSantriId, setEditingSantriId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State Santri
  const [nisn, setNisn] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [namaWali, setNamaWali] = useState("");
  const [noHpWali, setNoHpWali] = useState("");
  const [potongan, setPotongan] = useState("0");

  // Full Control State: Topup Saku & Limit Jajan
  const [topupModalSantri, setTopupModalSantri] = useState<any | null>(null);
  const [topupNominal, setTopupNominal] = useState("");
  const [topupCatatan, setTopupCatatan] = useState("");
  const [submittingTopup, setSubmittingTopup] = useState(false);

  const [limitModalSantri, setLimitModalSantri] = useState<any | null>(null);
  const [limitNominal, setLimitNominal] = useState("");
  const [submittingLimit, setSubmittingLimit] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, kData] = await Promise.all([getSantriList(), getKelasList()]);
      setSantriList(sData);
      setKelasList(kData);
    } catch (err) {
      console.error("Gagal memuat data santri:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSantri = santriList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery)
  );

  const handleOpenAdd = () => {
    setEditingSantriId(null);
    setNisn("");
    setNama("");
    setKelas("");
    setNamaWali("");
    setNoHpWali("");
    setPotongan("0");
    setErrorMessage("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: any) => {
    setEditingSantriId(s.id);
    setNisn(s.nisn);
    setNama(s.name);
    setKelas(s.kelas?.name || "");
    setNamaWali(s.wali?.user?.name || "");
    setNoHpWali(s.wali?.user?.phone || "");
    setPotongan(String(s.potonganTetap || 0));
    setErrorMessage("");
    setIsAddModalOpen(true);
  };

  const handleSaveSantri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama) return;
    setSaving(true);
    setErrorMessage("");

    try {
      let kelasObj = kelasList.find((k) => k.name.toLowerCase() === kelas.trim().toLowerCase());
      if (!kelasObj && kelas.trim()) {
        kelasObj = await createKelas(kelas.trim());
      }

      if (editingSantriId) {
        await updateSantri(editingSantriId, {
          name: nama.trim(),
          kelasId: kelasObj?.id,
          waliName: namaWali.trim(),
          waliPhone: noHpWali.trim(),
          potonganTetap: Number(potongan) || 0,
        });
      } else {
        let waliId: string | undefined;

        if (namaWali && noHpWali) {
          const wUser = await createWaliMuridUser({
            phone: noHpWali.trim(),
            name: namaWali.trim(),
            password: "Password123!",
          });
          waliId = wUser.waliId;
        }

        if (!waliId) {
          // Gunakan wali murid pertama yang ada sebagai fallback jika tidak diisi
          const existingWalis = await getWaliMuridList();
          if (existingWalis.length > 0) {
            waliId = existingWalis[0].id;
          } else {
            throw new Error("Wali murid wajib diisi. Silakan isi Nama & No HP Wali.");
          }
        }

        await createSantri({
          nisn: nisn.trim() || `SNT-${Date.now().toString().slice(-6)}`,
          name: nama.trim(),
          kelasId: kelasObj ? kelasObj.id : kelasList[0]?.id || "",
          waliId: waliId!,
          potonganTetap: Number(potongan) || 0,
        });
      }

      setIsAddModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan data santri.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSantri = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data santri ini?")) return;
    try {
      await deleteSantri(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus santri.");
    }
  };

  // Topup Tunai TU Handler
  const handleOpenTopup = (s: any) => {
    setTopupModalSantri(s);
    setTopupNominal("");
    setTopupCatatan("Top-up Tunai Kasir TU");
  };

  const handleSubmitTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topupModalSantri || !topupNominal) return;
    setSubmittingTopup(true);
    try {
      const res = await adminTopUpCash({
        siswaId: topupModalSantri.id,
        nominal: Number(topupNominal),
        catatan: topupCatatan,
      });
      alert(res.message);
      setTopupModalSantri(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal melakukan topup tunai.");
    } finally {
      setSubmittingTopup(false);
    }
  };

  // Limit Jajan Handler
  const handleOpenLimit = (s: any) => {
    setLimitModalSantri(s);
    setLimitNominal(String(s.limitHarian || 20000));
  };

  const handleSubmitLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitModalSantri || !limitNominal) return;
    setSubmittingLimit(true);
    try {
      await adminUpdateLimitHarian(limitModalSantri.id, Number(limitNominal));
      alert(`Limit jajan harian ${limitModalSantri.name} berhasil diubah menjadi ${formatIDR(Number(limitNominal))}.`);
      setLimitModalSantri(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal mengubah limit harian.");
    } finally {
      setSubmittingLimit(false);
    }
  };

  return (
    <div className="app-container">
      <SidebarNav activeItem="SANTRI" userRole="ADMINISTRATOR" userName="Admin Tata Usaha" />

      <main className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader title="SISTEM KEUANGAN INSTITUSI - PORTAL ADMINISTRATOR TU" />

        <div className="page-body" style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                MODUL MANAJEMEN MASTER DATA SANTRI
              </div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.2rem" }}>
                Buku Besar Santri & Saku Digital
              </h1>
            </div>

            <button
              onClick={handleOpenAdd}
              style={{
                padding: "0.75rem 1.25rem",
                backgroundColor: "var(--primary)",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.88rem",
              }}
            >
              <UserPlus size={18} /> Tambah Santri Baru
            </button>
          </div>

          {/* Table Container */}
          <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)" }}>
                <Search size={16} style={{ color: "var(--text-muted)" }} />
                <input
                  type="text"
                  placeholder="Cari santri..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: "none", outline: "none", backgroundColor: "transparent", fontSize: "0.85rem", color: "var(--text-main)", width: "220px" }}
                />
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-glass)", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "0.75rem 1rem" }}>Kode / Nama Santri</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Kelas</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Wali Murid & Kontak</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Saldo Saku / Limit</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Beasiswa SPP</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Aksi Master & Saku</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "3rem", textAlign: "center" }}>
                      <Loader2 className="animate-spin" size={32} style={{ color: "var(--primary)", margin: "0 auto" }} />
                    </td>
                  </tr>
                ) : filteredSantri.length > 0 ? (
                  filteredSantri.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div style={{ fontWeight: 800, color: "var(--text-main)" }}>{s.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{s.nisn}</div>
                      </td>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span style={{ fontWeight: 700, backgroundColor: "var(--primary-light)", color: "var(--primary)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>
                          Kelas {s.kelas?.name}
                        </span>
                      </td>
                      <td style={{ padding: "0.9rem 1rem", color: "var(--text-main)" }}>
                        <div style={{ fontWeight: 600 }}>{s.wali?.user?.name || "-"}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.wali?.user?.phone || "-"}</div>
                      </td>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div style={{ fontWeight: 800, color: "var(--primary)" }}>{formatIDR(Number(s.saldoSaku || 0))}</div>
                        <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                          Limit: {formatIDR(Number(s.limitHarian || 20000))}/hr
                        </div>
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontWeight: 700, color: "var(--status-lunas)" }}>
                        {s.potonganTetap > 0 ? formatIDR(s.potonganTetap) : "-"}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "0.35rem", justifyContent: "center" }}>
                          <button
                            title="Top-up Saku Tunai"
                            onClick={() => handleOpenTopup(s)}
                            style={{
                              padding: "0.35rem 0.55rem",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              backgroundColor: "var(--primary-light)",
                              color: "var(--primary)",
                              border: "1px solid var(--primary)",
                              borderRadius: "4px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.2rem",
                            }}
                          >
                            <Coins size={12} /> Topup TU
                          </button>
                          <button
                            title="Atur Limit Jajan"
                            onClick={() => handleOpenLimit(s)}
                            style={{
                              padding: "0.35rem 0.55rem",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              backgroundColor: "var(--bg-surface-low)",
                              color: "var(--text-main)",
                              border: "1px solid var(--border-glass)",
                              borderRadius: "4px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.2rem",
                            }}
                          >
                            <Sliders size={12} /> Limit
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            style={{
                              padding: "0.35rem 0.55rem",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              backgroundColor: "var(--bg-app)",
                              color: "var(--text-main)",
                              border: "1px solid var(--border-glass)",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            <Edit size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSantri(s.id)}
                            style={{
                              padding: "0.35rem 0.55rem",
                              fontSize: "0.75rem",
                              backgroundColor: "rgba(220, 38, 38, 0.1)",
                              color: "var(--status-ditolak)",
                              border: "1px solid rgba(220, 38, 38, 0.2)",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      Belum ada data santri ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL TOPUP TUNAI TU */}
      {topupModalSantri && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}>
          <GlassCard style={{ width: "100%", maxWidth: "440px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                  Top-up Saku Santri Tunai (TU)
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {topupModalSantri.name} (Kelas {topupModalSantri.kelas?.name})
                </p>
              </div>
              <button onClick={() => setTopupModalSantri(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitTopup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nominal Top-up Tunai (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 100000"
                  value={topupNominal}
                  onChange={(e) => setTopupNominal(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.95rem", fontWeight: 800, marginTop: "0.2rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Catatan / Keterangan</label>
                <input
                  type="text"
                  value={topupCatatan}
                  onChange={(e) => setTopupCatatan(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem", marginTop: "0.2rem" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setTopupModalSantri(null)} style={{ padding: "0.6rem 1.25rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "transparent", color: "var(--text-main)", fontWeight: 700, cursor: "pointer" }}>
                  Batal
                </button>
                <button type="submit" disabled={submittingTopup} style={{ padding: "0.6rem 1.25rem", backgroundColor: "var(--primary)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 700, cursor: submittingTopup ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {submittingTopup ? <Loader2 className="animate-spin" size={16} /> : <Coins size={16} />}
                  Proses Top-up
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* MODAL EDIT LIMIT JAJAN HARIAN */}
      {limitModalSantri && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}>
          <GlassCard style={{ width: "100%", maxWidth: "440px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                  Atur Limit Jajan Harian
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {limitModalSantri.name} (Kelas {limitModalSantri.kelas?.name})
                </p>
              </div>
              <button onClick={() => setLimitModalSantri(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitLimit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nominal Limit Jajan Harian (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 20000"
                  value={limitNominal}
                  onChange={(e) => setLimitNominal(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.95rem", fontWeight: 800, marginTop: "0.2rem" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setLimitModalSantri(null)} style={{ padding: "0.6rem 1.25rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "transparent", color: "var(--text-main)", fontWeight: 700, cursor: "pointer" }}>
                  Batal
                </button>
                <button type="submit" disabled={submittingLimit} style={{ padding: "0.6rem 1.25rem", backgroundColor: "var(--primary)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 700, cursor: submittingLimit ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {submittingLimit ? <Loader2 className="animate-spin" size={16} /> : <Sliders size={16} />}
                  Simpan Limit
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Modal Tambah / Edit Santri */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", width: "100%", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                {editingSantriId ? "Edit Data Santri" : "Tambah Data Santri Baru"}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-main)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSantri} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Kode Unik Santri (Otomatis Sistem)</label>
                <input
                  type="text"
                  readOnly
                  value={`SNT-${new Date().getFullYear()}-${String(santriList.length + 1).padStart(4, "0")}`}
                  style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", marginTop: "0.2rem", backgroundColor: "#f0f4f2", color: "var(--primary)", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nama Lengkap Santri</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Santri"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", marginTop: "0.2rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Kelas (Ketik / Pilih Suggestion)</label>
                  <input
                    type="text"
                    required
                    list="kelas-suggestions"
                    placeholder="Contoh: 7A, 8B, 10 IPA..."
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", marginTop: "0.2rem" }}
                  />
                  <datalist id="kelas-suggestions">
                    {Array.from(new Set([...kelasList.map((k) => k.name), ...santriList.map((s) => s.kelas?.name).filter(Boolean)])).map((k) => (
                      <option key={k} value={k} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Potongan SPP (Rp)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={potongan}
                    onChange={(e) => setPotongan(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", marginTop: "0.2rem" }}
                  />
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--border-glass)", margin: "0.5rem 0" }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nama Wali Murid</label>
                  <input
                    type="text"
                    placeholder="Nama Orang Tua"
                    value={namaWali}
                    onChange={(e) => setNamaWali(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", marginTop: "0.2rem" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>No. HP Wali (Login)</label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={noHpWali}
                    onChange={(e) => setNoHpWali(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", marginTop: "0.2rem" }}
                  />
                </div>
              </div>

              {errorMessage && (
                <div style={{ backgroundColor: "var(--status-ditolak-bg)", border: "1px solid var(--status-ditolak)", borderRadius: "4px", padding: "0.6rem 0.85rem", fontSize: "0.82rem", color: "var(--status-ditolak)" }}>
                  {errorMessage}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: "0.6rem 1.25rem", border: "1px solid var(--border-glass)", borderRadius: "4px", background: "none", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: "0.6rem 1.25rem", border: "none", borderRadius: "4px", backgroundColor: "var(--primary)", color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {saving ? "Memproses..." : editingSantriId ? "Simpan Perubahan" : "Simpan Santri"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

