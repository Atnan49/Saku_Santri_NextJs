# Architecture & Code Patterns: Saku Santri

Dokumen arsitektur teknis ini dirancang untuk memberikan panduan struktur kode, alur data, API, dan pola pemrograman yang konsisten bagi pengembang & AI (*Vibe Coding*).

---

## 1. Struktur Direktori Proyek

```
Saku santri/
├── app/                        # Next.js App Router
│   ├── (auth)/
│   │   └── login/              # Halaman Login Universal (No HP / Username + Password)
│   ├── (dashboard)/
│   │   ├── admin/              # Modul Admin Tata Usaha
│   │   │   ├── dashboard/      # Ringkasan & Grafik Tren
│   │   │   ├── santri/         # Master Siswa, Kelas & Beasiswa
│   │   │   ├── tagihan/        # Generator Tagihan
│   │   │   ├── verifikasi/     # Approval Tahap 1
│   │   │   └── pengaturan/     # Tahun Ajaran & User Admin
│   │   ├── wali/               # Modul Wali Murid (iOS Mobile View)
│   │   │   ├── dashboard/      # Multi-Anak Wallet View
│   │   │   └── tagihan/[id]/   # Upload Bukti Pembayaran
│   │   └── bendahara/          # Modul Bendahara / Kepsek
│   │       ├── dashboard/      # Rekap Keuangan Total & Tunggakan
│   │       ├── approval/       # Approval Tahap 2 (Final)
│   │       └── laporan/        # Ekspor Excel & PDF
│   ├── api/
│   │   ├── auth/[...nextauth]/ # Handler Autentikasi
│   │   ├── tagihan/            # Endpoints Generate & Update Tagihan
│   │   ├── pembayaran/         # Endpoints Verifikasi & Approval
│   │   ├── upload/             # Handler Upload Vercel Blob
│   │   └── whatsapp/           # Webhook / Trigger Notifikasi WA
│   ├── layout.tsx              # Root Layout dengan Font & Provider
│   └── page.tsx                # Redirector ke Login / Dashboard sesuai Sesi
├── components/
│   ├── ui/                     # Design System (MacWindowHeader, GlassCard, dll)
│   ├── admin/                  # Komponen Spesifik Admin
│   ├── wali/                   # Komponen Spesifik Wali Murid
│   └── bendahara/              # Komponen Spesifik Bendahara
├── lib/
│   ├── prisma.ts               # Prisma Client Instance (Singleton)
│   ├── auth.ts                 # NextAuth Options & Helpers
│   ├── whatsapp.ts             # Integrasi Fonnte / Wablas API
│   ├── blob.ts                 # Helper Vercel Blob Storage
│   └── utils.ts                # Helper Format Currency (IDR), Date, & Classes
├── prisma/
│   ├── schema.prisma           # Skema Basis Data PostgreSQL/SQLite
│   └── seed.ts                 # Script Seeding Data Awal (Admin, Kelas, Siswa)
└── public/                     # Asset Statis (Logo, Placeholder)
```

---

## 2. Pola Alur Data & State Management

### 2.1 Autentikasi & Authorization
- **Session Helper**: `getServerSession(authOptions)` pada Server Components / Server Actions.
- **Client Session Hook**: `useSession()` pada Client Components.
- **Middleware Proteksi**:
  - `/admin/*` $\rightarrow$ Hanya diperbolehkan untuk `role === 'ADMIN'`.
  - `/bendahara/*` $\rightarrow$ Hanya diperbolehkan untuk `role === 'BENDAHARA'`.
  - `/wali/*` $\rightarrow$ Hanya diperbolehkan untuk `role === 'WALIMURID'`.

### 2.2 Dual-Approval Payment State Machine
```
[ Tagihan Diterbitkan ]
          │
          ▼ (Wali Murid Upload Bukti Bayar)
[ Status: MENUNGGU_VERIFIKASI_ADMIN ]
     ├── (Admin Reject)     ──► [ Status: DITOLAK_ADMIN ] ──► (Wali Upload Re-submission)
     └── (Admin Accept)     ──► [ Status: MENUNGGU_APPROVAL_BENDAHARA ]
                                    ├── (Bendahara Reject) ──► [ Status: DITOLAK_BENDAHARA ]
                                    └── (Bendahara Approve)──► [ Status: LUNAS ] ──► (Kwitansi Active)
```

---

## 3. Integrasi WhatsApp (Fonnte / Wablas Helper)

Format payload panggilan modul `lib/whatsapp.ts`:
```typescript
export async function sendWhatsAppMessage({
  targetPhone,
  message,
}: {
  targetPhone: string;
  message: string;
}) {
  const token = process.env.WA_API_TOKEN;
  const providerUrl = process.env.WA_API_URL || "https://api.fonnte.com/send";

  const response = await fetch(providerUrl, {
    method: "POST",
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: targetPhone,
      message: message,
    }),
  });

  return response.json();
}
```

---

## 4. Konvensi Kode & Formatting
1. **Format Mata Uang**: Gunakan `formatIDR(nominal)` dari `lib/utils.ts` untuk menampilkan format `Rp 500.000`.
2. **Server Actions vs API Routes**: Gunakan Server Actions (`"use server"`) untuk mutasi data form sederhana (seperti verifikasi/approval) dan API Routes untuk integrasi file upload/cron.
3. **Handling Dates**: Gunakan format ISO string pada basis data dan format lokal Indonesia (misal: "20 Juli 2026") pada tampilan UI.
