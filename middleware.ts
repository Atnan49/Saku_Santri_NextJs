// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Security Middleware)
// Deskripsi: Middleware NextAuth untuk melakukan proteksi rute halaman
//            berbasis peran (Role-Based Access Control).
//            Atnan bertanggung jawab mengelola aturan akses di sini:
//            - Rute /admin/: hanya untuk role ADMIN
//            - Rute /bendahara/: hanya untuk role BENDAHARA
//            - Rute /wali/: hanya untuk role WALIMURID
// =========================================================================

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // TODO (Atnan): Sesuaikan aturan validasi token.role dengan path tujuan.
    /*
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (path.startsWith("/bendahara") && token?.role !== "BENDAHARA") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (path.startsWith("/wali") && token?.role !== "WALIMURID") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    */
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Memastikan user sudah login
    },
  }
);

// Tentukan rute mana saja yang akan diproteksi oleh middleware ini
export const config = {
  matcher: ["/admin/:path*", "/bendahara/:path*", "/wali/:path*"],
};
