"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman Dashboard Kasir Koperasi / Mart Sekolah.
//            Digunakan oleh Kasir Koperasi untuk memproses transaksi belanja santri
//            berbasis NISN dengan validasi Saldo Saku & Limit Harian secara real-time.
// =========================================================================

import React, { useState } from "react";
import SidebarNav from "@/components/ui/SidebarNav";
import TopHeader from "@/components/ui/TopHeader";
import GlassCard from "@/components/ui/GlassCard";
import { formatIDR } from "@/lib/utils";
import { processTransaksiKoperasi } from "@/lib/actions/uang-saku";
import {
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Receipt,
  User,
  Zap,
} from "lucide-react";

export default function KoperasiDashboardPage() {
  const [nisn, setNisn] = useState("");
  const [totalBelanja, setTotalBelanja] = useState("");
  const [catatanBarang, setCatatanBarang] = useState("");
  const [loading, setLoading] = useState(false);

  const [resultAlert, setResultAlert] = useState<{
    type: "success" | "error";
    message: string;
    sisaSaldo?: number;
    sisaLimit?: number;
  } | null>(null);

  const handleQuickAmount = (amount: number) => {
    setTotalBelanja(String(amount));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn.trim() || !totalBelanja) return;

    setLoading(true);
    setResultAlert(null);

    try {
      const res = await processTransaksiKoperasi({
        nisn: nisn.trim(),
        totalBelanja: Number(totalBelanja),
        catatanBarang: catatanBarang.trim() || undefined,
      });

      if (res.success) {
        setResultAlert({
          type: "success",
          message: res.message,
          sisaSaldo: res.sisaSaldo,
          sisaLimit: res.sisaLimit,
        });
        setNisn("");
        setTotalBelanja("");
        setCatatanBarang("");
      }
    } catch (err: any) {
      setResultAlert({
        type: "error",
        message: err.message || "Gagal memproses transaksi.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <SidebarNav activeItem="DASHBOARD" userRole="KOPERASI" userName="Kasir Koperasi" />

      <main className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader title="PORTAL KASIR KOPERASI / MART SEKOLAH" />

        <div
          className="page-body"
          style={{
            padding: "1.75rem 2rem",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>
              POINT OF SALE (POS)
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.2rem" }}>
              Transaksi Belanja Santri
            </h1>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem" }}>
            {/* Form Transaksi */}
            <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  borderBottom: "1px solid var(--border-glass)",
                  paddingBottom: "0.75rem",
                }}
              >
                <div style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                    Form Input Transaksi Kasir
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Masukkan NISN santri & nominal belanja untuk mendebet Saldo Saku secara otomatis.
                  </p>
                </div>
              </div>

              {resultAlert && (
                <div
                  style={{
                    backgroundColor: resultAlert.type === "success" ? "var(--status-lunas-bg)" : "var(--status-ditolak-bg)",
                    border: `1px solid ${resultAlert.type === "success" ? "var(--status-lunas)" : "var(--status-ditolak)"}`,
                    borderRadius: "8px",
                    padding: "1rem",
                    color: resultAlert.type === "success" ? "var(--status-lunas)" : "var(--status-ditolak)",
                    fontSize: "0.88rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700 }}>
                    {resultAlert.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span>{resultAlert.message}</span>
                  </div>
                  {resultAlert.type === "success" && (
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.3rem", fontSize: "0.8rem", opacity: 0.9 }}>
                      <span>Sisa Saldo: <strong>{formatIDR(resultAlert.sisaSaldo ?? 0)}</strong></span>
                      <span>Sisa Limit Hari Ini: <strong>{formatIDR(resultAlert.sisaLimit ?? 0)}</strong></span>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>
                    NISN / Nomor Induk Santri
                  </label>
                  <div style={{ position: "relative", marginTop: "0.2rem" }}>
                    <User size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                      type="text"
                      required
                      placeholder="Masukkan NISN (contoh: 0012345678)"
                      value={nisn}
                      onChange={(e) => setNisn(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.85rem 0.65rem 2.4rem",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-app)",
                        fontSize: "0.9rem",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Total Belanja (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="15000"
                    value={totalBelanja}
                    onChange={(e) => setTotalBelanja(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "6px",
                      backgroundColor: "var(--bg-app)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      marginTop: "0.2rem",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                  {/* Preset Quick Buttons */}
                  <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                    {[5000, 10000, 15000, 20000, 25000, 50000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickAmount(amt)}
                        style={{
                          padding: "0.25rem 0.6rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          border: "1px solid var(--border-glass)",
                          borderRadius: "4px",
                          backgroundColor: "var(--bg-surface-low)",
                          color: "var(--text-main)",
                          cursor: "pointer",
                        }}
                      >
                        +{formatIDR(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Catatan Barang (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Roti, Kitab, Alat Tulis"
                    value={catatanBarang}
                    onChange={(e) => setCatatanBarang(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "6px",
                      backgroundColor: "var(--bg-app)",
                      fontSize: "0.9rem",
                      marginTop: "0.2rem",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "0.85rem",
                    backgroundColor: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Memproses Transaksi...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      <span>PROSES TRANSAKSI BELANJA</span>
                    </>
                  )}
                </button>
              </form>
            </GlassCard>

            {/* Petunjuk Operasional Kasir */}
            <GlassCard style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                Petunjuk Kasir Koperasi
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem", flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <strong>Cek NISN Santri:</strong> Pastikan NISN yang dimasukkan sesuai dengan kartu santri.
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem", flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <strong>Validasi Saldo & Limit:</strong> Sistem akan otomatis menolak transaksi jika saldo kurang atau melebihi limit harian jajan santri.
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem", flexShrink: 0 }}>
                    3
                  </div>
                  <div>
                    <strong>Notifikasi Real-time:</strong> Setelah transaksi berhasil, notifikasi WhatsApp akan dikirim otomatis ke HP wali murid santri.
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
