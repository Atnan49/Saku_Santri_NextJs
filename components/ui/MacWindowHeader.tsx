"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & Design System)
// Deskripsi: Komponen header jendela bergaya macOS.
//            Menyediakan bar atas dengan 3 tombol traffic light (Merah, Kuning, Hijau)
//            dan judul halaman di tengah.
// =========================================================================

import React from "react";

interface MacWindowHeaderProps {
  title: string;
  children?: React.ReactNode;
  onClose?: () => void;
}

export default function MacWindowHeader({ title, children, onClose }: MacWindowHeaderProps) {
  return (
    <div className="mac-window-header">
      <div className="mac-traffic-lights">
        <span className="dot dot-red" onClick={onClose} title="Tutup" />
        <span className="dot dot-yellow" title="Minimalkan" />
        <span className="dot dot-green" title="Layar Penuh" />
      </div>
      <div className="mac-window-title">{title}</div>
      <div className="mac-window-actions">{children}</div>
    </div>
  );
}
