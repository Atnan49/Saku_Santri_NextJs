// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend & Design System)
// Deskripsi: Komponen kontrol tersegmentasi (Tab Switcher) bergaya iOS/macOS.
//            Digunakan untuk berpindah tab/kategori secara halus dengan transisi slide.
//            Usva bertanggung jawab atas styling CSS, efek active pill,
//            dan mikro-animasi pada komponen ini.
// =========================================================================

import React from "react";

interface SegmentedControlProps {
  options: string[];
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
      {/* 
        TODO (Usva):
        1. Buat kontainer bergaya iOS pill/capsule dengan background gelap semi-transparan.
        2. Terapkan active-indicator yang bergeser halus (slide animation) ketika selectedValue berubah.
      */}
      {options.map((option) => (
        <button
          key={option}
          className={`segmented-item ${selectedValue === option ? "active" : ""}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
