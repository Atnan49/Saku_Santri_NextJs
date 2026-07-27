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
import { getSantriList, createSantri, deleteSantri } from "@/lib/actions/santri";
import { getKelasList, createKelas } from "@/lib/actions/kelas";
import { createWaliMuridUser } from "@/lib/actions/user";
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
} from "lucide-react";

export default function AdminSantriPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [santriList, setSantriList] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [nisn, setNisn] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("7A");
  const [namaWali, setNamaWali] = useState("");
  const [noHpWali, setNoHpWali] = useState("");
  const [potongan, setPotongan] = useState("0");

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

  const handleAddSantri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !nisn) return;
    setSaving(true);
    setErrorMessage("");

    try {
      // 1. Cari atau buat Kelas
      let selectedKelas = kelasList.find((k) => k.name.toLowerCase() === kelas.trim().toLowerCase());
      if (!selectedKelas) {
        selectedKelas = await createKelas(kelas.trim());
      }

      // 2. Buat User Wali Murid
      const phoneClean = noHpWali.trim() || `08${Date.now().toString().slice(-9)}`;
      const waliRes = await createWaliMuridUser({
        phone: phoneClean,
        name: namaWali.trim() || `Wali ${nama.trim()}`,
        password: "wali123",
      });

      // 3. Buat Santri
      await createSantri({
        nisn: nisn.trim(),
        name: nama.trim(),
        kelasId: selectedKelas.id,
        waliId: waliRes.waliId!,
        potonganTetap: Number(potongan) || 0,
      });

      setIsAddModalOpen(false);
      // Reset Form
      setNisn("");
      setNama("");
      setNamaWali("");
      setNoHpWali("");
      setPotongan("0");

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

  return (
    <div className="app-container">
      <SidebarNav activeItem="SANTRI" userRole="ADMINISTRATOR" userName="Admin Tata Usaha" />

      <main className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader title="SISTEM KEUANGAN INSTITUSI - PORTAL ADMINISTRATOR TU" />

        <div className="page-body" style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Header Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                MASTER DATA KESISWAAN
              </div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.2rem" }}>
                Kelola Data Santri & Wali Murid
              </h1>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                padding: "0.65rem 1.25rem",
                fontSize: "0.85rem",
                fontWeight: 700,
                backgroundColor: "var(--primary)",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 2px 8px rgba(21, 69, 57, 0.25)",
              }}
            >
              <UserPlus size={18} /> Tambah Santri Baru
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="glass-card" style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ position: "relative", width: "320px", display: "flex", alignItems: "center" }}>
              <Search size={16} style={{ position: "absolute", left: "0.75rem", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Cari Nama Santri / NISN..."
                style={{
                  width: "100%",
                  paddingLeft: "2.25rem",
                  paddingRight: "0.85rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-app)",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  outline: "none",
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
              Total Santri: <span style={{ color: "var(--primary)", fontWeight: 800 }}>{santriList.length} Santri</span>
            </div>
          </div>

          {/* Santri Table */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border-glass)", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f7f3eb", borderBottom: "1px solid var(--border-glass)" }}>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase" }}>NISN</th>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase" }}>Nama Santri</th>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase" }}>Kelas</th>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase" }}>Wali Murid (No. HP)</th>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase" }}>Potongan SPP</th>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase", textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSantri.length > 0 ? (
                  filteredSantri.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                      <td style={{ padding: "0.9rem 1rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "var(--primary)" }}>{s.nisn}</td>
                      <td style={{ padding: "0.9rem 1rem", fontWeight: 700, color: "var(--text-main)" }}>{s.name}</td>
                      <td style={{ padding: "0.9rem 1rem", color: "var(--text-muted)" }}>{s.kelas?.name || "-"}</td>
                      <td style={{ padding: "0.9rem 1rem", color: "var(--text-main)" }}>
                        <div style={{ fontWeight: 600 }}>{s.wali?.user?.name || "-"}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{s.wali?.user?.phone || "-"}</div>
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontWeight: 700, color: "var(--status-lunas)" }}>
                        {s.potonganTetap > 0 ? formatIDR(s.potonganTetap) : "-"}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                        <button
                          onClick={() => handleDeleteSantri(s.id)}
                          style={{
                            padding: "0.35rem 0.6rem",
                            fontSize: "0.75rem",
                            backgroundColor: "var(--status-ditolak-bg)",
                            color: "var(--status-ditolak)",
                            border: "1px solid var(--status-ditolak)",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      Belum ada data santri. Klik <strong>"Tambah Santri Baru"</strong> di atas untuk menambahkan santri dari nol.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Tambah Santri */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", width: "100%", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                Tambah Data Santri Baru
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-main)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSantri} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>NISN Santri</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1234567890"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-glass)", borderRadius: "4px", marginTop: "0.2rem" }}
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
                    {Array.from(new Set(["7A", "7B", "8A", "8B", "9A", "10 IPA", "11 IPS", ...santriList.map((s) => s.kelas?.name).filter(Boolean)])).map((k) => (
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
                  {saving ? "Memproses..." : "Simpan Santri"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

