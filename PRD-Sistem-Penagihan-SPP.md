# PRD — Sistem Penagihan SPP & Iuran Tahunan Sekolah

**Versi:** 1.0
**Skala:** 1 sekolah (single-tenant)
**Metode Pembayaran:** Manual (upload bukti transfer + verifikasi admin)

---

## 1. Latar Belakang & Tujuan

Sekolah butuh sistem untuk menagih **SPP bulanan** dan **iuran tahunan** (uang gedung, seragam, buku, study tour, dll) ke wali murid, menggantikan pencatatan manual (buku/Excel/WA japri) yang rawan selisih, sulit dilacak, dan repot saat rekap akhir bulan.

**Tujuan sistem:**
- Admin/bendahara bisa generate tagihan otomatis tiap periode
- Wali murid bisa lihat tagihan & upload bukti bayar dari HP
- Admin verifikasi bukti bayar dengan sekali klik
- Tunggakan, rekap, dan laporan keuangan tersedia real-time
- Reminder otomatis via WhatsApp sebelum & sesudah jatuh tempo

---

## 2. Aktor (Roles)

| Role | Deskripsi |
|---|---|
| **Super Admin** | Owner sistem, kelola user admin, setting global |
| **Admin/Bendahara** | Kelola tagihan, verifikasi pembayaran, buat laporan, kelola master data siswa |
| **Wali Kelas** *(opsional, bisa di-skip di MVP)* | Lihat status tunggakan siswa di kelasnya saja |
| **Wali Murid** | Login, lihat tagihan anak, upload bukti bayar, download kwitansi |

> Catatan: satu akun Wali Murid bisa punya lebih dari satu anak (kasus kakak-adik satu sekolah) — ini WAJIB masuk desain sejak awal, sering jadi bug besar kalau ditambah belakangan.

---

## 3. Ruang Lingkup Use Case (Cakupan Penuh)

### 3.1 Master Data
- CRUD data siswa (nama, NIS, kelas, angkatan, status aktif/lulus/pindah, foto opsional)
- CRUD data wali murid & relasi wali–siswa (many-to-many: 1 wali bisa punya banyak anak, 1 siswa bisa dihubungkan ke lebih dari 1 wali/kontak)
- CRUD kelas & tahun ajaran (misal 2026/2027, semester ganjil/genap)
- CRUD jenis tagihan: SPP bulanan, uang gedung, uang seragam, uang buku, study tour, dll — masing-masing punya nominal default
- Nominal tagihan bisa **berbeda per jenjang/kelas** (SPP TK ≠ SPP SD, dst)
- Diskon/potongan per siswa (beasiswa, anak yatim, potongan sibling, dll) — nominal atau persentase
- Kenaikan kelas tahunan (promosi siswa ke kelas berikutnya, arsip data tahun ajaran lama)

### 3.2 Generate Tagihan
- Generate tagihan SPP otomatis tiap awal bulan untuk semua siswa aktif (cron job)
- Generate tagihan tahunan/insidental (uang gedung dll) manual per event, bisa pilih target: semua siswa / per kelas / per angkatan / custom pilih siswa
- Preview sebelum generate (supaya admin bisa cek dulu sebelum ke-generate massal)
- Tagihan otomatis kena diskon siswa ybs kalau ada

### 3.3 Pembayaran (Manual)
- Wali murid lihat daftar tagihan anak (status: belum bayar / menunggu verifikasi / lunas / terlambat)
- Wali murid upload bukti transfer (foto/PDF) + isi nominal & tanggal transfer
- Admin lihat antrian verifikasi, approve/reject dengan catatan (kalau reject, wali murid bisa upload ulang)
- Pembayaran cicilan/sebagian (partial payment) untuk tagihan besar seperti uang gedung — WAJIB dipikirkan dari awal, banyak sekolah kasih opsi cicil 2-3x
- Kwitansi otomatis ter-generate (PDF) begitu pembayaran approved, bisa didownload wali murid
- Riwayat pembayaran lengkap per siswa

### 3.4 Notifikasi & Reminder
- WhatsApp notifikasi (pola serupa [[sakupos]] — pakai Fonnte) untuk:
  - Tagihan baru terbit
  - Reminder H-3 sebelum jatuh tempo
  - Reminder saat terlambat (H+1, bisa diulang tiap X hari)
  - Konfirmasi pembayaran diterima/ditolak
- Broadcast manual dari admin ke wali murid tertentu/tunggak

### 3.5 Dashboard & Laporan
- Dashboard admin: total tagihan bulan ini, total terbayar, total tunggakan, grafik tren
- Rekap tunggakan per kelas/per siswa
- Export laporan ke Excel/PDF (per periode, per jenis tagihan, per kelas)
- Log aktivitas (siapa verifikasi apa, kapan) untuk audit

