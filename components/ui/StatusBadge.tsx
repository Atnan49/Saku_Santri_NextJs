// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & Design System)
// Deskripsi: Badge pill status dengan skema warna transparan bercahaya khas iOS.
//            Mendukung status: LUNAS, MENUNGGU VERIFIKASI, DITOLAK, dll.
//            Usva bertanggung jawab memetakan status ke warna yang tepat:
//            - Lunas: Hijau Emerald
//            - Menunggu: Amber/Oranye hangat
//            - Ditolak: Rose/Merah menyala
// =========================================================================

import React from "react";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  // Mapping status string ke CSS class
  const getStatusClass = (statusStr: string) => {
    switch (statusStr.toUpperCase()) {
      case "LUNAS":
        return "status-lunas";
      case "MENUNGGU_VERIFIKASI_ADMIN":
      case "MENUNGGU_APPROVAL_BENDAHARA":
      case "PROSES":
        return "status-menunggu";
      case "DITOLAK_ADMIN":
      case "DITOLAK_BENDAHARA":
      case "DITOLAK":
        return "status-ditolak";
      default:
        return "status-default";
    }
  };

  const formatText = (statusStr: string) => {
    return statusStr.replace(/_/g, " ");
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {/* 
        TODO (Usva):
        1. Desain badge berbentuk kapsul (rounded-pill).
        2. Terapkan warna teks pekat dengan background warna senada yang semi-transparan (glow effect).
      */}
      {formatText(status)}
    </span>
  );
}
