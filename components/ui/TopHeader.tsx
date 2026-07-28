"use client";

import React, { useState } from "react";
import { Search, Bell, CheckCircle2, ShieldAlert } from "lucide-react";

interface TopHeaderProps {
  title?: string;
  onSearch?: (query: string) => void;
}

export default function TopHeader({
  title = "SISTEM KEUANGAN INSTITUSI",
  onSearch,
}: TopHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <header className="top-header">
      <div className="header-subtitle">{title}</div>
      <div className="header-actions">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Cari transaksi / santri..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div style={{ position: "relative" }}>
          <button
            className="notification-btn"
            title="Pusat Notifikasi System"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            <span className="notification-badge" />
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: "300px",
                backgroundColor: "#ffffff",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                padding: "1rem",
                zIndex: 50,
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "0.5rem",
                  marginBottom: "0.75rem",
                  borderBottom: "1px solid var(--border-glass)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: "var(--text-main)",
                    textTransform: "uppercase",
                  }}
                >
                  Notifikasi Saku Santri
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--primary)",
                    fontWeight: 700,
                  }}
                >
                  Aktif
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.6rem", fontSize: "0.78rem" }}>
                  <CheckCircle2 size={16} style={{ color: "var(--status-lunas)", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-main)" }}>Sistem Pembayaran Sync</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                      Semua transaksi terkoneksi dengan database utama.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.6rem", fontSize: "0.78rem" }}>
                  <ShieldAlert size={16} style={{ color: "var(--status-menunggu)", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-main)" }}>WhatsApp Gateway Ready</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                      Notifikasi otomatis siap dikirimkan ke wali murid.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
