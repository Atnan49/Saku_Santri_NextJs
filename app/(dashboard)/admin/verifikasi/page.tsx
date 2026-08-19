"use client";

import React, { useState, useEffect } from "react";
import SidebarNav from "@/components/ui/SidebarNav";
import TopHeader from "@/components/ui/TopHeader";
import DigitalReceiptModal, { DigitalReceiptData } from "@/components/ui/DigitalReceiptModal";
import { formatIDR } from "@/lib/utils";
import { getPembayaranForAdminVerification, adminVerifyPayment } from "@/lib/actions/pembayaran";
import { getTopupSakuForAdminVerification, verifyTopupSaku } from "@/lib/actions/uang-saku";
import {
  CheckCircle2,
  Search,
  Maximize2,
  XCircle,
  FileCheck2,
  AlertTriangle,
  ArrowRightLeft,
  X,
  Loader2,
} from "lucide-react";

interface VerificationItem {
  id: string;
  refNo: string;
  reportDate: string;
  studentName: string;
  studentClass: string;
  parentName: string;
  category: string;
  dateTimeStr: string;
  originalAmount: number;
  expectedAmount: number;
  reportedAmount: number;
  hasScholarship: boolean;
  paymentMethod: string;
  proofImageUrl: string;
  status: "PENDING" | "LUNAS" | "DITOLAK";
  rejectionReason?: string;
}

