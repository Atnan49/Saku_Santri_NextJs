# Design System & Aesthetic Guidelines: Saku Santri (Academic Ledger System)

Dokumen ini adalah acuan resmi desain antarmuka, variabel CSS, konfigurasi Tailwind, serta pedoman estetika **Modern Institutional / Buku Besar Digital** untuk sistem keuangan sekolah/pesantren **Saku Santri**. Seluruh komponen UI yang dibuat harus mematuhi pedoman ini.

---

## 1. Konsep & Prinsip Estetika Utama

Sistem ini mengusung konsep **"Digital Ledger" (Buku Besar Digital)** — jembatan antara nilai historis buku induk fisik dan efisiensi perangkat lunak keuangan modern. 

- **Academic Rigor:** Penggunaan garis pembatas horizontal dan vertikal yang tegas (*grid & cell dividers*) untuk hirarki data yang rinci.
- **Warm Authority:** Palet warna hangat menyerupai kertas dokumen fisik (*Paper Cream*) dan tinta cetak institusional (*Ink Navy* & *Ledger Green*), menghindar dari kesan dingin serba putih/biru generik.
- **Document-Centric:** Komponen dan tata letak dirancang menyerupai bentuk formulir resmi, buku besar (buku induk), dan kuitansi fisik.
- **Restrained Geometry:** Memakai sudut tegas atau *soft corner* (4px). **Hindari bentuk kapsul/pill-shaped** karena tidak selaras dengan karakter resmi institusi.

---

## 2. Design Tokens & Tailind CSS Configuration

### 2.1 Skema Warna (Color Tokens)

```javascript
// tailwind.config.js - extended colors
colors: {
  // Primary (Ledger Green & Accents)
  'primary': '#154539',
  'primary-container': '#2f5d50',
  'on-primary': '#ffffff',
  'on-primary-container': '#a3d4c3',
  'primary-fixed': '#bceddc',
  'primary-fixed-dim': '#a0d1c0',

  // Surface & Paper Backgrounds
  'background': '#fdf9f1',         // Paper Cream Utama
  'surface': '#fdf9f1',            // Base Surface
  'surface-container-lowest': '#ffffff', // White (Cards, Tables, Receipts)
  'surface-container-low': '#f7f3eb',
  'surface-container': '#f1ede6',
  'surface-container-high': '#ece8e0',
  'surface-container-highest': '#e6e2da',
  'surface-dim': '#dddad2',

  // Ink Text & Typography Hierarchy
  'on-surface': '#1c1c17',         // Ink Navy / Charcoal Utama
  'on-surface-variant': '#404945', // Text Muted / Subtitle
  'outline': '#717975',            // Label & Icon Neutral
  'outline-variant': '#c0c8c4',    // Line Grey (Garis Tabel & Card Border)

  // Status & Accents (Stamp Gold, Alert Rust, Secondary)
  'tertiary': '#755b00',           // Stamp Gold (Status Lunas)
  'tertiary-container': '#cea62c',
  'on-tertiary-container': '#4f3d00',
  'error': '#ba1a1a',              // Alert Rust (Status Tunggakan/Batal)
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',
  'secondary': '#516071',          // Auxiliary Blue-Grey
  'secondary-container': '#d1e1f5',
  'on-secondary-container': '#556475',
}
```

---

## 3. Sistem Tipografi (Tri-Font Strategy)

Sistem tipografi memadukan 3 rumpun font untuk fungsi spesifik:

| Kategori | Font Family | Contoh Class Tailwind | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| **Headline / Titles** | `Source Serif 4` | `font-display-lg`, `font-headline-*` | Judul Halaman, Nama Siswa, Judul Kuitansi (Resmi/Diplomatis) |
| **Body & UI** | `IBM Plex Sans` | `font-body-*`, `font-label-caps` | Teks Deskripsi, Menu Navigasi, Form Label, Tombol Akses |
| **Numbers & Data** | `JetBrains Mono` | `font-number-*` (`tabular-nums`) | Nominal Uang (Rp), NISN, Tanggal, No. Kuitansi, Angka Tabel |

### 3.1 Skala Ukuran Font

