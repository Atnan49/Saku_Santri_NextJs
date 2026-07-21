# Rencana Rancangan: Saku Santri (Manajemen Keuangan Pesantren)

Dokumen ini merupakan rencana rancangan teknis dan implementasi untuk aplikasi **Saku Santri**, yang telah disesuaikan berdasarkan persetujuan dan kebutuhan spesifik pengguna.

---

## Ringkasan Keputusan Desain & Spesifikasi (User Approved)

> [!NOTE]
> **Keputusan Utama yang Telah Disepakati:**
> 1. **Autentikasi Wali Murid**: Wali Murid dapat login langsung menggunakan **Nomor HP** dan **Password**. (Admin/Bendahara dapat login menggunakan Username/Email).
> 2. **Fleksibilitas Nominal Tagihan (Beasiswa & Keringanan)**: Sistem mendukung penyesuaian nominal khusus per siswa (potongan/beasiswa/keringanan) baik saat generate tagihan maupun penyesuaian tagihan individual.
> 3. **Integrasi WhatsApp (Fonnte / Wablas)**: Menggunakan integrasi API WhatsApp langsung (kredensial API Key sudah siap) untuk mengirim notifikasi reminder jatuh tempo, status verifikasi, dan bukti bayar.
> 4. **Bahasa Desain (Aesthetics)**: Mengusung estetika **macOS & iOS Design Language**:
>    - **Glassmorphism Translusen**: Efek `backdrop-blur` frosted glass pada navbar, sidebar, dan kartu status.
>    - **Komponen Khas macOS/iOS**: Segmented controls (tab switcher), iOS-style toggle switches, rounded action pills, dan bottom sheets (di mobile view Wali Murid).
>    - **Aksen macOS Window**: Header bar dengan aksen tombol traffic light khas macOS pada tampilan Admin/Bendahara desktop.
>    - **Desain Kartu Tabungan / Wallet (Wali Murid)**: Tampilan kartu anak bergaya iOS Wallet untuk wali yang memiliki lebih dari 1 anak.

---

## Proposed Changes & Arsitektur

### 1. Database & ORM Setup (Prisma)

#### [NEW] [schema.prisma](file:///d:/Projek-web/Saku%20santri/prisma/schema.prisma)

