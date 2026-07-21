// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & Design System)
// Deskripsi: Komponen kartu dengan efek kaca buram (Glassmorphism).
//            Menggunakan backdrop-filter blur, border semi-transparan, dan bayangan
//            halus. Dilengkapi dengan efek hover glowing.
//            Usva bertanggung jawab membuat kartu ini terasa "hidup" dan interaktif.
// =========================================================================

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({ children, className = "", onClick }: GlassCardProps) {
  return (
    <div
      className={`glass-card ${onClick ? "interactive" : ""} ${className}`}
      onClick={onClick}
    >
      {/* 
        TODO (Usva):
        1. Terapkan style CSS frosted-glass (.glass-card) dengan border-radius besar.
        2. Tambahkan border glowing halus pada saat mouse hover.
      */}
      {children}
    </div>
  );
}
