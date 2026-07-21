// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman pengaturan sistem untuk mengelola Tahun Ajaran (aktif/nonaktif),
//            master Jenis Tagihan, dan data user (Admin/Bendahara).
//            - Usva: Mendesain tab switcher (Segmented Control) untuk membagi modul
//                    Tahun Ajaran, Jenis Tagihan, dan Manajemen User, beserta form input.
//            - Atnan: Menyediakan Server Actions untuk menyimpan konfigurasi sistem,
//                     mengaktifkan/menonaktifkan tahun ajaran, dan hashing password user.
// =========================================================================

import React from "react";
import MacWindowHeader from "@/components/ui/MacWindowHeader";
import GlassCard from "@/components/ui/GlassCard";

export default function AdminPengaturanPage() {
  return (
    <div className="admin-pengaturan-container">
      <MacWindowHeader title="Pengaturan Sistem" />

      {/* 
        TODO (Usva): 
        1. Terapkan SegmentedControl di sini untuk beralih antara:
           "Tahun Ajaran" | "Jenis Tagihan" | "Manajemen User"
        2. Tampilkan form & list data yang sesuai berdasarkan tab terpilih.
      */}
      <div className="settings-content-wrapper">
        <GlassCard className="settings-card">
          <h3>Kelola Tahun Ajaran</h3>
          <p className="description">
            Tentukan tahun ajaran aktif. Hanya ada 1 tahun ajaran yang boleh aktif dalam satu waktu.
          </p>
          {/* List & toggle status aktif */}
        </GlassCard>
      </div>
    </div>
  );
}
