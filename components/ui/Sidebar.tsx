// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & Design System)
// Deskripsi: Komponen Sidebar navigasi dashboard — selaras desain Buku Besar Digital.
//            Menampilkan logo, menu navigasi, dan info user yang sedang login.
// =========================================================================

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  role?: "admin" | "bendahara" | "wali";
  userName?: string;
  userRole?: string;
}

const navItemsBendahara = [
  { label: "Dashboard", icon: "dashboard", href: "/bendahara/dashboard" },
  { label: "Tagihan", icon: "payments", href: "/bendahara/kwitansi" },
  { label: "Verifikasi", icon: "verified", href: "/bendahara/approval" },
  { label: "Laporan", icon: "description", href: "/bendahara/laporan" },
  { label: "Pengaturan", icon: "settings", href: "/bendahara/pengaturan" },
];

const navItemsAdmin = [
  { label: "Dashboard", icon: "dashboard", href: "/admin/dashboard" },
  { label: "Tagihan", icon: "payments", href: "/admin/tagihan" },
  { label: "Verifikasi", icon: "verified", href: "/admin/verifikasi" },
  { label: "Laporan", icon: "description", href: "/admin/laporan" },
  { label: "Pengaturan", icon: "settings", href: "/admin/pengaturan" },
];

export default function Sidebar({ role = "bendahara", userName = "Admin Utama", userRole = "Administrator" }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "admin" ? navItemsAdmin : navItemsBendahara;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;700&family=Source+Serif+4:wght@600;700&display=swap');

        .sidebar {
          position: fixed;
          left: 0; top: 0;
          height: 100%;
          width: 288px;
          background: #ffffff;
          border-right: 1px solid #c0c8c4;
          z-index: 50;
          display: flex;
          flex-direction: column;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .sidebar-brand {
          padding: 24px;
          border-bottom: 1px solid #c0c8c4;
          background: #f7f3eb;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar-brand-icon {
          width: 32px;
          height: 32px;
          background: #154539;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-brand-icon .material-symbols-outlined {
          color: #a0d1c0;
          font-size: 18px;
        }

        .sidebar-brand-name {
          font-family: 'Source Serif 4', serif;
          font-size: 20px;
          font-weight: 600;
          color: #154539;
          letter-spacing: -0.01em;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px 16px;
          border-radius: 4px;
          text-decoration: none;
          color: #404945;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: background 0.15s, color 0.15s;
        }

        .sidebar-nav-item:hover {
          background: #ece8e0;
          color: #1c1c17;
        }

        .sidebar-nav-item.active {
          background: #154539;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(21,69,57,0.25);
        }

        .sidebar-nav-item .material-symbols-outlined {
          font-size: 22px;
        }

        .sidebar-user {
          padding: 24px;
          border-top: 1px solid #c0c8c4;
          background: #ffffff;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sidebar-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #154539;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }

        .sidebar-user-avatar .material-symbols-outlined {
          color: #ffffff;
          font-size: 18px;
        }

        .sidebar-user-role {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #717975;
          line-height: 1;
          margin-bottom: 3px;
        }

        .sidebar-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #1c1c17;
        }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <span className="material-symbols-outlined">menu_book</span>
          </div>
          <span className="sidebar-brand-name">Saku Santri</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item${isActive ? " active" : ""}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <p className="sidebar-user-role">{userRole}</p>
            <p className="sidebar-user-name">{userName}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
