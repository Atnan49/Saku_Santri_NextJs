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
import {
  generateMonthlyBills,
  createManualBill,
  getTagihanList,
  adminDirectCashPayment,
  adminUpdateBill,
  adminVoidBill,
} from "@/lib/actions/tagihan";
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
  DollarSign,
  Pencil,
  Trash2,
  X,
  Search,
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

  // State Daftar Tagihan & Actions
  const [bills, setBills] = useState<any[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("SEMUA");

  // Modals State
  const [cashModalBill, setCashModalBill] = useState<any | null>(null);
  const [cashNominal, setCashNominal] = useState("");
  const [cashCatatan, setCashCatatan] = useState("");
  const [submittingCash, setSubmittingCash] = useState(false);

  const [editModalBill, setEditModalBill] = useState<any | null>(null);
  const [editNominal, setEditNominal] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editCatatan, setEditCatatan] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const loadAllBills = async () => {
    setLoadingBills(true);
    try {
      const data = await getTagihanList();
      setBills(data);
    } catch (err) {
      console.error("Gagal memuat daftar tagihan:", err);
    } finally {
      setLoadingBills(false);
    }
  };

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
        await loadAllBills();
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
        const tList = await getTahunAjaranList();
        if (tList.length > 0) {
          tId = tList[0].id;
        } else {
          const tNew = await createTahunAjaran("2025/2026");
          tId = tNew.id;
        }
      }

      let jId = jenisSPP?.id;
      if (!jId) {
        const jList = await getJenisTagihanList();
        const existing = jList.find((j: any) => j.type === "BULANAN" || j.name.toLowerCase().includes("spp"));
        if (existing) {
          jId = existing.id;
        } else {
          const jNew = await createJenisTagihan({
            name: "SPP Bulanan Standar",
            type: "BULANAN",
            nominal: 250000,
          });
          jId = jNew.id;
        }
      }

      const dueDateStr = `${bulan}-10T23:59:59.000Z`;

      const res = await generateMonthlyBills({
        jenisTagihanId: jId,
        tahunAjaranId: tId,
        period: bulan,
        dueDate: dueDateStr,
      });

      setSppMessage(res.message);
      setSppSuccess(true);
      await loadAllBills();
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

      const jManual = await createJenisTagihan({
        name: namaTagihan.trim(),
        type: "TAHUNAN",
        nominal: Number(nominal),
      });

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
      await loadAllBills();
    } catch (err: any) {
      alert(err.message || "Gagal membuat tagihan manual.");
    } finally {
      setLoadingManual(false);
    }
  };

  // Handlers Full Control Admin
  const handleOpenCashModal = (bill: any) => {
    setCashModalBill(bill);
    const sisa = Math.max(0, Number(bill.nominalAkhir) - Number(bill.nominalTerbayar || 0));
    setCashNominal(String(sisa));
    setCashCatatan("Pembayaran tunai langsung di meja TU");
  };

  const handleSubmitCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashModalBill || !cashNominal) return;
    setSubmittingCash(true);
    try {
      const res = await adminDirectCashPayment({
        tagihanId: cashModalBill.id,
        nominalSetoran: Number(cashNominal),
        catatan: cashCatatan,
      });
      alert(res.message);
      setCashModalBill(null);
      await loadAllBills();
    } catch (err: any) {
      alert(err.message || "Gagal mencatat pembayaran tunai.");
    } finally {
      setSubmittingCash(false);
    }
  };

  const handleOpenEditModal = (bill: any) => {
    setEditModalBill(bill);
    setEditNominal(String(bill.nominalAkhir));
    setEditDueDate(new Date(bill.dueDate).toISOString().slice(0, 10));
    setEditCatatan(bill.catatanTagihan || "");
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalBill || !editNominal) return;
    setSubmittingEdit(true);
    try {
      await adminUpdateBill(editModalBill.id, {
        nominalAkhir: Number(editNominal),
        dueDate: editDueDate,
        catatanTagihan: editCatatan,
      });
      alert("Tagihan berhasil diperbarui!");
      setEditModalBill(null);
      await loadAllBills();
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui tagihan.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleVoidBill = async (bill: any) => {
    const alasan = prompt(`Masukkan alasan pembatalan tagihan ${bill.jenisTagihan?.name} (${bill.siswa?.name}):`);
    if (!alasan) return;
    try {
      const res = await adminVoidBill(bill.id, alasan);
      alert(res.message);
      await loadAllBills();
    } catch (err: any) {
      alert(err.message || "Gagal membatalkan tagihan.");
    }
  };

  // Filter bills
  const filteredBills = bills.filter((b) => {
    const matchSearch =
      b.siswa?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.jenisTagihan?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.period?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "SEMUA" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="app-container">
      <SidebarNav activeItem="TAGIHAN" userRole="ADMINISTRATOR" userName="Admin Tata Usaha" />

      <main className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader title="SISTEM KEUANGAN INSTITUSI - PORTAL ADMINISTRATOR TU" />

        <div className="page-body" style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>
              MODUL MANAJEMEN PIUTANG SUPER-ADMIN
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.2rem" }}>
              Generate, Kelola & Bayar Tunai Tagihan Santri
            </h1>
          </div>

          {/* SECTION 1: Generator Cards */}
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

          {/* SECTION 2: Daftar Tagihan & Controls (Full Control Admin) */}
          <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>
                  Daftar Tagihan & Kontrol Langsung TU
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Terima setoran tunai meja TU, edit nominal/due date, atau batalkan tagihan.
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.45rem 0.75rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)" }}>
                  <Search size={16} style={{ color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    placeholder="Cari santri / tagihan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: "none", outline: "none", backgroundColor: "transparent", fontSize: "0.82rem", color: "var(--text-main)", width: "180px" }}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: "0.45rem 0.75rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.82rem", color: "var(--text-main)" }}
                >
                  <option value="SEMUA">Semua Status</option>
                  <option value="BELUM_BAYAR">BELUM BAYAR</option>
                  <option value="DIBAYAR_SEBAGIAN">DIBAYAR SEBAGIAN</option>
                  <option value="MENUNGGU_VERIFIKASI_ADMIN">MENUNGGU VERIFIKASI ADMIN</option>
                  <option value="MENUNGGU_APPROVAL_BENDAHARA">MENUNGGU APPROVAL BENDAHARA</option>
                  <option value="LUNAS">LUNAS</option>
                </select>
              </div>
            </div>

            {loadingBills ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                <Loader2 className="animate-spin" size={32} style={{ color: "var(--primary)" }} />
              </div>
            ) : filteredBills.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Tidak ada data tagihan ditemukan.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-glass)", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                      <th style={{ padding: "0.75rem 1rem" }}>Santri & Kelas</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Jenis Tagihan</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Periode</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Nominal / Terbayar</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Jatuh Tempo</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Aksi Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((b) => {
                      const nominalAkhir = Number(b.nominalAkhir);
                      const nominalTerbayar = Number(b.nominalTerbayar || 0);
                      const sisa = Math.max(0, nominalAkhir - nominalTerbayar);
                      const isLunas = b.status === "LUNAS";

                      return (
                        <tr key={b.id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <div style={{ fontWeight: 800, color: "var(--text-main)" }}>{b.siswa?.name}</div>
                            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{b.siswa?.kelas?.name}</div>
                          </td>
                          <td style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>
                            {b.jenisTagihan?.name}
                          </td>
                          <td style={{ padding: "0.85rem 1rem" }}>{b.period || "-"}</td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <div style={{ fontWeight: 800, color: "var(--text-main)" }}>{formatIDR(nominalAkhir)}</div>
                            {nominalTerbayar > 0 && (
                              <div style={{ fontSize: "0.74rem", color: "var(--status-lunas)", fontWeight: 700 }}>
                                Terbayar: {formatIDR(nominalTerbayar)} (Sisa: {formatIDR(sisa)})
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            {new Date(b.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <span
                              style={{
                                padding: "0.25rem 0.6rem",
                                borderRadius: "999px",
                                fontSize: "0.7rem",
                                fontWeight: 800,
                                backgroundColor:
                                  b.status === "LUNAS" ? "var(--status-lunas-bg)" :
                                  b.status === "DIBAYAR_SEBAGIAN" ? "rgba(59, 130, 246, 0.15)" :
                                  b.status.includes("MENUNGGU") ? "var(--status-menunggu-bg)" : "rgba(220, 38, 38, 0.1)",
                                color:
                                  b.status === "LUNAS" ? "var(--status-lunas)" :
                                  b.status === "DIBAYAR_SEBAGIAN" ? "#2563eb" :
                                  b.status.includes("MENUNGGU") ? "var(--status-menunggu)" : "var(--status-ditolak)",
                              }}
                            >
                              {b.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "0.35rem", justifyContent: "flex-end" }}>
                              {!isLunas && (
                                <button
                                  title="Bayar Tunai Meja TU"
                                  onClick={() => handleOpenCashModal(b)}
                                  style={{
                                    padding: "0.35rem 0.65rem",
                                    backgroundColor: "var(--primary-light)",
                                    color: "var(--primary)",
                                    border: "1px solid var(--primary)",
                                    borderRadius: "4px",
                                    fontWeight: 700,
                                    fontSize: "0.74rem",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.2rem",
                                  }}
                                >
                                  <DollarSign size={14} /> Bayar Tunai TU
                                </button>
                              )}
                              <button
                                title="Edit Detail Tagihan"
                                onClick={() => handleOpenEditModal(b)}
                                style={{
                                  padding: "0.35rem 0.55rem",
                                  backgroundColor: "var(--bg-surface-low)",
                                  color: "var(--text-main)",
                                  border: "1px solid var(--border-glass)",
                                  borderRadius: "4px",
                                  fontWeight: 700,
                                  fontSize: "0.74rem",
                                  cursor: "pointer",
                                }}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                title="Batalkan / Void Tagihan"
                                onClick={() => handleVoidBill(b)}
                                style={{
                                  padding: "0.35rem 0.55rem",
                                  backgroundColor: "rgba(220, 38, 38, 0.1)",
                                  color: "var(--status-ditolak)",
                                  border: "1px solid rgba(220, 38, 38, 0.2)",
                                  borderRadius: "4px",
                                  fontWeight: 700,
                                  fontSize: "0.74rem",
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      </main>

      {/* MODAL BAYAR TUNAI TU */}
      {cashModalBill && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}>
          <GlassCard style={{ width: "100%", maxWidth: "480px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                  Terima Setoran Tunai (TU)
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {cashModalBill.siswa?.name} ({cashModalBill.jenisTagihan?.name})
                </p>
              </div>
              <button onClick={() => setCashModalBill(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitCash} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nominal Setoran Tunai (Rp)</label>
                <input
                  type="number"
                  required
                  value={cashNominal}
                  onChange={(e) => setCashNominal(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.95rem", fontWeight: 800, marginTop: "0.2rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Catatan Setoran</label>
                <input
                  type="text"
                  value={cashCatatan}
                  onChange={(e) => setCashCatatan(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem", marginTop: "0.2rem" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setCashModalBill(null)} style={{ padding: "0.6rem 1.25rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "transparent", color: "var(--text-main)", fontWeight: 700, cursor: "pointer" }}>
                  Batal
                </button>
                <button type="submit" disabled={submittingCash} style={{ padding: "0.6rem 1.25rem", backgroundColor: "var(--primary)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 700, cursor: submittingCash ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {submittingCash ? <Loader2 className="animate-spin" size={16} /> : <DollarSign size={16} />}
                  Simpan & Lunaskan
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* MODAL EDIT DETAIL TAGIHAN */}
      {editModalBill && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}>
          <GlassCard style={{ width: "100%", maxWidth: "480px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.75rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                  Edit Tagihan Santri
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {editModalBill.siswa?.name} ({editModalBill.jenisTagihan?.name})
                </p>
              </div>
              <button onClick={() => setEditModalBill(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Nominal Akhir Wajib Bayar (Rp)</label>
                <input
                  type="number"
                  required
                  value={editNominal}
                  onChange={(e) => setEditNominal(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.95rem", fontWeight: 800, marginTop: "0.2rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Tanggal Jatuh Tempo</label>
                <input
                  type="date"
                  required
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem", marginTop: "0.2rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>Catatan Tagihan</label>
                <input
                  type="text"
                  value={editCatatan}
                  onChange={(e) => setEditCatatan(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "var(--bg-app)", fontSize: "0.85rem", marginTop: "0.2rem" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setEditModalBill(null)} style={{ padding: "0.6rem 1.25rem", border: "1px solid var(--border-glass)", borderRadius: "6px", backgroundColor: "transparent", color: "var(--text-main)", fontWeight: 700, cursor: "pointer" }}>
                  Batal
                </button>
                <button type="submit" disabled={submittingEdit} style={{ padding: "0.6rem 1.25rem", backgroundColor: "var(--primary)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 700, cursor: submittingEdit ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {submittingEdit ? <Loader2 className="animate-spin" size={16} /> : <Pencil size={16} />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

