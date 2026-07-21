// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Modul pelaporan dan ekspor rekap keuangan.
//            Bendahara dapat mengekspor rekap keuangan ke Excel dan kwitansi ke PDF.
//            - Usva: Mendesain halaman pelaporan dengan range filter tanggal/bulan,
//                    filter kelas, tombol ekspor dengan ikon yang menarik.
//            - Atnan: Membuat fungsionalitas ekspor ke format Excel (.xlsx)
//                     dan generator dokumen PDF Kwitansi Pembayaran (PDFKit/jsPDF/dll).
// =========================================================================

import React from "react";
import MacWindowHeader from "@/components/ui/MacWindowHeader";
import GlassCard from "@/components/ui/GlassCard";

export default function BendaharaLaporanPage() {
  return (
    <div className="bendahara-laporan-container">
      <MacWindowHeader title="Laporan Keuangan & Ekspor Data" />

      <div className="laporan-grid">
        <GlassCard className="form-card">
          <h3>Ekspor Rekapitulasi Tagihan</h3>
          <p className="description">
            Unduh berkas Excel (.xlsx) yang berisi seluruh riwayat tagihan dan
            pembayaran siswa berdasarkan rentang waktu atau kelas tertentu.
          </p>
          {/* 
            TODO (Usva): Form filter tanggal/kelas dan tombol Unduh Excel.
          */}
          <button className="mac-btn mac-btn-primary">Unduh Rekap Excel</button>
        </GlassCard>

        <GlassCard className="form-card">
          <h3>Cetak Kwitansi Pembayaran</h3>
          <p className="description">
            Cari transaksi pembayaran berstatus LUNAS untuk mencetak ulang kwitansi PDF resmi.
          </p>
          {/* 
            TODO (Usva): Kolom pencarian transaksi dan tombol Cetak PDF.
          */}
          <button className="mac-btn">Cari & Cetak PDF</button>
        </GlassCard>
      </div>
    </div>
  );
}
