// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman Kwitansi Digital untuk Bendahara.
//            Menampilkan dokumen kwitansi resmi berdasarkan data Tagihan & Pembayaran
//            dari database. Data: Siswa, Wali, Nominal, Status LUNAS, TTD Bendahara.
// Route: /bendahara/kwitansi/[id]
// =========================================================================

import React from "react";
import SidebarNav from "@/components/ui/SidebarNav";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface PageProps {
  params: { id: string };
}

function formatRupiah(nominal: string | number): string {
  return Number(nominal).toLocaleString("id-ID");
}

function formatTanggal(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatTanggalPendek(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date(date))
    .toUpperCase();
}

function generateNomorKwitansi(tagihanId: string, approvedAt: Date | null): string {
  const d = approvedAt ? new Date(approvedAt) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const seq = tagihanId.slice(-3).toUpperCase();
  return `KW/${year}/${month}/${seq}`;
}

export default async function KwitansiDigitalPage({ params }: PageProps) {
  const tagihan = await prisma.tagihan.findUnique({
    where: { id: params.id },
    include: {
      siswa: {
        include: {
          kelas: true,
          wali: {
            include: { user: true },
          },
        },
      },
      jenisTagihan: true,
      tahunAjaran: true,
      pembayaran: true,
    },
  });

  if (!tagihan) notFound();

  const { siswa, jenisTagihan, pembayaran } = tagihan;
  const latestPayment = Array.isArray(pembayaran)
    ? (pembayaran.length > 0 ? pembayaran[pembayaran.length - 1] : null)
    : (pembayaran ? (pembayaran as any) : null);
  const waliNama = siswa.wali.user.name;
  const siswaNama = siswa.name;
  const kelasNama = siswa.kelas.name;
  const nominal = tagihan.nominalAkhir;
  const isLunas = tagihan.status === "LUNAS";
  const nomorKwitansi = generateNomorKwitansi(tagihan.id, latestPayment?.approvedAt ?? null);
  const tanggalApproved = latestPayment?.approvedAt ?? latestPayment?.verifiedAt ?? tagihan.updatedAt;
  const gunaMembayr = `Pembayaran ${jenisTagihan.name} Periode ${tagihan.period} - Tahun Ajaran ${tagihan.tahunAjaran.year}.`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;700&family=Source+Serif+4:ital,wght@0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@500&display=swap');

        .kwitansi-layout {
          display: flex;
          min-height: 100vh;
          background: #dddad2;
          font-family: 'IBM Plex Sans', sans-serif;
          color: #1c1c17;
        }

        .kwitansi-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        /* Top header bar */
        .kwitansi-topbar {
          position: sticky;
          top: 0;
          height: 64px;
          background: #ffffff;
          border-bottom: 1px solid #c0c8c4;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
        }

        .kwitansi-topbar-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #717975;
        }

        .kwitansi-topbar-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .kwitansi-search {
          display: flex;
          align-items: center;
          border: 1px solid #c0c8c4;
          border-radius: 2px;
          padding: 2px 8px;
          background: #ffffff;
          gap: 4px;
        }

        .kwitansi-search .material-symbols-outlined {
          font-size: 20px;
          color: #717975;
        }

        .kwitansi-search input {
          border: none;
          outline: none;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          width: 192px;
          background: transparent;
          color: #1c1c17;
        }

        .kwitansi-search input::placeholder { color: #c0c8c4; }

        .kwitansi-notif-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          color: #404945;
          position: relative;
          transition: background 0.15s;
        }

        .kwitansi-notif-btn:hover { background: #ece8e0; }

        .kwitansi-notif-btn .material-symbols-outlined { font-size: 24px; }

        .notif-dot {
          position: absolute;
          top: 4px; right: 4px;
          width: 8px; height: 8px;
          background: #ba1a1a;
          border-radius: 50%;
          border: 2px solid #ffffff;
        }

        /* Content area */
        .kwitansi-content {
          margin-top: 64px;
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 48px;
          background: #dddad2;
          position: relative;
        }

        /* Dot grid on content bg */
        .kwitansi-content::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #c0c8c4 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.4;
          pointer-events: none;
        }

        /* Document wrapper */
        .kwitansi-doc-wrap {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 720px;
          background: #ffffff;
          box-shadow: 0 25px 60px -10px rgba(0,0,0,0.22);
          padding: 4px;
        }

        /* Double border formal document */
        .kwitansi-doc-inner {
          border: 4px double #c0c8c4;
          padding: 48px;
          position: relative;
          min-height: 600px;
          display: flex;
          flex-direction: column;
        }

        /* Watermark */
        .kwitansi-watermark {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0.04;
        }

        .kwitansi-watermark-text {
          font-family: 'Source Serif 4', serif;
          font-size: 120px;
          font-weight: 700;
          color: #154539;
          transform: rotate(-30deg);
          white-space: nowrap;
        }

        /* Document header */
        .kwitansi-doc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 48px;
          position: relative;
          z-index: 10;
        }

        .kwitansi-doc-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .kwitansi-logo-box {
          width: 48px;
          height: 48px;
          background: #154539;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kwitansi-logo-box .material-symbols-outlined {
          color: #a0d1c0;
          font-size: 26px;
        }

        .kwitansi-doc-title {
          font-family: 'Source Serif 4', serif;
          font-size: 24px;
          font-weight: 600;
          color: #154539;
          letter-spacing: -0.01em;
          margin: 0 0 2px 0;
        }

        .kwitansi-doc-subtitle {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #717975;
        }

        .kwitansi-doc-header-right {
          text-align: right;
        }

        .kwitansi-nomor-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #717975;
          margin-bottom: 4px;
        }

        .kwitansi-nomor-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 20px;
          font-weight: 500;
          color: #1c1c17;
          letter-spacing: 0.02em;
        }

        .kwitansi-nomor-value span {
          color: #154539;
          font-weight: 700;
        }

        .kwitansi-tanggal-badge {
          display: inline-block;
          margin-top: 16px;
          background: #f1ede6;
          border: 1px solid #c0c8c4;
          padding: 4px 10px;
        }

        .kwitansi-tanggal-badge p {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #1c1c17;
        }

        .kwitansi-tanggal-badge span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 500;
        }

        /* Separator */
        .kwitansi-separator {
          width: 100%;
          height: 1px;
          background: #c0c8c4;
          margin-bottom: 48px;
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kwitansi-separator-label {
          background: #ffffff;
          padding: 0 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #717975;
        }

        /* Data grid */
        .kwitansi-grid {
          border: 1px solid #c0c8c4;
          position: relative;
          z-index: 10;
          flex-grow: 1;
          margin-bottom: 48px;
        }

        .kwitansi-row {
          display: grid;
          grid-template-columns: 1fr 2fr;
        }

        .kwitansi-row:not(:last-child) {
          border-bottom: 1px solid #c0c8c4;
        }

        .kwitansi-cell-label {
          padding: 16px;
          background: #f1ede6;
          border-right: 1px solid #c0c8c4;
          display: flex;
          align-items: center;
        }

        .kwitansi-cell-label span {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #404945;
        }

        .kwitansi-cell-value {
          padding: 16px;
          background: #ffffff;
          display: flex;
          align-items: center;
        }

        .kwitansi-cell-value.nominal-row {
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .kwitansi-cell-label.nominal-label {
          background: rgba(21,69,57,0.05);
          justify-content: center;
        }

        .kwitansi-cell-label.nominal-label span {
          color: #154539;
          letter-spacing: 0.1em;
        }

        .kwitansi-wali-name {
          font-family: 'Source Serif 4', serif;
          font-size: 20px;
          font-weight: 600;
          color: #1c1c17;
        }

        .kwitansi-siswa-name {
          font-size: 18px;
          font-weight: 400;
          color: #1c1c17;
        }

        .kwitansi-guna {
          font-size: 18px;
          font-style: italic;
          color: #1c1c17;
          line-height: 1.5;
        }

        .kwitansi-nominal-wrap {
          display: flex;
          align-items: baseline;
          gap: 6px;
          position: relative;
          z-index: 10;
          background: rgba(255,255,255,0.9);
          padding: 0 8px;
        }

        .kwitansi-nominal-rp {
          font-family: 'Source Serif 4', serif;
          font-size: 20px;
          font-weight: 600;
          color: #404945;
        }

        .kwitansi-nominal-angka {
          font-family: 'JetBrains Mono', monospace;
          font-size: 40px;
          font-weight: 700;
          color: #1c1c17;
          line-height: 1;
        }

        /* LUNAS stamp */
        .kwitansi-stamp {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%) rotate(-12deg);
          border: 3px solid #755b00;
          color: #755b00;
          padding: 4px 10px;
          pointer-events: none;
          opacity: 0.85;
        }

        .kwitansi-stamp span {
          font-family: 'Source Serif 4', serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        /* Footer signature */
        .kwitansi-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          position: relative;
          z-index: 10;
          margin-top: auto;
        }

        .kwitansi-cetak-btn {
          background: #154539;
          color: #ffffff;
          border: none;
          cursor: pointer;
          padding: 10px 24px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
          border-radius: 2px;
          box-shadow: 0 2px 8px rgba(21,69,57,0.25);
        }

        .kwitansi-cetak-btn:hover { background: #2f5d50; }

        .kwitansi-cetak-btn .material-symbols-outlined { font-size: 18px; }

        .kwitansi-ttd {
          width: 33%;
          text-align: center;
        }

        .kwitansi-ttd-kota {
          font-size: 14px;
          color: #717975;
          margin-bottom: 48px;
        }

        .kwitansi-ttd-nama-wrap {
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          position: relative;
        }

        .kwitansi-ttd-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          color: rgba(21,69,57,0.3);
          opacity: 0.5;
        }

        .kwitansi-ttd-nama {
          font-family: 'Source Serif 4', serif;
          font-size: 42px;
          font-style: italic;
          color: #1c1c17;
          transform: rotate(-3deg);
          position: relative;
          z-index: 10;
        }

        .kwitansi-ttd-info {
          border-top: 1px solid #c0c8c4;
          padding-top: 8px;
        }

        .kwitansi-ttd-jabatan {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #1c1c17;
          margin-bottom: 2px;
        }

        .kwitansi-ttd-nip {
          font-size: 14px;
          color: #717975;
        }

        /* Corner cuts */
        .corner { position: absolute; width: 16px; height: 16px; background: #dddad2; }
        .corner-tl { top: 0; left: 0; border-bottom-right-radius: 100%; border-bottom: 1px solid rgba(192,200,196,0.3); border-right: 1px solid rgba(192,200,196,0.3); }
        .corner-tr { top: 0; right: 0; border-bottom-left-radius: 100%; border-bottom: 1px solid rgba(192,200,196,0.3); border-left: 1px solid rgba(192,200,196,0.3); }
        .corner-bl { bottom: 0; left: 0; border-top-right-radius: 100%; border-top: 1px solid rgba(192,200,196,0.3); border-right: 1px solid rgba(192,200,196,0.3); }
        .corner-br { bottom: 0; right: 0; border-top-left-radius: 100%; border-top: 1px solid rgba(192,200,196,0.3); border-left: 1px solid rgba(192,200,196,0.3); }

        @media print {
          .kwitansi-topbar, .sidebar, .kwitansi-cetak-btn { display: none !important; }
          .kwitansi-main { margin-left: 0 !important; }
          .kwitansi-content { padding: 0 !important; background: white !important; }
          .kwitansi-doc-wrap { box-shadow: none !important; max-width: 100% !important; }
        }
      `}</style>

      <div className="kwitansi-layout">
        <SidebarNav activeItem="APPROVAL" userRole="BENDAHARA" userName="Bendahara Sekolah" />

        <div className="kwitansi-main">
          {/* Top bar */}
          <header className="kwitansi-topbar">
            <span className="kwitansi-topbar-title">Sistem Keuangan Institusi</span>
            <div className="kwitansi-topbar-right">
              <div className="kwitansi-search">
                <span className="material-symbols-outlined">search</span>
                <input type="text" placeholder="Cari data..." />
              </div>
              <button className="kwitansi-notif-btn" aria-label="Notifikasi">
                <span className="material-symbols-outlined">notifications</span>
                <span className="notif-dot" />
              </button>
            </div>
          </header>

          {/* Main content */}
          <div className="kwitansi-content">
            <div className="kwitansi-doc-wrap">
              {/* Corner cuts */}
              <div className="corner corner-tl" />
              <div className="corner corner-tr" />
              <div className="corner corner-bl" />
              <div className="corner corner-br" />

              <div className="kwitansi-doc-inner">
                {/* Watermark */}
                <div className="kwitansi-watermark">
                  <span className="kwitansi-watermark-text">SAKU SANTRI</span>
                </div>

                {/* Header dokumen */}
                <header className="kwitansi-doc-header">
                  <div className="kwitansi-doc-header-left">
                    <div className="kwitansi-logo-box">
                      <span className="material-symbols-outlined">menu_book</span>
                    </div>
                    <div>
                      <h1 className="kwitansi-doc-title">Kwitansi Resmi</h1>
                      <p className="kwitansi-doc-subtitle">Institusi Pendidikan Terpadu</p>
                    </div>
                  </div>
                  <div className="kwitansi-doc-header-right">
                    <p className="kwitansi-nomor-label">No. Tanda Terima</p>
                    <p className="kwitansi-nomor-value">
                      {nomorKwitansi.split("/").map((part, i) =>
                        i === nomorKwitansi.split("/").length - 1
                          ? <span key={i}>/{part}</span>
                          : <React.Fragment key={i}>{i > 0 ? "/" : ""}{part}</React.Fragment>
                      )}
                    </p>
                    <div className="kwitansi-tanggal-badge">
                      <p>
                        Tanggal:{" "}
                        <span>{formatTanggalPendek(tanggalApproved)}</span>
                      </p>
                    </div>
                  </div>
                </header>

                {/* Separator */}
                <div className="kwitansi-separator">
                  <span className="kwitansi-separator-label">Salinan Digital</span>
                </div>

                {/* Data grid */}
                <div className="kwitansi-grid">
                  {/* Telah Terima Dari */}
                  <div className="kwitansi-row">
                    <div className="kwitansi-cell-label">
                      <span>Telah Terima Dari</span>
                    </div>
                    <div className="kwitansi-cell-value">
                      <span className="kwitansi-wali-name">
                        {waliNama} (Orang Tua Wali)
                      </span>
                    </div>
                  </div>

                  {/* Nama Siswa */}
                  <div className="kwitansi-row">
                    <div className="kwitansi-cell-label">
                      <span>Nama Siswa</span>
                    </div>
                    <div className="kwitansi-cell-value">
                      <span className="kwitansi-siswa-name">
                        {siswaNama} / Kls {kelasNama}
                      </span>
                    </div>
                  </div>

                  {/* Guna Membayar */}
                  <div className="kwitansi-row">
                    <div className="kwitansi-cell-label" style={{ alignItems: "flex-start", paddingTop: 16 }}>
                      <span>Guna Membayar</span>
                    </div>
                    <div className="kwitansi-cell-value" style={{ minHeight: 100, alignItems: "flex-start", paddingTop: 16 }}>
                      <p className="kwitansi-guna">{gunaMembayr}</p>
                    </div>
                  </div>

                  {/* Terbilang / Nominal */}
                  <div className="kwitansi-row">
                    <div className="kwitansi-cell-label nominal-label">
                      <span>Terbilang</span>
                    </div>
                    <div className="kwitansi-cell-value nominal-row">
                      {isLunas && (
                        <div className="kwitansi-stamp">
                          <span>L U N A S</span>
                        </div>
                      )}
                      <div className="kwitansi-nominal-wrap">
                        <span className="kwitansi-nominal-rp">Rp</span>
                        <span className="kwitansi-nominal-angka">
                          {formatRupiah(nominal.toString())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer: Cetak + TTD */}
                <footer className="kwitansi-footer">
                  <div>
                    <button
                      className="kwitansi-cetak-btn"
                      onClick={() => window.print()}
                    >
                      <span className="material-symbols-outlined">print</span>
                      Cetak Dokumen
                    </button>
                  </div>

                  <div className="kwitansi-ttd">
                    <p className="kwitansi-ttd-kota">
                      Jakarta, {formatTanggal(tanggalApproved)}
                    </p>
                    <div className="kwitansi-ttd-nama-wrap">
                      <svg
                        className="kwitansi-ttd-svg"
                        viewBox="0 0 200 100"
                        preserveAspectRatio="none"
                        fill="none"
                      >
                        <path
                          d="M20 70 Q 50 30, 80 80 T 150 40 T 180 60"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="kwitansi-ttd-nama">Siti Aminah</span>
                    </div>
                    <div className="kwitansi-ttd-info">
                      <p className="kwitansi-ttd-jabatan">Tanda Tangan Digital Bendahara</p>
                      <p className="kwitansi-ttd-nip">NIP. 19850212 201001 2 015</p>
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
