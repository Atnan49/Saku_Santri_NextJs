// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman antrean verifikasi pembayaran Tahap 1. Admin memeriksa bukti
//            transfer yang diunggah wali murid untuk disetujui (ke Tahap 2) atau ditolak.
//            - Usva: Mendesain antarmuka pembanding (bukti bayar vs nominal tagihan),
//                    modal zoom gambar bukti bayar, modal input alasan penolakan,
//                    dan badge status visual.
//            - Atnan: Menyediakan Server Action untuk mengubah status pembayaran
//                     menjadi MENUNGGU_APPROVAL_BENDAHARA (jika di-approve) atau
//                     DITOLAK_ADMIN (jika di-reject) dan memicu notifikasi WhatsApp.
// =========================================================================

import React from "react";
import MacWindowHeader from "@/components/ui/MacWindowHeader";
import GlassCard from "@/components/ui/GlassCard";

export default async function AdminVerifikasiPage() {
  // TODO (Atnan): Ambil data pembayaran dengan status MENUNGGU_VERIFIKASI_ADMIN dari database.

  return (
    <div className="admin-verifikasi-container">
      <MacWindowHeader title="Verifikasi Pembayaran (Tahap 1)" />

      <GlassCard className="table-card">
        {/* 
          TODO (Usva): Desain daftar antrean verifikasi. Kolom:
          Santri | Kelas | Tagihan | Nominal | Bukti | Aksi (Setujui / Tolak)
        */}
        <table className="mac-table">
          <thead>
            <tr>
              <th>Santri</th>
              <th>Tagihan</th>
              <th>Nominal Wajib</th>
              <th>Bukti Transfer</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="empty-row">
              <td colSpan={6} style={{ textAlign: "center" }}>Antrean verifikasi kosong.</td>
            </tr>
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
