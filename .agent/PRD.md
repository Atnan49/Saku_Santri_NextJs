# Product Requirement Document (PRD)
## Project Name: Saku Santri (Sistem Manajemen Keuangan Pesantren)

---

## 1. Pendahuluan & Ringkasan Eksekutif

### 1.1 Visi Produk
**Saku Santri** adalah aplikasi web manajemen keuangan pesantren/sekolah yang dirancang untuk merampingkan proses pembuatan tagihan, pembayaran, verifikasi bertingkat, dan pelaporan keuangan. Aplikasi ini mengedepankan **kemudahan penggunaan bagi wali murid**, **akuntabilitas tinggi melalui verifikasi ganda (Dual-Approval)**, serta **pengalaman visual yang memukau (macOS & iOS Design Language)**.

### 1.2 Target Pengguna & Peran (User Roles)
1. **Admin (Tata Usaha)**: Bertanggung jawab mengelola data master (siswa, kelas, tahun ajaran), membuat/generate tagihan bulanan dan tahunan, mengatur potongan beasiswa, serta melakukan verifikasi bukti bayar tahap pertama.
2. **Wali Murid**: Mengakses aplikasi menggunakan Nomor HP & Password, melihat daftar tagihan anak-anaknya (dukungan multi-anak), mengunggah bukti transfer, serta mengunduh kwitansi resmi.
3. **Bendahara / Kepala Sekolah**: Memiliki wewenang persetujuan final (Tahap 2) atas pembayaran yang telah diverifikasi admin, melihat dashboard rekap keuangan menyeluruh, serta mengekspor laporan keuangan.

---

## 2. Matriks Hak Akses (Role-Based Access Control)

| Fitur / Modul | Admin (TU) | Wali Murid | Bendahara / Kepsek |
| :--- | :---: | :---: | :---: |
| Login No HP / Password | ❌ (Username/Email) | ✅ (No HP) | ❌ (Username/Email) |
| Kelola Data Master (Siswa, Kelas, Tahun Ajaran) | ✅ Full | ❌ | 👁️ Read-only |
| Atur Potongan / Beasiswa Siswa | ✅ Full | ❌ | 👁️ Read-only |
| Generate Tagihan (Bulanan & Tahunan) | ✅ Full | ❌ | 👁️ Read-only |
| Lihat Tagihan & Upload Bukti Transfer | ❌ | ✅ (Tagihan Anak) | ❌ |
| Verifikasi Tahap 1 (Cek Bukti Bayar) | ✅ Approve/Reject | ❌ | 👁️ Lihat Status |
| Approval Tahap 2 (Persetujuan Final) | ❌ | ❌ | ✅ Approve/Reject |
| Kirim Reminder WhatsApp | ✅ Manual/Cron | ❌ | ❌ |
| Download Kwitansi PDF | 👁️ | ✅ (Jika Lunas) | 👁️ |
| Ekspor Laporan Keuangan (Excel/PDF) | ✅ | ❌ | ✅ |

---

## 3. Spesifikasi Fungsional (Functional Requirements)

### FR-1: Autentikasi & Manajemen Sesi
- **FR-1.1**: Sistem menyediakan halaman login universal dengan antarmuka bertema macOS/iOS Card.
- **FR-1.2**: Wali Murid melakukan login menggunakan **Nomor HP** dan **Password**.
- **FR-1.3**: Admin dan Bendahara login menggunakan **Username / Email** dan **Password**.
- **FR-1.4**: Sesi pengguna dikelola secara aman dengan proteksi halaman berbasis role middleware.

### FR-2: Kelola Data Master & Potongan Beasiswa
- **FR-2.1**: Admin dapat menambah, mengubah, dan menghapus data Kelas, Tahun Ajaran, dan Siswa.
- **FR-2.2**: Satu Wali Murid dapat terhubung ke lebih dari 1 Siswa (relasi 1-to-N).
- **FR-2.3**: Admin dapat menentukan **potongan tetap / beasiswa** pada profil Siswa tertentu (misal: beasiswa 50% atau potongan Rp 200.000/bulan).

### FR-3: Engine Penagihan (Billing Management)
- **FR-3.1**: Admin dapat men-generate tagihan SPP bulanan secara otomatis per periode untuk seluruh siswa aktif.
- **FR-3.2**: Nominal tagihan otomatis memperhitungkan potongan beasiswa siswa (`nominalAkhir = nominalAwal - potongan`).
- **FR-3.3**: Admin dapat membuat tagihan tahunan/kegiatan secara manual per item (misal: Uang Gedung, Seragam, Kegiatan Ekstrakurikuler).
- **FR-3.4**: Admin memiliki wewenang untuk mengedit atau menghapus tagihan individual untuk kasus khusus.

### FR-4: Alur Pembayaran & Dual-Approval (Verifikasi 2-Tahap)
- **FR-4.1**: Wali Murid dapat melihat daftar tagihan aktif dan mengunggah bukti pembayaran (gambar/PDF) yang disimpan di **Vercel Blob Storage**.
- **FR-4.2**: Status awal pembayaran yang diunggah adalah `MENUNGGU_VERIFIKASI_ADMIN`.
- **FR-4.3 (Tahap 1)**: Admin memeriksa bukti transfer.
  - Jika diterima $\rightarrow$ Status berubah menjadi `MENUNGGU_APPROVAL_BENDAHARA`.
  - Jika ditolak $\rightarrow$ Status berubah menjadi `DITOLAK_ADMIN` beserta alasan penolakan. Wali murid dapat mengunggah ulang.
