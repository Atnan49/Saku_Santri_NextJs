"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & Design System)
// Deskripsi: Modal Bottom Sheet khas iOS yang meluncur dari bagian bawah layar.
//            Dilengkapi handle penarik (drag indicator) di bagian atas.
// =========================================================================

import React from "react";
import { X } from "lucide-react";

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
        <div className="bottom-sheet-handle" onClick={onClose} title="Geser/Klik Tutup" />

        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid var(--border-glass)",
            }}
          >
            <h3 className="bottom-sheet-title" style={{ margin: 0 }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="bottom-sheet-body">{children}</div>
      </div>
    </div>
  );
}