### 3.6 Autentikasi & Akses
- Login admin (email/password)
- Login wali murid (nomor HP/email + OTP atau password) — pertimbangkan wali murid awam teknologi, buat alur login sesederhana mungkin
- Reset password
- Session per role dengan middleware proteksi route

### 3.7 Non-Fungsional
- Mobile-first untuk sisi wali murid (mayoritas akses dari HP)
- Desktop-friendly untuk sisi admin (banyak tabel & filter)
- Backup data berkala
- Semua nominal uang pakai tipe data yang aman (jangan float — pakai integer rupiah atau Decimal)
- Multi-tahun-ajaran: data tahun lalu tidak boleh hilang/ketimpa saat tahun ajaran baru mulai

---

## 4. Rekomendasi Tech Stack

Karena kamu sudah terbiasa dengan Next.js dan deploy ke Vercel (pola dari [[sakupos]] & [[tarifter]]), dan sistem ini butuh cron job untuk generate tagihan bulanan otomatis, rekomendasi:

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Konsisten dengan stack kamu, full-stack dalam 1 repo |
| Database | **PostgreSQL** (Supabase / Neon) | Relasi banyak (wali-siswa many-to-many), butuh transaksi aman |
| ORM | **Prisma** | Migration rapi, cocok buat skema kompleks begini |
| Auth | **NextAuth (Auth.js)** dengan Credentials Provider | 2 role terpisah (admin vs wali murid), gampang dikembangkan |
| Storage bukti bayar | **Vercel Blob** atau **Supabase Storage** | Simpan foto/PDF bukti transfer |
| Notifikasi WA | **Fonnte** | Sudah pernah dipakai di SakuPOS, tinggal reuse pattern |
| Cron generate tagihan | **Vercel Cron Jobs** | Sama seperti pola recurring billing di SakuPOS |
| PDF kwitansi | **@react-pdf/renderer** atau **Puppeteer** | Generate kwitansi otomatis |
| Deploy | **Vercel** | Konsisten dengan project lain |

---

## 5. Skema Database (Outline Awal)

```
Siswa (id, nis, nama, kelas_id, tahun_ajaran_id, status, diskon_persen, diskon_nominal)
Wali (id, nama, no_hp, email, password_hash)
WaliSiswa (wali_id, siswa_id, relasi)  -- pivot many-to-many
Kelas (id, nama, jenjang, tahun_ajaran_id)
TahunAjaran (id, label, is_active)
JenisTagihan (id, nama, tipe: bulanan/tahunan/insidental, nominal_default)
TarifKelas (jenis_tagihan_id, kelas_id, nominal)  -- override nominal per kelas
Tagihan (id, siswa_id, jenis_tagihan_id, periode, nominal, status, jatuh_tempo)
Pembayaran (id, tagihan_id, nominal_dibayar, bukti_url, tanggal_transfer, status, catatan_admin, verified_by, verified_at)
Notifikasi (id, wali_id, tipe, pesan, status_kirim, created_at)
```

> Ini masih outline — perlu didetailkan jadi Prisma schema lengkap dengan constraint & index sebelum coding.

---

## 6. Fase Pengembangan (Milestone)

**Fase 1 — Fondasi**
Setup project, auth 2 role, master data siswa/wali/kelas/tahun ajaran

**Fase 2 — Tagihan**
Master jenis tagihan + tarif per kelas, generate tagihan (manual dulu, cron nyusul), diskon per siswa

**Fase 3 — Pembayaran**
Upload bukti bayar (wali murid), antrian & verifikasi (admin), kwitansi PDF

**Fase 4 — Notifikasi**
Integrasi Fonnte, reminder H-3 & keterlambatan, broadcast manual

**Fase 5 — Dashboard & Laporan**
Dashboard admin, export Excel/PDF, rekap tunggakan

**Fase 6 — Polish**
Cicilan/partial payment, kenaikan kelas tahunan, audit log, testing menyeluruh

---

## 7. Hal yang Sering Terlewat (Perlu Diputuskan di Awal)

- [ ] Apakah butuh cicilan untuk tagihan besar (uang gedung)?
- [ ] Bagaimana kalau siswa pindah/keluar di tengah tahun ajaran — tagihan bulan berjalan bagaimana?
- [ ] Apakah ada denda keterlambatan otomatis, atau kebijakan sekolah?
- [ ] Format nomor kwitansi/invoice — sesuai standar sekolah atau bebas?
- [ ] Siapa yang boleh generate tagihan tahunan (super admin saja atau semua admin)?

---

**Catatan:** dokumen ini dirancang agar bisa langsung dipakai sebagai konteks untuk AI coding agent (misal Antigravity) saat mulai development bertahap per fase di atas.