export default function AdminVerifikasiPage() {
  const [activeTab, setActiveTab] = useState<"TAGIHAN" | "TOPUP">("TAGIHAN");
  const [loading, setLoading] = useState(true);
  const [queueList, setQueueList] = useState<Array<VerificationItem>>([]);

  const [selectedId, setSelectedId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [fullImageModalOpen, setFullImageModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [generatedReceiptData, setGeneratedReceiptData] = useState<DigitalReceiptData | null>(null);

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [selectedId]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "TAGIHAN") {
        const raw = await getPembayaranForAdminVerification();
        const mapped: VerificationItem[] = raw.map((p: any) => ({
          id: p.id,
          refNo: `REF-${p.id.slice(-6).toUpperCase()}`,
          reportDate: new Date(p.createdAt).toISOString().split("T")[0],
          studentName: p.tagihan?.siswa?.name || "Santri",
          studentClass: p.tagihan?.siswa?.kelas?.name || "-",
          parentName: p.tagihan?.siswa?.wali?.user?.name || "Wali Santri",
          category: p.tagihan?.jenisTagihan?.name || "SPP Bulanan",
          dateTimeStr: new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
          originalAmount: Number(p.tagihan?.nominalAwal) || 0,
          expectedAmount: Number(p.tagihan?.nominalAkhir) || 0,
          reportedAmount: Number(p.tagihan?.nominalAkhir) || 0,
          hasScholarship: Number(p.tagihan?.potongan) > 0,
          paymentMethod: p.catatanWali || "Bank Transfer",
          proofImageUrl: p.buktiUrl || "",
          status: p.tagihan?.status === "LUNAS" ? "LUNAS" : p.tagihan?.status?.includes("DITOLAK") ? "DITOLAK" : "PENDING",
        }));
        setQueueList(mapped);
        if (mapped.length > 0 && (!selectedId || !mapped.find(m => m.id === selectedId))) {
          setSelectedId(mapped[0].id);
        } else if (mapped.length === 0) {
          setSelectedId("");
        }
      } else {
        const raw = await getTopupSakuForAdminVerification();
        const mapped: VerificationItem[] = raw.map((t: any) => ({
          id: t.id,
          refNo: `TUP-${t.id.slice(-6).toUpperCase()}`,
          reportDate: new Date(t.createdAt).toISOString().split("T")[0],
          studentName: t.siswa?.name || "Santri",
          studentClass: t.siswa?.kelas?.name || "-",
          parentName: t.siswa?.wali?.user?.name || "Wali Santri",
          category: "Top-up Saku",
          dateTimeStr: new Date(t.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
          originalAmount: Number(t.nominal) || 0,
          expectedAmount: Number(t.nominal) || 0,
          reportedAmount: Number(t.nominal) || 0,
          hasScholarship: false,
          paymentMethod: "Bank Transfer",
          proofImageUrl: t.buktiUrl || "",
          status: "PENDING", // always pending from this query
        }));
        setQueueList(mapped);
        if (mapped.length > 0 && (!selectedId || !mapped.find(m => m.id === selectedId))) {
          setSelectedId(mapped[0].id);
        } else if (mapped.length === 0) {
          setSelectedId("");
        }
      }
    } catch (err) {
      console.error("Gagal memuat verifikasi admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const selectedItem = queueList.find((q) => q.id === selectedId) || queueList[0];

  const filteredQueue = queueList.filter(
    (item) =>
      item.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = queueList.filter((q) => q.status === "PENDING").length;
  const totalPendingNominal = queueList
    .filter((q) => q.status === "PENDING")
    .reduce((sum, q) => sum + q.reportedAmount, 0);

  const handleApprove = async () => {
    if (!selectedItem) return;
    try {
      if (activeTab === "TAGIHAN") {
        await adminVerifyPayment({ pembayaranId: selectedItem.id, action: "approve" });

        const receiptData: DigitalReceiptData = {
          receiptNo: `KW-${selectedItem.refNo.replace("REF-", "")}`,
          date: new Date().toISOString().split("T")[0],
          receivedFrom: selectedItem.parentName,
          studentName: selectedItem.studentName,
          studentClass: selectedItem.studentClass,
          amount: selectedItem.reportedAmount,
          paymentFor: selectedItem.category,
          verifiedBy: "Admin Utama",
          paymentMethod: selectedItem.paymentMethod,
        };

        setGeneratedReceiptData(receiptData);
        setReceiptModalOpen(true);
      } else {
        await verifyTopupSaku({ topupId: selectedItem.id, action: "approve" });
        alert("Top-up saku berhasil disetujui!");
        loadData();
      }
    } catch (err: any) {
      alert(err.message || "Gagal memverifikasi pembayaran.");
    }
  };

  const handleCloseReceiptModal = () => {
    setReceiptModalOpen(false);
    loadData();
  };

  const handleConfirmRejection = async () => {
    if (!rejectionReason.trim()) {
      alert("Mohon masukkan alasan penolakan.");
      return;
    }

    try {
      if (activeTab === "TAGIHAN") {
        await adminVerifyPayment({
          pembayaranId: selectedItem.id,
          action: "reject",
          catatan: rejectionReason.trim(),
        });
      } else {
        await verifyTopupSaku({
          topupId: selectedItem.id,
          action: "reject",
          catatan: rejectionReason.trim(),
        });
      }
      setRejectionModalOpen(false);
      setRejectionReason("");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal menolak verifikasi.");
    }
  };

  return (
    <div className="app-container" style={{ display: "flex", minHeight: "100vh" }}>
      <SidebarNav activeItem="VERIFIKASI" userRole="ADMINISTRATOR" userName="Admin Utama" />

      <main className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader title="SISTEM KEUANGAN INSTITUSI" />

        <div className="page-body" style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                MODUL VERIFIKASI
              </div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.2rem" }}>
                Antrean {activeTab === "TAGIHAN" ? "Pembayaran Tagihan" : "Top-up Saku"}
              </h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", padding: "0.25rem", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                <button
                  onClick={() => setActiveTab("TAGIHAN")}
                  data-testid="tab-tagihan"
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    backgroundColor: activeTab === "TAGIHAN" ? "var(--primary)" : "transparent",
                    color: activeTab === "TAGIHAN" ? "#fff" : "var(--text-muted)",
                    transition: "all 0.2s"
                  }}
                >
                  SPP & Kegiatan
                </button>
                <button
                  onClick={() => setActiveTab("TOPUP")}
                  data-testid="tab-topup"
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    backgroundColor: activeTab === "TOPUP" ? "var(--primary)" : "transparent",
                    color: activeTab === "TOPUP" ? "#fff" : "var(--text-muted)",
                    transition: "all 0.2s"
                  }}
                >
                  Top-up Saku
                </button>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Menunggu Verifikasi</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-main)" }}>
                  {pendingCount} Dokumen
                </div>
              </div>
              <div style={{ height: "32px", width: "1px", backgroundColor: "var(--border-glass)" }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Total Nominal</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)" }}>
                  Rp {totalPendingNominal.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "1.5rem", alignItems: "start" }}>
            {/* LEFT COLUMN: Queue List */}
            <div className="glass-card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Search size={16} style={{ position: "absolute", left: "0.75rem", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  data-testid="search-verifikasi"
                  placeholder="Cari No. Referensi atau Nama..."
                  style={{
                    width: "100%",
                    paddingLeft: "2.25rem",
                    paddingRight: "0.85rem",
                    paddingTop: "0.55rem",
                    paddingBottom: "0.55rem",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "var(--text-main)",
                    outline: "none",
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {filteredQueue.length > 0 ? (
                  filteredQueue.map((item) => {
                    const isSelected = item.id === selectedItem?.id;
                    return (
                      <div
                        key={item.id}
                        data-testid={`queue-item-${item.studentName.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => setSelectedId(item.id)}
                        style={{
                          padding: "1rem",
                          borderRadius: "8px",
                          border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-glass)",
                          backgroundColor: isSelected ? "var(--bg-surface-hover)" : "var(--bg-surface)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.4rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)" }}>
                            {item.refNo}
                          </span>
                          {item.status === "PENDING" && (
                            <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "0.2rem 0.5rem", borderRadius: "999px", backgroundColor: "var(--status-menunggu-bg)", color: "var(--status-menunggu)" }}>
                              PENDING
                            </span>
                          )}
                          {item.status === "LUNAS" && (
                            <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "0.2rem 0.5rem", borderRadius: "999px", backgroundColor: "var(--status-lunas-bg)", color: "var(--status-lunas)" }}>
                              LUNAS
                            </span>
                          )}
                          {item.status === "DITOLAK" && (
                            <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "0.2rem 0.5rem", borderRadius: "999px", backgroundColor: "var(--status-ditolak-bg)", color: "var(--status-ditolak)" }}>
                              DITOLAK
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-main)" }}>
                          {item.studentName}
                        </div>

                        <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                          {item.studentClass} • {item.category}
                        </div>

                        <div style={{ borderTop: "1px dashed var(--border-glass)", paddingTop: "0.4rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>{item.dateTimeStr}</span>
                          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-main)" }}>
                            Rp {item.reportedAmount.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Tidak ada dokumen setoran dalam antrean.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Detail Review Panel */}
            {selectedItem ? (
              <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)" }}>
                      Tinjauan Dokumen
                    </h2>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                      Lembar Verifikasi Transaksi Masuk
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Tanggal Lapor
                    </div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-main)" }}>
                      {selectedItem.reportDate}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "8px",
                    padding: "1rem",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      NO. REFERENSI / INVOICE
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.2rem" }}>
                      {selectedItem.refNo}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      NAMA SISWA / PENYETOR
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.2rem" }}>
                      {selectedItem.studentName} ({selectedItem.studentClass})
                    </div>
                  </div>
                </div>

                <div style={{ border: "1px solid var(--border-glass)", borderRadius: "8px", overflow: "hidden" }}>
                  <div
                    style={{
                      padding: "0.6rem 1rem",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      borderBottom: "1px solid var(--border-glass)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-main)" }}>
                      Rekonsiliasi Nominal
                    </span>
                    <ArrowRightLeft size={16} style={{ color: "var(--text-muted)" }} />
                  </div>

                  <div style={{ padding: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "8px",
                        padding: "1rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>
                          KEWAJIBAN TAGIHAN
                        </div>
                        {selectedItem.hasScholarship && (
                          <div style={{ fontSize: "0.85rem", textDecoration: "line-through", color: "var(--text-dim)", marginTop: "0.2rem" }}>
                            {formatIDR(selectedItem.originalAmount)}
                          </div>
                        )}
                        <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.2rem" }}>
                          {formatIDR(selectedItem.expectedAmount)}
                        </div>
                      </div>

                      {selectedItem.hasScholarship && (
                        <div style={{ fontSize: "0.72rem", fontStyle: "italic", color: "var(--text-muted)", marginTop: "0.75rem" }}>
                          *Terdapat potongan beasiswa
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "8px",
                        padding: "1rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="badge" style={{ backgroundColor: "var(--status-lunas-bg)", color: "var(--status-lunas)", fontSize: "0.68rem" }}>
                            ✓ Sesuai
                          </span>
                          <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>
                            NOMINAL DILAPORKAN
                          </span>
                        </div>

                        <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--status-lunas)", marginTop: "0.5rem" }}>
                          {formatIDR(selectedItem.reportedAmount)}
                        </div>
                      </div>

                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "right", marginTop: "0.75rem" }}>
                        {selectedItem.paymentMethod}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.05em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      PINDAIAN BUKTI TRANSFER
                    </span>
                    <button
                      onClick={() => setFullImageModalOpen(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <Maximize2 size={14} /> Buka Penuh
                    </button>
                  </div>

                  <div
                    style={{
                      minHeight: "220px",
                      maxHeight: "320px",
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      border: "1px dashed var(--border-glass)",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      padding: "0.5rem",
                    }}
                    onClick={() => setFullImageModalOpen(true)}
                  >
                    {selectedItem.proofImageUrl && !imageError && !selectedItem.proofImageUrl.toLowerCase().endsWith(".pdf") ? (
                      <img
                        src={selectedItem.proofImageUrl}
                        alt={`Bukti Transfer ${selectedItem.refNo}`}
                        onError={() => setImageError(true)}
                        style={{ width: "100%", maxHeight: "300px", objectFit: "contain", borderRadius: "6px" }}
                      />
                    ) : (
                      <div style={{ textAlign: "center", padding: "1.5rem" }}>
                        <FileCheck2 size={36} style={{ color: "var(--primary)", margin: "0 auto 0.5rem" }} />
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                          Bukti Transfer - {selectedItem.refNo}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                          {selectedItem.paymentMethod} • Rp {selectedItem.reportedAmount.toLocaleString("id-ID")}
                        </div>
                        {selectedItem.proofImageUrl && (
                          <a
                            href={selectedItem.proofImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: "inline-block", marginTop: "0.75rem", padding: "0.4rem 0.85rem", fontSize: "0.75rem", fontWeight: 700, backgroundColor: "var(--primary)", color: "#fff", borderRadius: "4px", textDecoration: "none" }}
                          >
                            Buka Berkas Bukti (Tab Baru)
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {selectedItem.status === "DITOLAK" && selectedItem.rejectionReason && (
                  <div style={{ backgroundColor: "var(--status-ditolak-bg)", border: "1px solid var(--status-ditolak)", borderRadius: "8px", padding: "0.85rem 1rem", fontSize: "0.82rem", color: "var(--status-ditolak)" }}>
                    <strong>Alasan Penolakan:</strong> {selectedItem.rejectionReason}
                  </div>
                )}

                <div style={{ display: "flex", gap: "1rem", paddingTop: "0.5rem" }}>
                  <button
                    onClick={handleApprove}
                    data-testid="approve-verifikasi-button"
                    disabled={selectedItem.status === "LUNAS"}
                    style={{
                      flex: 2,
                      padding: "0.85rem 1.25rem",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      backgroundColor: "var(--primary)",
                      color: "#FFF",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      opacity: selectedItem.status === "LUNAS" ? 0.6 : 1,
                    }}
                  >
                    <CheckCircle2 size={18} />
                    {selectedItem.status === "LUNAS" ? "TELAH DIVERIFIKASI (LUNAS)" : "SETUJUI & TERBITKAN KWITANSI"}
                  </button>

                  <button
                    onClick={() => setRejectionModalOpen(true)}
                    data-testid="reject-verifikasi-button"
                    disabled={selectedItem.status === "LUNAS" || selectedItem.status === "DITOLAK"}
                    style={{
                      flex: 1,
                      padding: "0.85rem 1.25rem",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      backgroundColor: "transparent",
                      color: "var(--status-ditolak)",
                      border: "1px solid var(--status-ditolak)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      opacity: (selectedItem.status === "LUNAS" || selectedItem.status === "DITOLAK") ? 0.6 : 1,
                    }}
                  >
                    <XCircle size={18} />
                    TOLAK VERIFIKASI
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Tidak ada dokumen setoran yang dipilih atau membutuhkan tindakan verifikasi saat ini.
              </div>
            )}
          </div>
        </div>
      </main>

      {fullImageModalOpen && (
        <div className="modal-overlay" onClick={() => setFullImageModalOpen(false)}>
          <div className="glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", padding: "1.5rem", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                Pindaian Bukti Transfer - {selectedItem.refNo}
              </h3>
              <button onClick={() => setFullImageModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-main)" }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ minHeight: "350px", maxHeight: "75vh", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {selectedItem.proofImageUrl && !imageError && !selectedItem.proofImageUrl.toLowerCase().endsWith(".pdf") ? (
                <img
                  src={selectedItem.proofImageUrl}
                  alt={`Bukti Transfer ${selectedItem.refNo}`}
                  onError={() => setImageError(true)}
                  style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <FileCheck2 size={48} style={{ color: "var(--primary)", margin: "0 auto 0.75rem" }} />
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-main)" }}>{selectedItem.refNo}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                    Metode: {selectedItem.paymentMethod} | Nominal: {formatIDR(selectedItem.reportedAmount)}
                  </div>
                  {selectedItem.proofImageUrl && (
                    <a
                      href={selectedItem.proofImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "inline-block", marginTop: "1rem", padding: "0.58rem 1.2rem", fontSize: "0.85rem", fontWeight: 700, backgroundColor: "var(--primary)", color: "#fff", borderRadius: "6px", textDecoration: "none" }}
                    >
                      Buka Berkas Bukti Transfer (Tab Baru)
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {rejectionModalOpen && (
        <div className="modal-overlay" onClick={() => setRejectionModalOpen(false)}>
          <div className="glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--status-ditolak)", fontWeight: 800 }}>
                <AlertTriangle size={20} />
                <span>Tolak Verifikasi Pembayaran</span>
              </div>
              <button onClick={() => setRejectionModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-main)" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Masukkan alasan penolakan verifikasi untuk transaksi <strong>{selectedItem.refNo}</strong> ({selectedItem.studentName}):
              </p>

              <textarea
                data-testid="rejection-reason-input"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "var(--text-main)",
                  fontSize: "0.88rem",
                  fontFamily: "inherit",
                  outline: "none",
                }}
                rows={4}
                placeholder="Contoh: Nominal transfer tidak sesuai dengan tagihan / Bukti transfer buram"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
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
                  onClick={() => setRejectionModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  data-testid="confirm-reject-button"
                  style={{
                    padding: "0.6rem 1.25rem",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    backgroundColor: "var(--status-ditolak)",
                    color: "#FFF",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                  onClick={handleConfirmRejection}
                >
                  Konfirmasi Penolakan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DigitalReceiptModal
        isOpen={receiptModalOpen}
        onClose={handleCloseReceiptModal}
        data={generatedReceiptData}
      />
    </div>
  );
}
