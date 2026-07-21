// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman pengelolaan data master Santri, Kelas, dan Wali Murid,
//            serta pengelolaan nominal potongan beasiswa per santri.
//            - Usva: Membuat UI CRUD dengan tabel data interaktif, form input,
//                    dan dialog konfirmasi dengan nuansa macOS.
//            - Atnan: Membuat Server Actions / API Endpoints untuk melakukan
//                     operasi Create, Read, Update, Delete (CRUD) di DB prisma.
// =========================================================================

import React from "react";
import MacWindowHeader from "@/components/ui/MacWindowHeader";
import GlassCard from "@/components/ui/GlassCard";

export default async function AdminSantriPage() {
  // TODO (Atnan): Ambil data Santri, Kelas, Wali, dan konfigurasi Beasiswa dari DB.

  return (
    <div className="admin-santri-container">
      <MacWindowHeader title="Kelola Data Santri & Wali Murid" />

      <div className="page-actions">
        {/* TODO (Usva): Tambahkan tombol Tambah Santri, Tambah Kelas, dll */}
        <button className="mac-btn mac-btn-primary">Tambah Santri Baru</button>
      </div>

      <GlassCard className="table-card">
        {/* 
          TODO (Usva): Desain tabel santri dengan kolom:
          NISN | Nama Santri | Kelas | Wali Murid | Beasiswa/Potongan | Aksi
        */}
        <table className="mac-table">
          <thead>
            <tr>
              <th>NISN</th>
              <th>Nama Santri</th>
              <th>Kelas</th>
              <th>Wali Murid</th>
              <th>Potongan SPP</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {/* Loop data santri dari Atnan */}
            <tr className="empty-row">
              <td colSpan={6} style={{ textAlign: "center" }}>Belum ada data santri.</td>
            </tr>
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
