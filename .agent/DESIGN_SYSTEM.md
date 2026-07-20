# Design System & Aesthetic Guidelines: Saku Santri

Dokumen ini berisi pedoman desain antarmuka, variabel CSS, komponen UI, serta prinsip estetika **macOS & iOS** untuk proyek Saku Santri. Gunakan pedoman ini sebagai acuan saat melakukan *vibe coding* komponen UI.

---

## 1. Design Tokens & Color Palette

### 1.1 Palette Utama (Teal/Emerald Islami & Slate Dark/Light)
```css
:root {
  /* Brand Accent (Emerald Teal) */
  --primary: #0d9488;
  --primary-hover: #0f766e;
  --primary-light: rgba(13, 148, 136, 0.15);
  --primary-glow: rgba(20, 184, 166, 0.35);

  /* macOS / iOS Glass Colors (Dark Mode Default) */
  --bg-app: #090d16;
  --bg-surface: rgba(18, 24, 38, 0.65);
  --bg-surface-hover: rgba(30, 41, 59, 0.75);
  --border-glass: rgba(255, 255, 255, 0.12);
  --border-glass-bright: rgba(255, 255, 255, 0.22);
  
  /* Text Hierarchy */
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-dim: #64748b;

  /* Status Colors (iOS Glow System) */
  --status-lunas: #10b981;
  --status-lunas-bg: rgba(16, 185, 129, 0.15);
  --status-menunggu: #f59e0b;
  --status-menunggu-bg: rgba(245, 158, 11, 0.15);
  --status-ditolak: #f43f5e;
  --status-ditolak-bg: rgba(244, 63, 94, 0.15);

  /* Shadows & Blur */
  --glass-blur: blur(20px) saturate(180%);
  --shadow-mac: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
  --shadow-ios: 0 10px 25px -5px rgba(0, 0, 0, 0.3);

  /* Radius System */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-full: 9999px;
}
```

---

## 2. Komponen Khas macOS (Desktop Admin & Bendahara)

### 2.1 Window Title Bar (`MacWindowHeader`)
- Memiliki 3 tombol lingkaran (*traffic lights*):
  - **Merah** (`#ff5f56`) - Close
  - **Kuning** (`#ffbd2e`) - Minimize
  - **Hijau** (`#27c93f`) - Expand
- Menyajikan judul halaman di bagian tengah dengan font Medium.

### 2.2 Segmented Control (Tab Switcher)
- Desain kapsul melayang (*floating pill*) dengan latar belakang `rgba(0, 0, 0, 0.3)`.
- Item yang aktif menggunakan slide animation transisi halus dengan latar belakang `--primary` atau frosted white.

### 2.3 Glassmorphic Card (`GlassCard`)
```css
.glass-card {
  background: var(--bg-surface);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-mac);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  border-color: var(--border-glass-bright);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 20px var(--primary-glow);
}
```

---

## 3. Komponen Khas iOS (Mobile Wali Murid)

### 3.1 Stacked Wallet Cards (Kartu Multi-Anak Wali)
- Jika Wali Murid memiliki >1 anak, kartu ditampilkan menumpuk (*stacked*).
- Menampilkan nama anak, kelas, NISN, serta ringkasan sisa tagihan aktif.
- Interaksi ketuk/swipe untuk berpindah antar anak.

### 3.2 iOS Bottom Sheet (`BottomSheet`)
- Modal yang muncul meluncur halus dari bawah layar dengan efek spring animation.
- Memiliki indikator garis penarik (*drag handle*) di bagian atas sheet.
- Digunakan untuk detail tagihan dan form upload bukti transfer.

### 3.3 Status Badges (iOS Style)
- Kapsul pembungkus bertuliskan status (`Lunas`, `Menunggu Approval`, `Ditolak`) dengan efek latar *semi-transparent glow*.

---

## 4. Tipografi & Ikonografi
- **Font**: Inter / SF Pro Display / System UI (`font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Icons**: Lucide Icons (`lucide-react`) untuk konsistensi bentuk garis minimalis.