```javascript
fontSize: {
  'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
  'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600' }],
  'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
  'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
  'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
  'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
  'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
  'number-lg': ['20px', { lineHeight: '24px', fontWeight: '500' }],
  'number-md': ['16px', { lineHeight: '20px', fontWeight: '500' }],
  'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '700' }],
}
```

---

## 4. Spasi, Border & Geometri Shapes

- **Base Spacing Unit:** 4px (8px, 16px, 24px, 32px, 48px).
- **Border Dividers:** Pembatas antar sel dan section menggunakan 1px `border-outline-variant` (`#c0c8c4`).
- **Border Radius:**
  - `rounded-sm`: `2px` (0.125rem)
  - `rounded` / `DEFAULT`: `4px` (0.25rem) — **Standar utama** untuk tombol, input, dan kontainer card.
  - `rounded-lg`: `8px` (0.5rem)
  - **Dilarang:** Menggunakan `rounded-full` pada tombol/badge status (kecuali avatar lingkaran / titik status).

---

## 5. Komponen Kunci (Key Components)

### 5.1 Stamp Badges (Efek Cap Stempel Fisik)
Badge status tidak menggunakan gaya pill lembut, melainkan bentuk persegi dengan efek stempel tinta:

- **Status Lunas (Stamp Gold):**
  ```html
  <span class="bg-tertiary-container text-on-tertiary-container border border-tertiary px-2 py-[2px] transform -rotate-2 inline-block font-label-caps text-label-caps tracking-widest shadow-[2px_2px_0px_#755b00]">
    LUNAS
  </span>
  ```
- **Status Tunggakan / Ditolak (Alert Rust):**
  ```html
  <span class="bg-error text-on-error border border-error-container px-2 py-[2px] inline-block font-label-caps text-label-caps tracking-widest shadow-[2px_2px_0px_#93000a]">
    TUNGGAKAN
  </span>
  ```
- **Status Menunggu Approval:**
  ```html
  <span class="bg-surface-container text-on-surface border border-outline px-2 py-[2px] inline-block font-label-caps text-label-caps tracking-widest">
    MENUNGGU
  </span>
  ```

### 5.2 Tabel Buku Induk (Ledger Table)
- Setiap baris dan kolom dipisahkan oleh garis vertikal & horizontal 1px (`border-outline-variant`).
- Header tabel menggunakan latar `bg-surface` dengan teks `font-label-caps text-outline uppercase`.
- Sel nominal uang menggunakan `font-number-md tabular-nums text-right`.

### 5.3 Kuitansi Digital (Digital Receipt)
- Menggunakan kontainer latar putih (`bg-white`) dengan garis tepi putus-putus 1px (`border-dashed border-outline-variant`).
- Dilengkapi dengan *watermark* samar ikon logo institusi (`opacity-[0.03]`).
- Memiliki area tanda tangan di bagian bawah dengan label miring `Source Serif 4`.

### 5.4 Form Inputs & Navigation
- Input menggunakan border 1px `border-outline-variant` pada kondisi normal dan berubah menjadi 2px `border-primary` saat terfokus (*focus:ring-0*).
- Label form selalu diletakkan di atas input menggunakan `font-label-caps text-outline uppercase`.
- Ikon menggunakan **Google Material Symbols Outlined** (`material-symbols-outlined`) atau **Lucide Icons** (`lucide-react`).

---

## 6. Referensi Contoh Layout

Halaman HTML Stitch yang telah diekstrak dapat dijadikan referensi implementasi langsung:
1. **Admin Tata Usaha / Bendahara:** [code.html](file:///d:/Projek-web/Saku%20santri/.agent/stitch_sistem_buku_besar_sekolah/dashboard_admin_tata_usaha/code.html)
2. **Dashboard Wali Murid:** [code.html](file:///d:/Projek-web/Saku%20santri/.agent/stitch_sistem_buku_besar_sekolah/dashboard_wali_murid/code.html)
3. **Kuitansi Digital:** [code.html](file:///d:/Projek-web/Saku%20santri/.agent/stitch_sistem_buku_besar_sekolah/kwitansi_digital/code.html)
4. **Verifikasi Pembayaran:** [code.html](file:///d:/Projek-web/Saku%20santri/.agent/stitch_sistem_buku_besar_sekolah/verifikasi_pembayaran/code.html)
