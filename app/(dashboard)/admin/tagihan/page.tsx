// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman generator tagihan (Bulanan & Tahunan). Admin dapat men-generate
//            tagihan SPP bulanan otomatis atau membuat tagihan kegiatan manual.
//            - Usva: Mendesain formulir generator tagihan dengan range picker,
//                    pilihan jenis tagihan, serta status loading/progress bar iOS.
//            - Atnan: Membuat logika backend / Server Actions untuk meng-generate
//                     baris-baris data Tagihan di database dengan memperhitungkan
//                     potonganTetap masing-masing siswa (nominalAkhir = nominalAwal - potongan).
// =========================================================================

import React from "react";
import MacWindowHeader from "@/components/ui/MacWindowHeader";
import GlassCard from "@/components/ui/GlassCard";

export default function AdminTagihanPage() {
  return (
    <div className="admin-tagihan-container">
      <MacWindowHeader title="Generate Tagihan Santri" />

      <div className="tagihan-grid">
        <GlassCard className="form-card">
          <h3>Generate SPP Bulanan Otomatis</h3>
          <p className="description">
            Sistem akan otomatis men-generate tagihan SPP bulanan untuk seluruh siswa
            aktif berdasarkan jenis tagihan SPP dan diskon beasiswa masing-masing.
          </p>
          {/* 
            TODO (Usva): Buat form pilihan Bulan, Tahun Ajaran, dan tombol Generate.
          */}
          <button className="mac-btn mac-btn-primary">Generate SPP Sekarang</button>
        </GlassCard>

        <GlassCard className="form-card">
          <h3>Buat Tagihan Kegiatan / Tahunan</h3>
          <p className="description">
            Buat tagihan khusus (Uang Gedung, Seragam, Kegiatan) per individu
            atau kelompok kelas.
          </p>
          {/* 
            TODO (Usva): Form input nominal, pilih kelas, nama tagihan, dan tanggal jatuh tempo.
          */}
          <button className="mac-btn">Buat Tagihan Manual</button>
        </GlassCard>
      </div>
    </div>
  );
}
