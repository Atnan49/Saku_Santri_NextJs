# Pembagian Tugas & Tanggung Jawab Tim: Saku Santri

Dokumen ini berisi rincian peran, tanggung jawab, dan file spesifik yang harus dikerjakan oleh masing-masing anggota tim (**Atnan**, **Yafi**, dan **Usva**) dalam proyek **Saku Santri**.

---

## 1. Atnan (Backend & Logic)
Atnan bertanggung jawab atas logika bisnis, autentikasi, integrasi API, pengunggahan berkas, dan pengiriman notifikasi otomatis.

### Tugas Utama:
1. Mengamankan rute aplikasi dengan proteksi sesi berbasis peran (Role-Based Middleware).
2. Membuat logika pembuatan tagihan otomatis per bulan/tahun dengan kalkulasi diskon beasiswa.
3. Memproses alur persetujuan dual-approval (Admin TU -> Bendahara).
4. Menghubungkan proses upload bukti transfer ke Vercel Blob Storage.
5. Integrasi API pihak ketiga untuk notifikasi WhatsApp.
6. Pembuatan berkas ekspor laporan keuangan (.xlsx) dan cetak kwitansi (.pdf).

### Daftar File yang Harus Dikerjakan:
* **Autentikasi & Utilitas:**
  * [lib/auth.ts](file:///d:/Projek-web/Saku%20santri/lib/auth.ts) — Mengatur provider autentikasi NextAuth, session JWT, dan login handler.
  * [lib/prisma.ts](file:///d:/Projek-web/Saku%20santri/lib/prisma.ts) — Menjamin singleton instance Prisma Client agar koneksi database efisien.
  * [lib/whatsapp.ts](file:///d:/Projek-web/Saku%20santri/lib/whatsapp.ts) — Integrasi API Fonnte/Wablas untuk notifikasi status bayar & reminder.
  * [lib/blob.ts](file:///d:/Projek-web/Saku%20santri/lib/blob.ts) — Pengaturan helper upload bukti bayar menggunakan Vercel Blob.
  * [lib/utils.ts](file:///d:/Projek-web/Saku%20santri/lib/utils.ts) — Implementasi fungsi pembantu seperti format mata uang Rupiah (`formatIDR`) dan tanggal Indonesia.
* **API Endpoints:**
  * [app/api/auth/[...nextauth]/route.ts](file:///d:/Projek-web/Saku%20santri/app/api/auth/%5B...nextauth%5D/route.ts) — Router endpoint untuk alur autentikasi.
  * [app/api/tagihan/route.ts](file:///d:/Projek-web/Saku%20santri/app/api/tagihan/route.ts) — Endpoint pembuat tagihan siswa bulanan secara otomatis.
  * [app/api/pembayaran/route.ts](file:///d:/Projek-web/Saku%20santri/app/api/pembayaran/route.ts) — Logika workflow status pembayaran (verifikasi & approval).
  * [app/api/upload/route.ts](file:///d:/Projek-web/Saku%20santri/app/api/upload/route.ts) — Handler endpoint untuk upload bukti transfer.
  * [app/api/whatsapp/route.ts](file:///d:/Projek-web/Saku%20santri/app/api/whatsapp/route.ts) — Endpoint untuk trigger pengiriman WhatsApp.
* **Logika Halaman & Halaman Root:**
  * [app/page.tsx](file:///d:/Projek-web/Saku%20santri/app/page.tsx) — Deteksi sesi aktif di sisi server untuk auto-redirect user ke dashboard masing-masing.
  * Halaman dashboard (Admin, Wali, Bendahara) — Integrasi database server-side untuk menampilkan data dinamis.

---

## 2. Yafi (Database & Data Modeling)
Yafi bertanggung jawab atas pemodelan basis data, integritas relasi tabel, dan penyediaan data awal (seeding) untuk kebutuhan development.

### Tugas Utama:
1. Menyusun struktur tabel relasi yang efisien (Siswa, Wali, Tagihan, Pembayaran, dll) di skema ORM.
2. Melakukan migrasi database (Prisma Migration) dari lokal hingga produksi.
3. Menyusun data awal (Seed) untuk admin, bendahara, serta data siswa mock guna memudahkan pengujian.

### Daftar File yang Harus Dikerjakan:
* **Skema & Migrasi:**
  * [prisma/schema.prisma](file:///d:/Projek-web/Saku%20santri/prisma/schema.prisma) — Menyusun tabel relasi database PostgreSQL/SQLite sesuai kebutuhan fitur.
* **Data Awal (Seeding):**
  * [prisma/seed.ts](file:///d:/Projek-web/Saku%20santri/prisma/seed.ts) — Menulis data mock (akun default, kelas, tahun ajaran aktif) untuk diinjeksi saat inisialisasi awal.

---

## 3. Usva (Frontend & UI/UX Design System)
Usva bertanggung jawab atas visualisasi antarmuka, pembuatan reusable UI components, layout responsif (mobile-first untuk wali murid), grafik statistik, dan animasi UI bertema macOS & iOS.

### Tugas Utama:
1. Mengimplementasikan token warna, blur glassmorphism, dan shadows dari desain sistem.
2. Membuat komponen pembungkus universal (cards, window header macOS, bottom sheets iOS, status badges).
3. Mendesain alur navigasi layout utama yang translusen.
4. Membuat visualisasi data menggunakan library chart (tren penerimaan & tunggakan kelas).
5. Memastikan kenyamanan visual dan validasi client-side di seluruh halaman form login/input.

### Daftar File yang Harus Dikerjakan:
* **Global CSS:**
  * [app/globals.css](file:///d:/Projek-web/Saku%20santri/app/globals.css) — Pengelolaan font, variabel CSS global, warna status glow, serta class pembantu untuk visual glassmorphism.
* **Design System Components:**
  * [components/ui/MacWindowHeader.tsx](file:///d:/Projek-web/Saku%20santri/components/ui/MacWindowHeader.tsx) — Header dengan tombol traffic lights (merah, kuning, hijau) khas macOS.
  * [components/ui/SegmentedControl.tsx](file:///d:/Projek-web/Saku%20santri/components/ui/SegmentedControl.tsx) — Tab switcher kapsul bergaya macOS/iOS.
  * [components/ui/GlassCard.tsx](file:///d:/Projek-web/Saku%20santri/components/ui/GlassCard.tsx) — Kartu konten dengan border glowing dan backdrop blur frosted glass.
  * [components/ui/BottomSheet.tsx](file:///d:/Projek-web/Saku%20santri/components/ui/BottomSheet.tsx) — Modal sheet bawah khas iOS dengan handle penarik.
  * [components/ui/StatusBadge.tsx](file:///d:/Projek-web/Saku%20santri/components/ui/StatusBadge.tsx) — Label indikator status Lunas/Menunggu/Ditolak bertema iOS glow.
* **Desain Halaman (Pages & Layouts):**
  * [app/(auth)/login/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28auth%29/login/page.tsx) — Halaman login macOS card.
  * [app/layout.tsx](file:///d:/Projek-web/Saku%20santri/app/layout.tsx) — Integrasi font, layout container, dan stylesheet.
  * **Modul Admin TU:**
    * [app/(dashboard)/admin/dashboard/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/admin/dashboard/page.tsx) — Widget summary dan visualisasi chart tren keuangan.
    * [app/(dashboard)/admin/santri/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/admin/santri/page.tsx) — Halaman CRUD (tabel santri & form input beasiswa).
    * [app/(dashboard)/admin/tagihan/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/admin/tagihan/page.tsx) — Form generator tagihan SPP bulanan & manual.
    * [app/(dashboard)/admin/verifikasi/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/admin/verifikasi/page.tsx) — Tabel antrean verifikasi bukti transfer Tahap 1.
    * [app/(dashboard)/admin/pengaturan/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/admin/pengaturan/page.tsx) — Halaman tab switcher pengaturan sistem.
  * **Modul Wali Murid (iOS Mobile View):**
    * [app/(dashboard)/wali/dashboard/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/wali/dashboard/page.tsx) — iOS wallet stack untuk multi-anak dan list tagihan aktif.
    * [app/(dashboard)/wali/tagihan/[id]/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/wali/tagihan/%5Bid%5D/page.tsx) — Layout detail tagihan dan widget uploader bukti transfer.
  * **Modul Bendahara & Kepala Sekolah:**
    * [app/(dashboard)/bendahara/dashboard/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/bendahara/dashboard/page.tsx) — Dashboard ringkasan keuangan total.
    * [app/(dashboard)/bendahara/approval/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/bendahara/approval/page.tsx) — Antrean approval pembayaran final Tahap 2.
    * [app/(dashboard)/bendahara/laporan/page.tsx](file:///d:/Projek-web/Saku%20santri/app/%28dashboard%29/bendahara/laporan/page.tsx) — Form filter tanggal/kelas untuk ekspor laporan.