```prisma
datasource db {
  provider = "postgresql" // atau "sqlite" untuk lingkungan dev lokal
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  WALIMURID
  BENDAHARA
}

enum BillStatus {
  BELUM_BAYAR
  MENUNGGU_VERIFIKASI_ADMIN
  MENUNGGU_APPROVAL_BENDAHARA
  LUNAS
  DITOLAK_ADMIN
  DITOLAK_BENDAHARA
}

enum BillType {
  BULANAN
  TAHUNAN
}

model User {
  id           String        @id @default(uuid())
  username     String        @unique // Dapat berupa No HP untuk Wali, atau ID/Username untuk Admin
  phone        String?       @unique // Digunakan untuk login Wali Murid & notifikasi WA
  email        String?       @unique
  passwordHash String
  name         String
  role         Role          @default(WALIMURID)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  waliProfile  WaliMurid?
  notifications Notification[]
}

model WaliMurid {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  alamat    String?
  students  Siswa[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Kelas {
  id        String   @id @default(uuid())
  name      String   @unique // Misal "7A", "8B"
  students  Siswa[]
  createdAt DateTime @default(now())
}

model TahunAjaran {
  id        String    @id @default(uuid())
  year      String    @unique // Misal "2025/2026"
  isActive  Boolean   @default(false)
  bills     Tagihan[]
  createdAt DateTime  @default(now())
}

model Siswa {
  id             String    @id @default(uuid())
  nisn           String    @unique
  name           String
  kelasId        String
  kelas          Kelas     @relation(fields: [kelasId], references: [id])
  waliId         String
  wali           WaliMurid @relation(fields: [waliId], references: [id])
  // Dukungan Keringanan / Beasiswa Khusus
  potonganTetap  Decimal   @default(0) // Nominal potongan khusus/beasiswa per bulan (jika ada)
  catatanBeasiswa String?
  bills          Tagihan[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model JenisTagihan {
  id        String    @id @default(uuid())
  name      String    // Misal "SPP Bulanan", "Uang Gedung", "Seragam"
  type      BillType  @default(BULANAN)
  nominal   Decimal   // Nominal standar
  bills     Tagihan[]
  createdAt DateTime  @default(now())
}

model Tagihan {
  id             String        @id @default(uuid())
  siswaId        String
  siswa          Siswa         @relation(fields: [siswaId], references: [id])
  jenisTagihanId String
  jenisTagihan   JenisTagihan  @relation(fields: [jenisTagihanId], references: [id])
  tahunAjaranId  String
  tahunAjaran    TahunAjaran   @relation(fields: [tahunAjaranId], references: [id])
  nominalAwal    Decimal       // Nominal standar tagihan
  potongan       Decimal       @default(0) // Potongan beasiswa/keringanan khusus
  nominalAkhir   Decimal       // Nominal yang wajib dibayar (nominalAwal - potongan)
  dueDate        DateTime
  period         String?       // Format "YYYY-MM" untuk bulanan
  catatanTagihan String?       // Keterangan khusus (misal: "Keringanan 50%")
  status         BillStatus    @default(BELUM_BAYAR)
  payments       Pembayaran[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model Pembayaran {
  id               String      @id @default(uuid())
  tagihanId        String
  tagihan          Tagihan     @relation(fields: [tagihanId], references: [id], onDelete: Cascade)
  buktiUrl         String      // URL Vercel Blob Storage
  catatanWali      String?
  catatanAdmin     String?     // Catatan jika ditolak Admin
  catatanBendahara String?     // Catatan jika ditolak Bendahara
  verifiedAt       DateTime?   // Tanggal verifikasi Admin (Tahap 1)
  approvedAt       DateTime?   // Tanggal approval final Bendahara (Tahap 2)
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

### 2. Integrasi Layanan Eksternal

#### [NEW] [whatsapp.ts](file:///d:/Projek-web/Saku%20santri/lib/whatsapp.ts)
Modul utilitas untuk memicu pesan WhatsApp via Fonnte / Wablas API:
- **Pesan Tagihan Baru**: Mengirim rincian tagihan bulanan/tahunan saat di-generate.
- **Pesan Reminder**: Mengirim pesan pengingat tunggakan sebelum/setelah jatuh tempo.
- **Pesan Status Pembayaran**: Mengirim konfirmasi saat verifikasi disetujui atau alasan saat ditolak.

#### [NEW] [blob.ts](file:///d:/Projek-web/Saku%20santri/lib/blob.ts)
Integrasi Vercel Blob Storage untuk mengunggah dan pratinjau bukti transfer secara aman.

---

### 3. Bahasa Desain Antarmuka (macOS & iOS Aesthetic)

#### **Prinsip UI/UX**:
1. **macOS Desktop Dashboard (Admin & Bendahara)**:
   - Sidebar navigasi translusen dengan efek frosted glass (`backdrop-filter: blur(20px)`).
   - Card container dengan sudut membulat halus (`border-radius: 16px`), bayangan lembut (`box-shadow`), dan border tipis glowing (`border: 1px solid rgba(255, 255, 255, 0.15)`).
   - Header aplikasi dilengkapi aksen Window Control khas macOS (Tombol Merah, Kuning, Hijau).
   - Modals & Alert Sheets yang muncul bertransisi halus dari bagian atas/tengah layar layaknya Dialog System macOS.

2. **iOS Mobile View (Portal Wali Murid)**:
   - **Kartu Multi-Anak Bergaya iOS Wallet**: Menggunakan UI swipeable/stacked cards jika wali memiliki lebih dari 1 anak di pesantren.
   - **Segmented Control iOS**: Tab switcher antara "Tagihan Aktif", "Menunggu Verifikasi", dan "Riwayat Lunas".
   - **iOS Bottom Sheets**: Pratinjau detail tagihan dan form unggah bukti pembayaran menggunakan modal sheet yang meluncur dari bawah layar.
   - **Badge Status iOS**: Indikator warna transparan bercahaya (*Emerald* untuk Lunas, *Amber* untuk Menunggu, *Rose* untuk Ditolak).

---

### 4. Struktur Halaman & Komponen Next.js

```
d:\Projek-web\Saku santri\
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx              // Login macOS/iOS card (No HP / Username + Password)
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx    // Summary tagihan, grafik tren, antrean verifikasi
│   │   │   ├── santri/page.tsx       // Kelola siswa, kelas, wali & potongan beasiswa
│   │   │   ├── tagihan/page.tsx      // Generate tagihan otomatis & manual
│   │   │   ├── verifikasi/page.tsx   // Verifikasi Tahap 1 bukti transfer
│   │   │   └── pengaturan/page.tsx  // Tahun ajaran, jenis tagihan, user
│   │   ├── wali/
│   │   │   ├── dashboard/page.tsx    // iOS Wallet view per anak, daftar tagihan
│   │   │   └── tagihan/[id]/page.tsx // Detail & Form upload bukti transfer (Vercel Blob)
│   │   └── bendahara/
│   │       ├── dashboard/page.tsx    // Rekap keuangan total, grafik tunggakan
│   │       ├── approval/page.tsx     // Approval Tahap 2 (Final)
│   │       └── laporan/page.tsx      // Ekspor Excel & PDF kwitansi
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── tagihan/
│       ├── pembayaran/
│       └── whatsapp/
├── components/
│   ├── ui/
│   │   ├── MacWindowHeader.tsx       // Window title bar dengan traffic light buttons
│   │   ├── SegmentedControl.tsx      // Toggle tab khas iOS/macOS
│   │   ├── GlassCard.tsx             // Container frosted glass
│   │   ├── BottomSheet.tsx           // Modal sheet bawah khas iOS
│   │   └── StatusBadge.tsx           // Pill badge status berwarna khas iOS
├── lib/
│   ├── prisma.ts
│   ├── whatsapp.ts                   // Fonnte/Wablas helper
│   └── blob.ts                       // Vercel Blob helper
```

---

## Verification Plan

### Automated Verification
- Testing alur perubahan status tagihan (`BELUM_BAYAR` -> `MENUNGGU_VERIFIKASI_ADMIN` -> `MENUNGGU_APPROVAL_BENDAHARA` -> `LUNAS`).
- Verifikasi kalkulasi nominal tagihan akhir = (`nominalAwal` - `potongan`).

### Manual Verification
- Testing login Wali Murid menggunakan **Nomor HP** + Password.
- Testing pencatatan beasiswa / potongan harga pada siswa tertentu dan memastikan tagihan yang di-generate menghitung potongan tersebut dengan benar.
- Testing pengiriman notifikasi WhatsApp API via kredensial Fonnte/Wablas.
- Inspection visual pada layar desktop (Admin/Bendahara) dan layar seluler (Wali Murid) untuk memastikan konsistensi tema **macOS & iOS**.