- **FR-4.4 (Tahap 2)**: Bendahara/Kepsek memeriksa pembayaran yang lolos Tahap 1.
  - Jika disetujui $\rightarrow$ Status berubah menjadi `LUNAS`, kwitansi otomatis di-generate.
  - Jika ditolak $\rightarrow$ Status berubah menjadi `DITOLAK_BENDAHARA` beserta alasan penolakan.

### FR-5: Integrasi WhatsApp & Notifikasi In-App
- **FR-5.1**: Integrasi langsung dengan API WhatsApp (Fonnte / Wablas) menggunakan API Key.
- **FR-5.2**: Pengiriman WA otomatis untuk:
  - Pemberitahuan tagihan baru yang diterbitkan.
  - Reminder pengingat jatuh tempo tagihan.
  - Notifikasi saat pembayaran disetujui atau ditolak (beserta alasan).
- **FR-5.3**: Sistem notifikasi in-app untuk menampilkan riwayat aktivitas pengguna.

### FR-6: Modul Pelaporan & Ekspor Data
- **FR-6.1**: Dashboard Bendahara menampilkan grafik rekap total penerimaan, total tunggakan per kelas, dan grafik tren bulanan.
- **FR-6.2**: Ekspor rekapitulasi data tagihan & pembayaran ke format **Excel (.xlsx)**.
- **FR-6.3**: Pembuatan dokumen kwitansi pembayar resmi berbasis **PDF** untuk setiap transaksi bertatus `LUNAS`.

---

## 4. Desain UI/UX (macOS & iOS Aesthetic Guidelines)

### 4.1 Visual System & Color Palette
- **Primary Accent**: Emerald Teal (`#0D9488` / `#14B8A6`) — Nuansa Islami yang segar dan profesional.
- **Surface & Glass**: Translucent Slate / Zinc dengan `backdrop-filter: blur(16px)` dan border halus (`rgba(255, 255, 255, 0.12)`).
- **Status Colors (iOS Vibe)**:
  - **Lunas**: Soft Emerald Green (`#10B981`)
  - **Menunggu Verifikasi**: Warm Amber (`#F59E0B`)
  - **Ditolak**: Vivid Rose (`#F43F5E`)

### 4.2 macOS Desktop Interface (Admin & Bendahara)
- **Top Window Bar**: Menggunakan ikon tombol *traffic light* (Merah, Kuning, Hijau) khas macOS.
- **Translucent Sidebar**: Navigasi samping dengan efek kaca buram dan aksen item aktif yang menyala halus.
- **Segmented Control**: Tab switcher antar filter (misal: "Semua", "Menunggu Verifikasi", "Terverifikasi") khas macOS Sequoia.

### 4.3 iOS Mobile Interface (Portal Wali Murid)
- **iOS Wallet Child Cards**: Jika wali murid memiliki lebih dari 1 anak, daftar anak ditampilkan sebagai tumpukan kartu interaktif bergaya Apple Wallet.
- **iOS Bottom Sheets**: Tampilan detail tagihan dan form upload bukti transfer meluncur dari bawah layar (*swipeable bottom sheet*).

---

## 5. Rencana Tahapan Pengembangan (Development Roadmap)

### Detail Rincian Tiap Fase:

- **Fase 1: Infrastructure & Database**
  - Inisialisasi proyek Next.js (App Router).
  - Konfigurasi Prisma ORM dengan skema basis data lengkap.
  - Setup autentikasi (NextAuth / Session) dengan role-based authorization.

- **Fase 2: macOS & iOS Design System**
  - Pembuatan variabel CSS & komponen UI dasar (`GlassCard`, `MacWindowHeader`, `SegmentedControl`, `BottomSheet`, `StatusBadge`).

- **Fase 3: Modul Admin Tata Usaha**
  - Implementasi CRUD Master Data (Siswa, Kelas, Wali, Tahun Ajaran).
  - Pengaturan potongan beasiswa per siswa.
  - Engine penagihan bulanan & tahunan.

- **Fase 4: Modul Wali Murid & Pembayaran**
  - Dashboard Wallet Multi-Anak.
  - Form upload bukti transfer terhubung ke Vercel Blob Storage.
  - Tracking status pembayaran realtime.

- **Fase 5: Modul Bendahara & Approval Workflow**
  - Implementasi antrean approval Tahap 2.
  - Dashboard rekapitulasi keuangan & grafik statistik.

- **Fase 6: Integrasi WhatsApp & Ekspor Laporan**
  - Modul pengiriman pesan via Fonnte/Wablas API.
  - Pembuatan kwitansi PDF otomatis & ekspor rekap Excel.

- **Fase 7: Verifikasi & Polishing**
  - Testing alur end-to-end (dari pembuatan tagihan hingga kwitansi).
  - Polish animasi & transisi UI.
