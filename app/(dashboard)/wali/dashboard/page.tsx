"use client";

import React, { useState } from "react";
import SidebarNav from "@/components/ui/SidebarNav";
import TopHeader from "@/components/ui/TopHeader";
import DigitalReceiptModal, { DigitalReceiptData } from "@/components/ui/DigitalReceiptModal";
import { formatIDR } from "@/lib/utils";
import {
  Users,
  Printer,
  FileCheck,
  Building2,
  AlertCircle,
  Download,
  UploadCloud
} from "lucide-react";

interface TagihanItem {
  id: string;
  periode: string;
  anak: string;
  keterangan: string;
  nominal: number;
  status: "TERLAMBAT" | "BELUM_DIBAYAR" | "MENUNGGU_VERIFIKASI" | "LUNAS";
}

export default function WaliDashboardPage() {
  const [selectedTagihan, setSelectedTagihan] = useState<Array<string>>([]);
  const [refNumber, setRefNumber] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<DigitalReceiptData | null>(null);

  const [tagihanList, setTagihanList] = useState<Array<TagihanItem>>([
    {
      id: "TAG-001",
      periode: "Nov 2023",
      anak: "Farhan S.",
      keterangan: "SPP Bulanan",
      nominal: 450000,
      status: "TERLAMBAT",
    },
    {
      id: "TAG-002",
      periode: "Des 2023",
      anak: "Farhan S.",
      keterangan: "SPP Bulanan",
      nominal: 450000,
      status: "BELUM_DIBAYAR",
    },
    {
      id: "TAG-003",
      periode: "Ganjil '23",
      anak: "Farhan S.",
      keterangan: "Buku Modul Pembelajaran",
      nominal: 350000,
      status: "BELUM_DIBAYAR",
    },
  ]);

  const receiptsArchive: Array<DigitalReceiptData> = [
    {
      receiptNo: "KW-2310-091",
      date: "2023-10-15",
      receivedFrom: "Wali dr. Siti Aminah Z.",
      studentName: "Siti Aminah Zahra",
      studentClass: "Kelas 3A",
      amount: 450000,
      paymentFor: "SPP Okt 2023",
      verifiedBy: "Admin Utama",
      paymentMethod: "Transfer BSI",
    },
    {
      receiptNo: "KW-2309-142",
      date: "2023-09-12",
      receivedFrom: "Wali dr. Farhan S.",
      studentName: "M. Farhan Syahputra",
      studentClass: "Kelas 5B",
      amount: 450000,
      paymentFor: "SPP Sep 2023",
      verifiedBy: "Admin Utama",
      paymentMethod: "Transfer Mandiri",
    },
  ];

  const handleToggleSelect = (id: string) => {
    setSelectedTagihan((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalSelectedNominal = selectedTagihan.reduce((sum, id) => {
    const item = tagihanList.find((t) => t.id === id);
    return sum + (item ? item.nominal : 0);
  }, 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSendVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNumber || !uploadedFile) {
      alert("Mohon isi nomor referensi bank dan lampirkan berkas bukti transfer.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (selectedTagihan.length > 0) {
        setTagihanList((prev) =>
          prev.map((t) => (selectedTagihan.includes(t.id) ? { ...t, status: "MENUNGGU_VERIFIKASI" } : t))
        );
      } else {
        setTagihanList((prev) =>
          prev.map((t, idx) => (idx === 0 ? { ...t, status: "MENUNGGU_VERIFIKASI" } : t))
        );
      }

      setIsSubmitting(false);
      setUploadSuccess(true);

      setTimeout(() => {
        setUploadSuccess(false);
        setRefNumber("");
        setTransferDate("");
        setUploadedFile(null);
        setSelectedTagihan([]);
        alert("Bukti transaksi berhasil dikirim! Menunggu verifikasi admin.");
      }, 800);
    }, 600);
  };

  const openReceiptModal = (receipt: DigitalReceiptData) => {
    setSelectedReceipt(receipt);
    setReceiptModalOpen(true);
  };

  return (
    <div className="app-container" style={{ display: "flex", minHeight: "100vh" }}>
      <SidebarNav activeItem="DASHBOARD" userRole="WALI MURID" userName="Wali Murid" />

      <main className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader title="SISTEM KEUANGAN INSTITUSI - PORTAL WALI MURID" />

        <div className="page-body" style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* SECTION 1: Ringkasan Anak Didik */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Users size={20} style={{ color: "var(--primary)" }} />
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>Ringkasan Anak Didik</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.25rem" }}>
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-main)", textTransform: "uppercase" }}>
                      M. FARHAN SYAHPUTRA
                    </h3>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      Nomor Induk: 192010293
                    </div>
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, padding: "0.25rem 0.65rem", borderRadius: "999px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                    KELAS 5B
                  </span>
                </div>

                <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Tagihan Berjalan</div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--status-ditolak)" }}>
                      Rp 1.250.000
                    </div>
                  </div>
                  <button
                    style={{
                      padding: "0.45rem 1rem",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      backgroundColor: "transparent",
                      color: "var(--text-main)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Rincian
                  </button>
                </div>
              </div>

              <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-main)", textTransform: "uppercase" }}>
                      SITI AMINAH ZAHRA
                    </h3>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      Nomor Induk: 212210105
                    </div>
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, padding: "0.25rem 0.65rem", borderRadius: "999px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                    KELAS 3A
                  </span>
                </div>

                <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Tagihan Berjalan</div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>
                      Rp 0
                    </div>
                  </div>
                  <button
                    style={{
                      padding: "0.45rem 1rem",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      backgroundColor: "transparent",
                      color: "var(--text-main)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Rincian
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Buku Besar Tagihan */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>Buku Besar Tagihan</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>
                <span>TAHUN AJARAN 2023/2024</span>
                <Printer size={16} style={{ cursor: "pointer" }} />
              </div>
            </div>

            <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-glass)", borderRadius: "16px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid var(--border-glass)" }}>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", width: "12%" }}>Periode</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", width: "18%" }}>Anak Didik</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", width: "32%" }}>Keterangan Tagihan</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", width: "18%" }}>Nominal (Rp)</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", width: "12%" }}>Status</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", width: "8%", textAlign: "center" }}>Pilih</th>
                  </tr>
                </thead>
                <tbody>
                  {tagihanList.map((item) => {
                    const isChecked = selectedTagihan.includes(item.id);
                    return (
                      <tr key={item.id} style={{ borderBottom: "1px solid var(--border-glass)", backgroundColor: isChecked ? "var(--bg-surface-hover)" : "transparent" }}>
                        <td style={{ padding: "0.9rem 1rem", fontWeight: 600, color: "var(--text-main)" }}>{item.periode}</td>
                        <td style={{ padding: "0.9rem 1rem", color: "var(--text-main)" }}>{item.anak}</td>
                        <td style={{ padding: "0.9rem 1rem", fontWeight: 800, fontSize: "0.95rem", color: "var(--text-main)" }}>
                          {item.keterangan}
                        </td>
                        <td style={{ padding: "0.9rem 1rem", fontWeight: 700, color: "var(--text-main)" }}>
                          {item.nominal.toLocaleString("id-ID")}
                        </td>
                        <td style={{ padding: "0.9rem 1rem" }}>
                          {item.status === "TERLAMBAT" && (
                            <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "0.25rem 0.65rem", borderRadius: "999px", backgroundColor: "var(--status-ditolak-bg)", color: "var(--status-ditolak)" }}>
                              TERLAMBAT
                            </span>
                          )}
                          {item.status === "BELUM_DIBAYAR" && (
                            <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "0.25rem 0.65rem", borderRadius: "999px", backgroundColor: "var(--status-menunggu-bg)", color: "var(--status-menunggu)" }}>
                              BELUM DIBAYAR
                            </span>
                          )}
                          {item.status === "MENUNGGU_VERIFIKASI" && (
                            <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "0.25rem 0.65rem", borderRadius: "999px", backgroundColor: "var(--status-menunggu-bg)", color: "var(--status-menunggu)" }}>
                              MENUNGGU VERIFIKASI
                            </span>
                          )}
                          {item.status === "LUNAS" && (
                            <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "0.25rem 0.65rem", borderRadius: "999px", backgroundColor: "var(--status-lunas-bg)", color: "var(--status-lunas)" }}>
                              LUNAS
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={item.status === "LUNAS" || item.status === "MENUNGGU_VERIFIKASI"}
                            onChange={() => handleToggleSelect(item.id)}
                            style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--primary)" }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ backgroundColor: "rgba(255, 255, 255, 0.02)", borderTop: "1px solid var(--border-glass)", padding: "0.85rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "0.82rem", fontStyle: "italic", color: "var(--text-muted)" }}>
                  Centang tagihan di atas lalu isi formulir setor bukti transfer di bawah ini
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
                    TOTAL TERPILIH{" "}
                    <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)", marginLeft: "0.5rem" }}>
                      Rp {totalSelectedNominal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <button
                    disabled={selectedTagihan.length === 0}
                    style={{
                      padding: "0.6rem 1.25rem",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      backgroundColor: "var(--primary)",
                      color: "#FFF",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      opacity: selectedTagihan.length === 0 ? 0.6 : 1,
                    }}
                    onClick={() => {
                      const element = document.getElementById("form-setor-bukti");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    BAYAR SEKARANG
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: Formulir Setor Bukti & Informasi Rekening */}
          <section id="form-setor-bukti" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-main)" }}>
                  Formulir Setor Bukti Transaksi
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                  Lampirkan bukti transfer resmi setelah melakukan pembayaran ke rekening pesantren.
                </p>
              </div>

              <form onSubmit={handleSendVerification} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>Nomor Referensi Bank</label>
                    <input
                      type="text"
                      placeholder="Cth: TRF-8819-2023"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      required
                      style={{
                        padding: "0.6rem 0.85rem",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "8px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: "var(--text-main)",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>Tanggal Transfer</label>
                    <input
                      type="date"
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      required
                      style={{
                        padding: "0.6rem 0.85rem",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "8px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: "var(--text-main)",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div className="dropzone" onClick={() => document.getElementById("proof-file-input")?.click()} style={{ cursor: "pointer", border: "2px dashed var(--border-glass)", padding: "1.5rem", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.01)", textAlign: "center" }}>
                  <input
                    id="proof-file-input"
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--primary)",
                      margin: "0 auto 0.5rem"
                    }}
                  >
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-main)" }}>
                      {uploadedFile ? uploadedFile.name : "Tarik & Lepas Dokumen / Klik untuk Memilih"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      Format JPG, PNG, atau PDF. Maksimal 5MB.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadSuccess}
                    style={{
                      padding: "0.6rem 1.25rem",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      backgroundColor: "var(--primary)",
                      color: "#FFF",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    {isSubmitting ? "MENGIRIM..." : uploadSuccess ? "BERHASIL DIKIRIM!" : "KIRIM VERIFIKASI"}
                  </button>
                </div>
              </form>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-main)" }}>
                  Informasi Rekening Institusi
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "8px",
                    padding: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <Building2 size={24} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                      BANK SYARIAH INDONESIA (BSI)
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-main)" }}>
                      7182 9910 22
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      a.n. Yayasan Pendidikan Digital
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "8px",
                    padding: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <Building2 size={24} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                      BANK MANDIRI
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-main)" }}>
                      131 00 2938 1192
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      a.n. Yayasan Pendidikan Digital
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.6rem",
                  marginTop: "auto",
                  paddingTop: "0.5rem",
                  fontSize: "0.76rem",
                  color: "var(--text-muted)",
                  lineHeight: "1.4",
                }}
              >
                <AlertCircle size={16} style={{ color: "var(--status-menunggu)", flexShrink: 0, marginTop: "2px" }} />
                <span>
                  Pastikan nominal transfer tepat sesuai tagihan untuk mempercepat proses verifikasi admin.
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 4: Arsip Kwitansi Pembayaran */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <FileCheck size={20} style={{ color: "var(--primary)" }} />
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>Arsip Kwitansi Pembayaran</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {receiptsArchive.map((receipt, idx) => (
                <div key={idx} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)" }}>
                      NO: {receipt.receiptNo}
                    </span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "0.2rem 0.5rem", borderRadius: "999px", backgroundColor: "var(--status-lunas-bg)", color: "var(--status-lunas)" }}>LUNAS</span>
                  </div>

                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.2rem" }}>Kwitansi Digital</h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.78rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Telah terima dari:</span>
                      <span style={{ fontWeight: 700, color: "var(--text-main)" }}>{receipt.receivedFrom}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Sejumlah:</span>
                      <span style={{ fontWeight: 800, color: "var(--text-main)" }}>Rp {receipt.amount.toLocaleString("id-ID")}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Untuk pembayaran:</span>
                      <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{receipt.paymentFor}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "0.75rem", marginTop: "0.4rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      onClick={() => openReceiptModal(receipt)}
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
                      <Download size={14} /> LIHAT & CETAK
                    </button>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, fontStyle: "italic", color: "var(--text-main)" }}>
                      {receipt.verifiedBy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <DigitalReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        data={selectedReceipt}
      />
    </div>
  );
}
