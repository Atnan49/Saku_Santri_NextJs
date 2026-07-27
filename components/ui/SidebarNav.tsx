"use client";

import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Receipt,
  CheckCircle2,
  FileText,
  Settings,
  User,
  Users,
  LogOut,
  ShieldAlert,
} from "lucide-react";

interface SidebarNavProps {
  activeItem?: string;
  userRole?: "ADMINISTRATOR" | "ADMIN" | "WALI MURID" | "WALIMURID" | "BENDAHARA" | "KOPERASI";
  userName?: string;
}

export default function SidebarNav({
  activeItem = "DASHBOARD",
  userRole = "ADMINISTRATOR",
  userName = "Pengguna Saku Santri",
}: SidebarNavProps) {
  const isBendahara = userRole === "BENDAHARA";
  const isWali = userRole === "WALI MURID" || userRole === "WALIMURID";
  const isAdmin = !isBendahara && !isWali;

  let navItems = [];

  if (isAdmin) {
    navItems = [
      { id: "DASHBOARD", label: "DASHBOARD", icon: LayoutDashboard, href: "/admin/dashboard" },
      { id: "VERIFIKASI", label: "VERIFIKASI", icon: CheckCircle2, href: "/admin/verifikasi" },
      { id: "SANTRI", label: "DATA SANTRI", icon: Users, href: "/admin/santri" },
      { id: "TAGIHAN", label: "TAGIHAN", icon: Receipt, href: "/admin/tagihan" },
      { id: "PENGATURAN", label: "PENGATURAN", icon: Settings, href: "/admin/pengaturan" },
    ];
  } else if (isBendahara) {
    navItems = [
      { id: "DASHBOARD", label: "DASHBOARD", icon: LayoutDashboard, href: "/bendahara/dashboard" },
      { id: "APPROVAL", label: "APPROVAL FINAL", icon: ShieldAlert, href: "/bendahara/approval" },
      { id: "LAPORAN", label: "REKAP LAPORAN", icon: FileText, href: "/bendahara/laporan" },
    ];
  } else {
    navItems = [
      { id: "DASHBOARD", label: "DASHBOARD WALI", icon: LayoutDashboard, href: "/wali/dashboard" },
    ];
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="brand-icon">S</div>
            <span className="brand-title">Saku Santri</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mobile-logout-btn"
            title="Keluar Sesi"
            style={{
              padding: "0.4rem 0.6rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--status-ditolak)",
              backgroundColor: "var(--status-ditolak-bg)",
              border: "1px solid var(--status-ditolak)",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem.toUpperCase() === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="profile-avatar">
            <User size={18} />
          </div>
          <div className="profile-info">
            <div className="role">{userRole}</div>
            <div className="name" style={{ wordBreak: "break-word" }}>{userName}</div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.75rem",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "var(--status-ditolak)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <LogOut size={16} />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
}
