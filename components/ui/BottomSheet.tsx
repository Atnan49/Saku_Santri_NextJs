// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & Design System)
// Deskripsi: Modal Bottom Sheet khas iOS yang meluncur dari bagian bawah layar.
//            Dilengkapi handle penarik (drag indicator) di bagian atas.
//            Usva bertanggung jawab atas animasi masuk/keluar (slide up/down)
//            serta gesture swipe-to-close jika memungkinkan.
// =========================================================================

import React from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()}>
        {/* iOS Drag Handle */}
        <div className="bottom-sheet-handle" onClick={onClose}></div>
        
        {title && <h3 className="bottom-sheet-title">{title}</h3>}
        
        <div className="bottom-sheet-body">
          {/* 
            TODO (Usva):
            1. Desain modal agar meluncur dari bawah.
            2. Terapkan visual blur khas iOS dan radius sudut atas (border-radius: 20px 20px 0 0).
          */}
          {children}
        </div>
      </div>
    </div>
  );
}
