// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Detail tagihan dan Form Upload Bukti Pembayaran untuk Wali Murid (iOS View).
//            Wali murid mengunggah foto / PDF bukti transfer.
//            - Usva: Mendesain area drag-and-drop berkas / file selector,
//                    pratinjau gambar bukti yang diunggah, tombol upload,
//                    dan transisi sukses.
//            - Atnan: Membuat API Route / Server Action untuk memanggil `lib/blob.ts`
//                     (unggah ke Vercel Blob), membuat entitas Pembayaran di database,
//                     dan memperbarui status tagihan menjadi MENUNGGU_VERIFIKASI_ADMIN.
// =========================================================================

"use client";

import React, { useState } from "react";
// import { uploadPaymentProof } from "@/lib/blob";

export default function WaliUploadPembayaranPage({ params }: { params: { id: string } }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      // TODO (Atnan): Panggil endpoint upload / Server Action.
      // const proofUrl = await uploadPaymentProof(file);
      // await savePembayaran(params.id, proofUrl, note);
      console.log("Mengirim bukti bayar untuk tagihan ID:", params.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ios-viewport">
      <div className="detail-tagihan-header">
        <h1>Upload Bukti Pembayaran</h1>
        <p className="tagihan-id">ID Tagihan: {params.id}</p>
      </div>

      {/* 
        TODO (Usva):
        1. Desain card detail tagihan (Nominal, Nama Siswa, Jenis Tagihan).
        2. Buat widget file uploader bergaya iOS (tombol camera/gallery, preview area).
      */}
      <form onSubmit={handleUpload} className="ios-form">
        <div className="file-upload-card">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview Bukti" className="proof-preview" />
          ) : (
            <div className="upload-placeholder">
              <span className="icon">📷</span>
              <p>Pilih atau Tarik Bukti Transfer di Sini</p>
            </div>
          )}
          <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} required />
        </div>

        <div className="ios-input-group">
          <label>Catatan Tambahan (Opsional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ketik catatan jika nominal transfer berbeda"
          />
        </div>

        <button type="submit" className="ios-btn ios-btn-primary" disabled={loading || !file}>
          {loading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
        </button>
      </form>
    </div>
  );
}
