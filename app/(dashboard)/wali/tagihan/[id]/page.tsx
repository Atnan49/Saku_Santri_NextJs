"use client";

import React, { useState, useEffect } from "react";
import { formatIDR } from "@/lib/utils";
import { getTagihanById } from "@/lib/actions/tagihan";
import { submitPaymentProof } from "@/lib/actions/pembayaran";
import { UploadCloud, CheckCircle2, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";

export default function WaliUploadPembayaranPage({ params }: { params: { id: string } }) {
  const [tagihan, setTagihan] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [note, setNote] = useState("");
  const [refNo, setRefNo] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBill() {
      try {
        const data = await getTagihanById(params.id);
        if (!data) {
          setErrorMsg("Tagihan tidak ditemukan.");
        } else {
          setTagihan(data);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Gagal mengambil detail tagihan.");
      } finally {
        setFetching(false);
      }
    }
    fetchBill();
  }, [params.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !tagihan) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Upload ke /api/upload
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await res.json();
      if (!res.ok || !uploadResult.success) {
        throw new Error(uploadResult.error || "Gagal mengunggah berkas bukti.");
      }

      const buktiUrl = uploadResult.url;

      // 2. Submit server action
      const catatanCombined = [refNo ? `No Ref: ${refNo}` : "", note].filter(Boolean).join(" | ");

      const submitRes = await submitPaymentProof({
        tagihanId: tagihan.id,
        buktiUrl,
        catatanWali: catatanCombined || undefined,
      });

      if (submitRes.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses bukti pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center" }}>
        <Loader2 className="animate-spin" size={36} style={{ color: "var(--primary)", margin: "0 auto 1rem" }} />
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Memuat detail tagihan...</p>
      </div>
    );
  }

  if (errorMsg && !tagihan) {
    return (
      <div style={{ maxWidth: "600px", margin: "3rem auto", padding: "1.5rem" }}>
        <div className="glass-card" style={{ padding: "2rem", textAlign: "center", border: "1px solid var(--status-ditolak)" }}>
          <AlertCircle size={44} style={{ color: "var(--status-ditolak)", margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>{errorMsg}</h2>
          <Link href="/wali/dashboard" style={{ marginTop: "1.5rem", display: "inline-block", padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: 700, backgroundColor: "var(--primary)", color: "#FFF", borderRadius: "8px", textDecoration: "none" }}>
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isSubmitted = ["MENUNGGU_VERIFIKASI_ADMIN", "MENUNGGU_APPROVAL_BENDAHARA", "LUNAS"].includes(tagihan.status);

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/wali/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
          <ArrowLeft size={18} /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, padding: "0.25rem 0.65rem", borderRadius: "999px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
              {tagihan.period ? `PERIODE ${tagihan.period}` : "TAGIHAN SANTRI"}
            </span>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.5rem" }}>
              {tagihan.jenisTagihan?.name}
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              {tagihan.siswa?.name} (Kelas {tagihan.siswa?.kelas?.name}) • <strong>{formatIDR(Number(tagihan.nominalAkhir))}</strong>
            </p>
          </div>
          <StatusBadge status={tagihan.status} />
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: "var(--status-ditolak-bg)", border: "1px solid var(--status-ditolak)", color: "var(--status-ditolak)", padding: "0.85rem", borderRadius: "8px", fontSize: "0.85rem" }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {success || isSubmitted ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem", backgroundColor: "var(--status-lunas-bg)", borderRadius: "8px", border: "1px solid var(--status-lunas)" }}>
            <CheckCircle2 size={48} style={{ color: "var(--status-lunas)", margin: "0 auto 0.75rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--status-lunas)" }}>
              {tagihan.status === "LUNAS" ? "Tagihan Ini Sudah LUNAS" : "Bukti Transfer Berhasil Dikirim!"}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
              {tagihan.status === "LUNAS"
                ? "Terima kasih, pembayaran Anda telah diverifikasi dan disetujui."
                : "Status tagihan telah diperbarui menjadi MENUNGGU VERIFIKASI ADMIN."}
            </p>
            <Link href="/wali/dashboard" style={{ marginTop: "1.25rem", display: "inline-block", padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: 700, backgroundColor: "var(--primary)", color: "#FFF", borderRadius: "8px", textDecoration: "none" }}>
              Kembali ke Portal Wali
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>Nomor Referensi Bank / Transfer</label>
              <input
                type="text"
                placeholder="Cth: TRF-9921-2023"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                required
                style={{
                  padding: "0.6rem 0.85rem",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "var(--text-main)",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>Bukti Transfer (Gambar / PDF)</label>
              <div
                style={{
                  border: "2px dashed var(--border-glass)",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  textAlign: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.01)",
                  cursor: "pointer",
                }}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  required
                />
                {previewUrl ? (
                  <div>
                    <img src={previewUrl} alt="Preview Bukti" style={{ maxHeight: "180px", margin: "0 auto", borderRadius: "6px", border: "1px solid var(--border-glass)" }} />
                    <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700, marginTop: "0.5rem" }}>
                      {file?.name} (Klik untuk mengganti)
                    </div>
                  </div>
                ) : (
                  <div>
                    <UploadCloud size={36} style={{ color: "var(--primary)", margin: "0 auto 0.5rem" }} />
                    <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-main)" }}>Pilih atau Tarik Berkas di Sini</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>JPG, PNG, WebP, atau PDF (Max 5MB)</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>Catatan Tambahan (Opsional)</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ketik catatan jika terdapat perbedaan nominal transfer..."
                style={{
                  padding: "0.6rem 0.85rem",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "var(--text-main)",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              style={{
                width: "100%",
                padding: "0.85rem",
                fontSize: "0.85rem",
                fontWeight: 800,
                backgroundColor: "var(--primary)",
                color: "#FFF",
                border: "none",
                borderRadius: "8px",
                cursor: loading || !file ? "not-allowed" : "pointer",
                opacity: loading || !file ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Mengirim Bukti...</span>
                </>
              ) : (
                "KIRIM BUKTI PEMBAYARAN"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

