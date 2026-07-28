"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & Design System)
// Deskripsi: Badge pill status dengan skema warna transparan bercahaya khas iOS.
//            Mendukung status: LUNAS, MENUNGGU VERIFIKASI, DITOLAK, dll.
// =========================================================================

import React from "react";
import { CheckCircle2, Clock, XCircle, Tag } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = (status || "").toUpperCase();

  let statusClass = "status-default";
  let Icon = Tag;

  if (normalizedStatus === "LUNAS" || normalizedStatus === "VERIFIED") {
    statusClass = "status-lunas";
    Icon = CheckCircle2;
  } else if (
    normalizedStatus.includes("MENUNGGU") ||
    normalizedStatus.includes("PROSES") ||
    normalizedStatus.includes("PENDING")
  ) {
    statusClass = "status-menunggu";
    Icon = Clock;
  } else if (
    normalizedStatus.includes("DITOLAK") ||
    normalizedStatus.includes("REJECTED") ||
    normalizedStatus.includes("FAILED")
  ) {
    statusClass = "status-ditolak";
    Icon = XCircle;
  }

  const formatText = (statusStr: string) => {
    if (!statusStr) return "-";
    return statusStr.replace(/_/g, " ");
  };

  return (
    <span className={`status-badge ${statusClass}`}>
      <Icon size={13} />
      <span>{formatText(status)}</span>
    </span>
  );
}
