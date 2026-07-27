"use client";

import React from "react";
import { Search, Bell } from "lucide-react";

interface TopHeaderProps {
  title?: string;
}

export default function TopHeader({ title = "SISTEM KEUANGAN INSTITUSI" }: TopHeaderProps) {
  return (
    <header className="top-header">
      <div className="header-subtitle">{title}</div>
      <div className="header-actions">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Cari data..." />
        </div>
        <button className="notification-btn" title="Notifikasi">
          <Bell size={20} />
          <span className="notification-badge" />
        </button>
      </div>
    </header>
  );
}
