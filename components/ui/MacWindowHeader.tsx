// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & Design System)
// Deskripsi: Komponen header jendela bergaya macOS.
//            Menyediakan bar atas dengan 3 tombol traffic light (Merah, Kuning, Hijau)
//            dan judul halaman di tengah.
//            Usva bertanggung jawab mendesain tampilannya agar terlihat premium
//            menggunakan Glassmorphic style.
// =========================================================================

import React from "react";

interface MacWindowHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function MacWindowHeader({ title, children }: MacWindowHeaderProps) {
  return (
    <div className="mac-window-header">
      {/* 
        TODO (Usva): 
        1. Desain traffic lights button (Merah, Kuning, Hijau).
        2. Tampilkan judul halaman (title) di tengah.
        3. Pastikan transparan dengan backdrop-filter blur.
      */}
      <div className="mac-traffic-lights">
        <span className="dot dot-red"></span>
        <span className="dot dot-yellow"></span>
        <span className="dot dot-green"></span>
      </div>
      <div className="mac-window-title">{title}</div>
      <div className="mac-window-actions">{children}</div>
    </div>
  );
}
