// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Dashboard Portal Wali Murid (iOS Mobile View).
//            Menyajikan tampilan tabungan/kartu anak bergaya Apple Wallet untuk
//            multi-anak dan daftar tagihan aktif per anak.
//            - Usva: Mendesain stacked cards (Apple Wallet style) yang interaktif (swipe/tap),
//                    bottom sheet detail tagihan, dan daftar tagihan bergaya iOS list.
//            - Atnan: Mengambil data siswa (anak-anak dari wali murid yang sedang login)
//                     dan tagihan-tagihan mereka dari DB prisma.
// =========================================================================

import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { getWaliDashboardData } from "@/lib/actions/laporan";
import { formatIDR, formatDateIndonesian } from "@/lib/utils";

export default async function WaliDashboardPage() {
  const wali = await getWaliDashboardData().catch(() => null);

  const waliName = wali?.user.name || "Wali Murid";
  const students = wali?.siswa || [];
  const primaryStudent = students[0];
  const bills = primaryStudent?.tagihan || [];

  return (
    <div className="ios-viewport">
      <header className="ios-header">
        <span className="greeting">Assalamu'alaikum,</span>
        <h1 className="wali-name">{waliName}</h1>
      </header>

      <section className="ios-wallet-section">
        <div className="wallet-cards-stack">
          {students.length > 0 ? (
            students.map((student: any, idx: number) => {
              const studentUnpaid = (student.tagihan || [])
                .filter((b: any) => b.status !== "LUNAS")
                .reduce((sum: number, b: any) => sum + Number(b.nominalAkhir), 0);

              return (
                <GlassCard
                  key={student.id}
                  className={`wallet-card ${idx === 0 ? "wallet-card-active" : ""}`}
                >
                  <span className="student-badge">Siswa {idx + 1}</span>
                  <h2>{student.name}</h2>
                  <p className="student-info">
                    Kelas {student.kelas.name} | NISN: {student.nisn}
                  </p>
                  <div className="card-footer">
                    <span>Sisa Tagihan:</span>
                    <span className="tagihan-amount">{formatIDR(studentUnpaid)}</span>
                  </div>
                </GlassCard>
              );
            })
          ) : (
            <GlassCard className="wallet-card wallet-card-active">
              <h2>Belum Ada Data Siswa</h2>
              <p className="student-info">Hubungi TU untuk menghubungkan akun</p>
            </GlassCard>
          )}
        </div>
      </section>

      <section className="ios-bill-list-section">
        <h3>Daftar Tagihan</h3>
        <div className="ios-list">
          {bills.length > 0 ? (
            bills.map((bill: any) => (
              <div className="ios-list-item" key={bill.id}>
                <div className="item-info">
                  <span className="item-title">{bill.jenisTagihan.name}</span>
                  <span className="item-due">
                    Jatuh tempo: {formatDateIndonesian(bill.dueDate)}
                  </span>
                </div>
                <div className="item-status-amount">
                  <span className="item-amount">{formatIDR(bill.nominalAkhir.toString())}</span>
                  <StatusBadge status={bill.status} />
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", opacity: 0.7, padding: "1rem" }}>
              Belum ada tagihan terbit.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
