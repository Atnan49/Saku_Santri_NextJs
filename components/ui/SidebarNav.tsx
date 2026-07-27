"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Receipt,
  CheckCircle2,
  FileText,
  Settings,
  User,
} from "lucide-react";

interface SidebarNavProps {
  activeItem?: "DASHBOARD" | "TAGIHAN" | "VERIFIKASI" | "LAPORAN" | "PENGATURAN";
  userRole?: "ADMINISTRATOR" | "WALI MURID" | "BENDAHARA";
  userName?: string;
}

export default function SidebarNav({
  activeItem = "DASHBOARD",
  userRole = "ADMINISTRATOR",
  userName = "Admin Utama",
}: SidebarNavProps) {
  const navItems = [
    { id: "DASHBOARD", label: "DASHBOARD", icon: LayoutDashboard, href: "/wali/dashboard" },
    { id: "TAGIHAN", label: "TAGIHAN", icon: Receipt, href: "/wali/tagihan" },
    { id: "VERIFIKASI", label: "VERIFIKASI", icon: CheckCircle2, href: "/admin/verifikasi" },
    { id: "LAPORAN", label: "LAPORAN", icon: FileText, href: "/admin/laporan" },
    { id: "PENGATURAN", label: "PENGATURAN", icon: Settings, href: "/admin/pengaturan" },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <div className="brand-icon">S</div>
          <span className="brand-title">Saku Santri</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
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

      <div className="sidebar-footer">
        <div className="profile-avatar">
          <User size={18} />
        </div>
        <div className="profile-info">
          <div className="role">{userRole}</div>
          <div className="name">{userName}</div>
        </div>
      </div>
    </aside>
  );
}
