"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman generator tagihan (Bulanan & Tahunan).
// =========================================================================

import React, { useState, useEffect } from "react";
import SidebarNav from "@/components/ui/SidebarNav";
import TopHeader from "@/components/ui/TopHeader";
import GlassCard from "@/components/ui/GlassCard";
import { formatIDR } from "@/lib/utils";
import { generateMonthlyBills, createManualBill } from "@/lib/actions/tagihan";
import { getTahunAjaranList, getActiveTahunAjaran, createTahunAjaran } from "@/lib/actions/tahun-ajaran";
import { getJenisTagihanList, createJenisTagihan } from "@/lib/actions/jenis-tagihan";
import { getSantriList } from "@/lib/actions/santri";
import { getKelasList } from "@/lib/actions/kelas";
import {
  Receipt,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function AdminTagihanPage() {
  const [loadingSPP, setLoadingSPP] = useState(false);
  const [loadingManual, setLoadingManual] = useState(false);
  const [sppSuccess, setSppSuccess] = useState(false);
  const [sppMessage, setSppMessage] = useState("");
  const [manualSuccess, setManualSuccess] = useState(false);
  const [manualMessage, setManualMessage] = useState("");

  // Form State
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [namaTagihan, setNamaTagihan] = useState("");
  const [nominal, setNominal] = useState("");
  const [targetKelas, setTargetKelas] = useState("SEMUA");

  const [activeTahun, setActiveTahun] = useState<any>(null);
  const [jenisSPP, setJenisSPP] = useState<any>(null);
  const [santriList, setSantriList] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);

  useEffect(() => {
    async function initData() {
      try {
        const [tActive, jList, sList, kList] = await Promise.all([
          getActiveTahunAjaran(),
          getJenisTagihanList(),
          getSantriList(),
          getKelasList(),
        ]);

        setActiveTahun(tActive);
        setSantriList(sList);
        setKelasList(kList);

        const spp = jList.find((j: any) => j.type === "BULANAN");
        setJenisSPP(spp);
      } catch (err) {
        console.error("Gagal memuat data pendukung tagihan:", err);
      }
    }
    initData();
  }, []);

  const handleGenerateSPP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSPP(true);
    setSppSuccess(false);

    try {
      let tId = activeTahun?.id;
      if (!tId) {
        const tNew = await createTahunAjaran("2025/2026");
        tId = tNew.id;
      }

      let jId = jenisSPP?.id;
      if (!jId) {
        const jNew = await createJenisTagihan({
          name: "SPP Bulanan Standar",
          type: "BULANAN",
          nominal: 250000,
        });
        jId = jNew.id;
      }

      // Hitung tanggal jatuh tempo (tanggal 10 bulan tersebut)
      const dueDateStr = `${bulan}-10T23:59:59.000Z`;

      const res = await generateMonthlyBills({
        jenisTagihanId: jId,
        tahunAjaranId: tId,
        period: bulan,
        dueDate: dueDateStr,
      });

      setSppMessage(res.message);
      setSppSuccess(true);
    } catch (err: any) {
      alert(err.message || "Gagal menerbitkan tagihan SPP.");
    } finally {
      setLoadingSPP(false);
    }
  };

  const handleBuatManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaTagihan || !nominal) return;
    setLoadingManual(true);
    setManualSuccess(false);

    try {
      let tId = activeTahun?.id;
      if (!tId) {
        const tNew = await createTahunAjaran("2025/2026");
        tId = tNew.id;
      }

      // 1. Buat Jenis Tagihan Manual
      const jManual = await createJenisTagihan({
        name: namaTagihan.trim(),
        type: "TAHUNAN",
        nominal: Number(nominal),
      });

      // 2. Filter siswa sasaran
      const targetSiswa = targetKelas === "SEMUA"
        ? santriList
        : santriList.filter((s: any) => s.kelas?.name === targetKelas);

      if (targetSiswa.length === 0) {
        throw new Error("Tidak ada santri pada sasaran kelas yang dipilih.");
      }

      const sIds = targetSiswa.map((s: any) => s.id);
      const dueDateStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const res = await createManualBill({
        siswaIds: sIds,
        jenisTagihanId: jManual.id,
        tahunAjaranId: tId,
        nominalAwal: Number(nominal),
        dueDate: dueDateStr,
        catatanTagihan: `Tagihan kegiatan ${namaTagihan.trim()}`,
      });

      setManualMessage(res.message);
      setManualSuccess(true);
      setNamaTagihan("");
      setNominal("");
    } catch (err: any) {
      alert(err.message || "Gagal membuat tagihan manual.");
    } finally {
      setLoadingManual(false);
    }
  };

  return (
    <div className="app-container">
      <SidebarNav activeItem="TAGIHAN" userRole="ADMINISTRATOR" userName="Admin Tata Usaha" />

      <main className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader title="SISTEM KEUANGAN INSTITUSI - PORTAL ADMINISTRATOR TU" />

        <div className="page-body" style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>
              MODUL MANAJEMEN PIUTANG
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.2rem" }}>
              Generate & Terbitkan Tagihan Santri
            </h1>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem" }}>
            
            {/* Form 1: Generate SPP Bulanan */}
            <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
                <div style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                    Generate SPP Bulanan Otomatis
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Terbitkan SPP untuk seluruh santri aktif dengan memperhitungkan beasiswa.
                  </p>
                </div>
              </div>

              {sppSuccess && (
                <div style={{ backgroundColor: "var(--status-lunas-bg)", border: "1px solid var(--status-lunas)", borderRadius: "6px", padding: "0.75rem 1rem", color: "var(--status-lunas)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CheckCircle2 size={18} />
                  <span>{sppMessage || "Berhasil menerbitkan tagihan SPP bulanan untuk seluruh santri!"}</span>
                </div>
              )}

              <form onSubmit={handleGenerateSPP} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Pilih Periode Bulan & Tahun</label>
                  <input
                    type="month"
                    required
                    value={bulan}
                    onChange={(e) => setBulan(e.target.value)}
                    style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.88rem", marginTop: "0.2rem" }}
                  />
                </div>

                <div style={{ backgroundColor: "var(--bg-surface-low)", border: "1px solid var(--border-glass)", borderRadius: "6px", padding: "0.85rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <strong>Catatan Sistem:</strong> Sistem akan otomatis memotong SPP santri secara individu jika santri memiliki record Beasiswa/Potongan Tetap.
                </div>

                <button
                  type="submit"
                  disabled={loadingSPP}
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
                  {loadingSPP ? <Loader2 className="animate-spin" size={18} /> : <Receipt size={18} />}
                  {loadingSPP ? "Memproses..." : "Terbitkan SPP Bulanan"}
                </button>
              </form>
            </GlassCard>

            {/* Form 2: Buat Tagihan Kegiatan / Manual */}
            <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
                <div style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "var(--status-menunggu-bg)", color: "var(--status-menunggu)" }}>
                  <PlusCircle size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                    Buat Tagihan Manual / Kegiatan
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Terbitkan tagihan khusus seperti Uang Gedung, Seragam, atau Modul.
                  </p>
                </div>
              </div>

              {manualSuccess && (
                <div style={{ backgroundColor: "var(--status-lunas-bg)", border: "1px solid var(--status-lunas)", borderRadius: "6px", padding: "0.75rem 1rem", color: "var(--status-lunas)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CheckCircle2 size={18} />
                  <span>{manualMessage || "Berhasil menerbitkan tagihan manual baru!"}</span>
                </div>
              )}

              <form onSubmit={handleBuatManual} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nama Tagihan / Kegiatan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Uang Gedung Cicilan 1 / Buku Modul 2026"
                    value={namaTagihan}
                    onChange={(e) => setNamaTagihan(e.target.value)}
                    style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.88rem", marginTop: "0.2rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nominal (Rp)</label>
                    <input
                      type="number"
                      required
                      placeholder="Contoh: 500000"
                      value={nominal}
                      onChange={(e) => setNominal(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.88rem", marginTop: "0.2rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Target Sasaran</label>
                    <select
                      value={targetKelas}
                      onChange={(e) => setTargetKelas(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.88rem", marginTop: "0.2rem" }}
                    >
                      <option value="SEMUA">Seluruh Santri</option>
                      {kelasList.map((k) => (
                        <option key={k.id} value={k.name}>
                          Khusus Kelas {k.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingManual}
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
                  {loadingManual ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} />}
                  {loadingManual ? "Memproses..." : "Terbitkan Tagihan Manual"}
                </button>
              </form>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}

