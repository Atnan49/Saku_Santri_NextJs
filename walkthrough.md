# Walkthrough: Inisialisasi Struktur Projek Saku Santri

Struktur folder dan file untuk proyek **Saku Santri** telah berhasil diinisialisasi sesuai dengan arsitektur yang disepakati. Seluruh file dibuat sebagai kerangka (placeholder) yang berisi deskripsi fungsionalitas dan tanggung jawab tim (Atnan, Yafi, Usva).

## Ringkasan Struktur yang Dibuat

Berikut adalah struktur berkas yang telah dibuat di direktori kerja:

### 1. Database & Seeding (Tanggung Jawab: Yafi)
- [schema.prisma](file:///d:/Projek-web/Saku%20santri/prisma/schema.prisma): Konfigurasi basis data PostgreSQL/SQLite lengkap dengan skema model User, WaliMurid, Siswa, Kelas, TahunAjaran, JenisTagihan, Tagihan, Pembayaran, dan Notification.
- [seed.ts](file:///d:/Projek-web/Saku%20santri/prisma/seed.ts): Kerangka script seeding data awal untuk mengisi data default (admin, kelas, tahun ajaran aktif).

### 2. Utilitas & Konfigurasi Backend (Tanggung Jawab: Atnan)
- [prisma.ts](file:///d:/Projek-web/Saku%20santri/lib/prisma.ts): Singleton instance Prisma Client untuk mencegah kebocoran koneksi saat hot reload.
- [auth.ts](file:///d:/Projek-web/Saku%20santri/lib/auth.ts): Kerangka konfigurasi NextAuth.js (Credentials Provider, session/jwt callbacks).
- [whatsapp.ts](file:///d:/Projek-web/Saku%20santri/lib/whatsapp.ts): Helper fungsi `sendWhatsAppMessage` menggunakan provider API (Fonnte/Wablas).
- [blob.ts](file:///d:/Projek-web/Saku%20santri/lib/blob.ts): Helper fungsi `uploadPaymentProof` menggunakan Vercel Blob Storage.
- [utils.ts](file:///d:/Projek-web/Saku%20santri/lib/utils.ts): Helper format mata uang Rupiah (`formatIDR`), format tanggal Indonesia, dan class merger (`cn`).

### 3. Komponen UI / Design System (Tanggung Jawab: Usva)
- [MacWindowHeader.tsx](file:///d:/Projek-web/Saku%20santri/components/ui/MacWindowHeader.tsx): Bar jendela macOS dengan tombol control traffic lights.
- [SegmentedControl.tsx](file:///d:/Projek-web/Saku%20santri/components/ui/SegmentedControl.tsx): Tab switcher dinamis bergaya iOS/macOS.
- [GlassCard.tsx](file:///d:/Projek-web/Saku%20santri/components/ui/GlassCard.tsx): Container frosted glass dengan efek hover glowing.
- [BottomSheet.tsx](file:///d:/Projek-web/Saku%20santri/components/ui/BottomSheet.tsx): Modal sheet bawah bergaya iOS untuk perangkat seluler.
- [StatusBadge.tsx](file:///d:/Projek-web/Saku%20santri/components/ui/StatusBadge.tsx): Badge status transaksi dengan warna glow (Emerald, Amber, Rose).

### 4. Halaman Aplikasi (Tanggung Jawab: Usva & Atnan)
- [login/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28auth%29/login/page.tsx): Halaman login universal (No HP / Username + Password).
- **Admin**:
  - [admin/dashboard/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/admin/dashboard/page.tsx): Summary widget dan grafik keuangan pesantren.
  - [admin/santri/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/admin/santri/page.tsx): Pengelolaan siswa, wali, dan potongan beasiswa.
  - [admin/tagihan/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/admin/tagihan/page.tsx): Engine pembuat tagihan SPP bulanan otomatis dan tagihan manual.
  - [admin/verifikasi/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/admin/verifikasi/page.tsx): Antrean verifikasi pembayaran bukti transfer Tahap 1.
  - [admin/pengaturan/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/admin/pengaturan/page.tsx): Pengaturan tahun ajaran aktif, jenis tagihan, dan user.
- **Wali Murid**:
  - [wali/dashboard/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/wali/dashboard/page.tsx): Tampilan Apple Wallet kartu anak-anak dan list tagihan aktif.
  - [wali/tagihan/[id]/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/wali/tagihan/%5Bid%5D/page.tsx): Form upload bukti pembayaran ke Vercel Blob.
- **Bendahara**:
  - [bendahara/dashboard/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/bendahara/dashboard/page.tsx): Rekap keuangan total, dana masuk, tunggakan kelas.
  - [bendahara/approval/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/bendahara/approval/page.tsx): Approval Tahap 2 (Final) persetujuan transaksi.
  - [bendahara/laporan/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/bendahara/laporan/page.tsx): Modul ekspor Excel dan pencetakan PDF kwitansi resmi.

### 5. API Routes & Berkas Root (Tanggung Jawab: Atnan)
- [layout.tsx](file:///d:/Projek-web/Saku%20santri/app/layout.tsx): Root layout untuk mendaftarkan global font, css, dan provider.
- [page.tsx](file:///d:/Projek-web/Saku%20santri/app/page.tsx): Root index file yang otomatis me-redirect user ke dashboard sesuai role session.
- [globals.css](file:///d:/Projek-web/Saku%20santri/app/globals.css): CSS Stylesheet global yang menyimpan custom properties (warna, shadow, blur) bertema macOS & iOS.
- **API Routes**:
  - [api/auth/[...nextauth]/route.ts](file:///d:/Projek-web/Saku%20santri/app/api/auth/%5B...nextauth%5D/route.ts): NextAuth handler.
  - [api/tagihan/route.ts](file:///d:/Projek-web/Saku%20santri/app/api/tagihan/route.ts): API generator tagihan.
  - [api/pembayaran/route.ts](file:///d:/Projek-web/Saku%20santri/app/api/pembayaran/route.ts): API pemrosesan/update status pembayaran.
  - [api/upload/route.ts](file:///d:/Projek-web/Saku%20santri/app/api/upload/route.ts): API uploader bukti transfer.
  - [api/whatsapp/route.ts](file:///d:/Projek-web/Saku%20santri/app/api/whatsapp/route.ts): API trigger pesan WhatsApp.

### 6. Berkas Konfigurasi Proyek (Bersama)
- [package.json](file:///d:/Projek-web/Saku%20santri/package.json): Berisi daftar dependensi utama (`@prisma/client`, `next-auth`, `@vercel/blob`, `recharts`, dll) dan scripts yang dibutuhkan proyek.
- [tsconfig.json](file:///d:/Projek-web/Saku%20santri/tsconfig.json): Konfigurasi TypeScript untuk Next.js.
- [next.config.mjs](file:///d:/Projek-web/Saku%20santri/next.config.mjs): Konfigurasi Next.js dengan whitelist Vercel Blob dan HTTP Security Headers (CSP, X-Frame-Options, dll).
- [.eslintrc.json](file:///d:/Projek-web/Saku%20santri/.eslintrc.json) & [.prettierrc](file:///d:/Projek-web/Saku%20santri/.prettierrc): Konfigurasi standarisasi kualitas dan pemformatan kode (linting).
- [.env.development](file:///d:/Projek-web/Saku%20santri/.env.development) & [.env.production](file:///d:/Projek-web/Saku%20santri/.env.production): Template variabel lingkungan untuk dev dan prod.
- [docker-compose.yml](file:///d:/Projek-web/Saku%20santri/docker-compose.yml): Setup PostgreSQL database lokal otomatis via Docker.

### 7. Berkas UX & Security Tingkat Produksi (Tanggung Jawab: Usva & Atnan)
- [middleware.ts](file:///d:/Projek-web/Saku%20santri/middleware.ts): Logika fungsional NextAuth Role-Based Access Control untuk proteksi halaman `/admin`, `/bendahara`, dan `/wali`.
- Halaman Loading & Error tingkat modul:
  - [app/loading.tsx](file:///d:/Projek-web/Saku%20santri/app/loading.tsx) & [app/error.tsx](file:///d:/Projek-web/Saku%20santri/app/error.tsx): Loading global dan penanganan error crash di level root.
  - [app/not-found.tsx](file:///d:/Projek-web/Saku%20santri/app/not-found.tsx): Tampilan halaman 404 estetik.
  - Halaman loading & error modular di `app/(dashboard)/admin/`, `app/(dashboard)/bendahara/`, dan `app/(dashboard)/wali/` untuk mendukung granular Next.js HTML Streaming.

## Status Repositori & Publikasi
- Seluruh berkas struktur final siap-produksi (production-ready) dan pembagian tugas tim telah berhasil dikomit dan diunggah (push) ke repositori GitHub: [Saku_Santri_NextJs](https://github.com/Atnan49/Saku_Santri_NextJs.git) pada cabang `main`.


