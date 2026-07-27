"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman antrean approval pembayaran Tahap 2 (Final).
// =========================================================================

import React, { useState, useEffect } from "react";
import SidebarNav from "@/components/ui/SidebarNav";
import TopHeader from "@/components/ui/TopHeader";
import GlassCard from "@/components/ui/GlassCard";
import DigitalReceiptModal, { DigitalReceiptData } from "@/components/ui/DigitalReceiptModal";
import { formatIDR } from "@/lib/utils";
import { getPembayaranForBendaharaApproval, bendaharaApprovePayment } from "@/lib/actions/pembayaran";
import {
  CheckCircle2,
  XCircle,
  FileCheck,
  ShieldCheck,
  Search,
  Eye,
  Loader2,
} from "lucide-react";

export default function BendaharaApprovalPage() {
  const [loading, setLoading] = useState(true);
  const [approvalList, setApprovalList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<DigitalReceiptData | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPembayaranForBendaharaApproval();
      setApprovalList(data);
    } catch (err) {
      console.error("Gagal memuat antrean approval bendahara:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (item: any) => {
    try {
      const res = await bendaharaApprovePayment(item.id);

      setReceiptData({
        receiptNo: res.nomorKwitansi || `KW-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split("T")[0],
        receivedFrom: item.tagihan?.siswa?.wali?.user?.name || "Wali Santri",
        studentName: item.tagihan?.siswa?.name || "Santri",
        studentClass: item.tagihan?.siswa?.kelas?.name || "-",
        amount: Number(item.amountPaid) || 250000,
        paymentFor: item.tagihan?.jenisTagihan?.name || "SPP Bulanan",
        verifiedBy: "Bendahara Pesantren",
        paymentMethod: item.paymentMethod || "Bank Transfer",
      });
      setReceiptModalOpen(true);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal melakukan persetujuan pembayaran.");
    }
  };

  return (
    <div className="app-container">
      <SidebarNav activeItem="APPROVAL" userRole="BENDAHARA" userName="Bendahara Sekolah" />

      <main className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader title="SISTEM KEUANGAN INSTITUSI - PORTAL BENDAHARA & KEPALA SEKOLAH" />

        <div className="page-body" style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>
              OTORISASI KEUANGAN TAHAP 2
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.2rem" }}>
              Persetujuan Pembayaran Final (Approval Bendahara)
            </h1>
          </div>

          <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border-glass)", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f7f3eb", borderBottom: "1px solid var(--border-glass)" }}>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase" }}>Santri & Kelas</th>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase" }}>Tagihan</th>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase" }}>Nominal</th>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase" }}>Diverifikasi TU</th>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "#516071", textTransform: "uppercase", textAlign: "center" }}>Aksi Final</th>
                </tr>
              </thead>
              <tbody>
                {approvalList.length > 0 ? (
                  approvalList.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                      <td style={{ padding: "0.9rem 1rem", fontWeight: 700, color: "var(--text-main)" }}>
                        <div>{item.tagihan?.siswa?.name || item.studentName}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{item.tagihan?.siswa?.kelas?.name || item.studentClass}</div>
                      </td>
                      <td style={{ padding: "0.9rem 1rem", color: "var(--text-main)" }}>{item.tagihan?.jenisTagihan?.name || item.tagihan}</td>
                      <td style={{ padding: "0.9rem 1rem", fontWeight: 800, color: "var(--primary)" }}>{formatIDR(Number(item.amountPaid) || item.nominal || 0)}</td>
                      <td style={{ padding: "0.9rem 1rem", color: "var(--status-lunas)" }}>✓ Admin TU</td>
                      <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                        <button
                          onClick={() => handleApprove(item)}
                          style={{
                            padding: "0.4rem 0.85rem",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            backgroundColor: "var(--primary)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Approve & Terbitkan Kwitansi
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      Tidak ada transaksi yang membutuhkan persetujuan final saat ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <DigitalReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        data={receiptData}
      />
    </div>
  );
}

