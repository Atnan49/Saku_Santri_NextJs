"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & Design System)
// Deskripsi: Komponen kontrol tersegmentasi (Tab Switcher) bergaya iOS/macOS.
//            Digunakan untuk berpindah tab/kategori secara halus.
// =========================================================================

import React from "react";

export interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: (string | SegmentedOption)[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export default function SegmentedControl({
  options,
  selectedValue,
  onChange,
}: SegmentedControlProps) {
  return (
    <div className="segmented-control-container">
      {options.map((option) => {
        const val = typeof option === "string" ? option : option.value;
        const label = typeof option === "string" ? option : option.label;
        const isActive = selectedValue === val;

        return (
          <button
            key={val}
            type="button"
            className={`segmented-item ${isActive ? "active" : ""}`}
            onClick={() => onChange(val)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
