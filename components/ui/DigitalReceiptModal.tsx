"use client";

import React from "react";
import { X, Printer, CheckCircle2 } from "lucide-react";
import { formatIDR, formatDateIndonesian } from "@/lib/utils";

export interface DigitalReceiptData {
  receiptNo: string;
  date: string;
  receivedFrom: string;
  studentName: string;
  studentClass: string;
  amount: number;
  amountInWords?: string;
  paymentFor: string;
  verifiedBy?: string;
  paymentMethod?: string;
}

interface DigitalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DigitalReceiptData | null;
}

export default function DigitalReceiptModal({
  isOpen,
  onClose,
  data,
}: DigitalReceiptModalProps) {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal-content printable-area"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0, overflow: "hidden" }}
      >
        {/* Header Bar modal (Hidden when printing) */}
        <div
          className="no-print"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.5rem",
            backgroundColor: "#F7F5EE",
            borderBottom: "1px solid #E5DFD3",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#0F392B" }}>
            <CheckCircle2 size={20} style={{ color: "#10B981" }} />
            <span>Pratinjau Kwitansi Digital Resmi</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button className="btn btn-primary" onClick={handlePrint} style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>
              <Printer size={15} />
              Cetak / Download PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.3rem",
                color: "#6B7670",
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Sheet */}
        <div
          style={{
            padding: "2.5rem 2rem",
            backgroundColor: "#FFFFFF",
            position: "relative",
            border: "2px solid #0F392B",
            margin: "1rem",
            borderRadius: "8px",
          }}
        >
          {/* Watermark Background */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.04,
              pointerEvents: "none",
              fontSize: "4rem",
              fontWeight: 900,
              color: "#0F392B",
              textTransform: "uppercase",
              transform: "rotate(-15deg)",
            }}
          >
            LUNAS - SAKU SANTRI
          </div>

          {/* Receipt Top Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              borderBottom: "2px solid #0F392B",
              paddingBottom: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#0F392B" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "#0F392B",
                    color: "#FFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                  }}
                >
                  S
                </div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "#0F392B" }}>
                  SAKU SANTRI
                </h1>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#6B7670", marginTop: "0.2rem" }}>
                Yayasan Pendidikan Digital • Sistem Keuangan Pesantren
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span className="badge badge-lunas" style={{ fontSize: "0.75rem", padding: "0.3rem 0.8rem", marginBottom: "0.4rem" }}>
                LUNAS
              </span>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F392B" }}>
                NO: {data.receiptNo}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#6B7670" }}>
                Tanggal: {formatDateIndonesian(data.date)}
              </div>
            </div>
          </div>

          {/* Receipt Title */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h2
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#0F392B",
                textDecoration: "underline",
                textUnderlineOffset: "4px",
              }}
            >
              KWITANSI PEMBAYARAN
            </h2>
          </div>

          {/* Receipt Body Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: "#6B7670" }}>Telah terima dari</span>
              <span style={{ fontWeight: 700, color: "#1C2823", borderBottom: "1px dotted #D5CFBF", paddingBottom: "0.2rem" }}>
                : {data.receivedFrom}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: "#6B7670" }}>Nama Siswa / Santri</span>
              <span style={{ fontWeight: 700, color: "#1C2823", borderBottom: "1px dotted #D5CFBF", paddingBottom: "0.2rem" }}>
                : {data.studentName} ({data.studentClass})
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: "#6B7670" }}>Uang Sejumlah</span>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: "#0F392B",
                  backgroundColor: "#F7F5EE",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #E5DFD3",
                  display: "inline-block",
                }}
              >
                : {formatIDR(data.amount)}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: "#6B7670" }}>Untuk Pembayaran</span>
              <span style={{ fontWeight: 700, color: "#1C2823", borderBottom: "1px dotted #D5CFBF", paddingBottom: "0.2rem" }}>
                : {data.paymentFor}
              </span>
            </div>

            {data.paymentMethod && (
              <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: "#6B7670" }}>Metode Pembayaran</span>
                <span style={{ fontWeight: 600, color: "#3E4A44" }}>
                  : {data.paymentMethod}
                </span>
              </div>
            )}
          </div>

          {/* Footer Signature Block */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: "2.5rem",
              paddingTop: "1rem",
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "#8E9993" }}>
              <div>* Kwitansi ini diterbitkan secara elektronik oleh Saku Santri.</div>
              <div>* Sah tanpa tanda tangan basah sesuai regulasi sistem digital.</div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.8rem", color: "#6B7670", marginBottom: "0.5rem" }}>
                Bendahara / Kasir Utama
              </div>
              <div
                style={{
                  border: "2px dashed #0F392B",
                  padding: "0.4rem 1rem",
                  borderRadius: "6px",
                  backgroundColor: "#F7F5EE",
                  color: "#0F392B",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  marginBottom: "0.3rem",
                }}
              >
                VERIFIED & STAMPED
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1C2823" }}>
                {data.verifiedBy || "Admin Utama"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
