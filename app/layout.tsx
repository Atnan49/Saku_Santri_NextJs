// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend/Design System) & Atnan (Backend/Logic)
// Deskripsi: Root Layout untuk aplikasi Saku Santri.
//            Mengatur global font (Inter / System UI), theme providers,
//            dan melampirkan SessionProvider untuk NextAuth.
//            - Usva: Mengimpor file CSS global (`index.css` atau `globals.css`)
//                    dan mendesain font serta background default halaman.
//                    Memastikan viewport responsive untuk mobile (Wali murid).
//            - Atnan: Membungkus children dengan `SessionProvider` agar state login
//                     tersedia secara global di sisi Client Components.
// =========================================================================

import React from "react";
import type { Metadata } from "next";
import "./globals.css"; // Usva akan mengelola styling global di file ini

export const metadata: Metadata = {
  title: "Saku Santri - Sistem Keuangan Pesantren",
  description: "Aplikasi Manajemen Keuangan & SPP Pesantren Bergaya macOS & iOS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        {/* 
          TODO (Atnan): Bungkus dengan SessionProvider agar autentikasi aktif.
          Contoh:
          <NextAuthProvider>
            {children}
          </NextAuthProvider>
        */}
        <div className="app-layout-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
