// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman antrean approval pembayaran Tahap 2 (Final).
//            Bendahara/Kepsek menyetujui transaksi yang sudah lolos verifikasi TU.
//            - Usva: Mendesain daftar approval dengan rincian bukti transfer, catatan TU,
//                    dan input catatan bendahara untuk approval/penolakan final.
//            - Atnan: Menyediakan Server Action untuk memperbarui status transaksi menjadi
//                     LUNAS (dan men-generate kwitansi) atau DITOLAK_BENDAHARA,
//                     serta mengirim pesan WhatsApp notifikasi otomatis.
// =========================================================================

import React from "react";
import MacWindowHeader from "@/components/ui/MacWindowHeader";
import GlassCard from "@/components/ui/GlassCard";

export default async function BendaharaApprovalPage() {
  // TODO (Atnan): Ambil data pembayaran dengan status MENUNGGU_APPROVAL_BENDAHARA dari DB.

  return (
    <div className="bendahara-approval-container">
      <MacWindowHeader title="Persetujuan Pembayaran Final (Tahap 2)" />

      <GlassCard className="table-card">
        {/* 
          TODO (Usva): Desain tabel persetujuan dengan rincian data:
          Santri | Kelas | Tagihan | Pengunggah | Verifikator TU | Bukti Transfer | Aksi
        */}
        <table className="mac-table">
          <thead>
            <tr>
              <th>Santri</th>
              <th>Tagihan</th>
              <th>Nominal</th>
              <th>Diverifikasi Oleh</th>
              <th>Bukti</th>
              <th>Aksi Final</th>
            </tr>
          </thead>
          <tbody>
            <tr className="empty-row">
              <td colSpan={6} style={{ textAlign: "center" }}>Tidak ada transaksi membutuhkan persetujuan final.</td>
            </tr>
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
