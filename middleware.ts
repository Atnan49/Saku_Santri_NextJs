// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Security Middleware)
// Deskripsi: Middleware NextAuth untuk melakukan proteksi rute halaman
//            berbasis peran (Role-Based Access Control) secara fungsional.
//            Atnan bertanggung jawab menguji dan menyesuaikan alur akses ini.
// =========================================================================

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Proteksi Rute Admin
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=UnauthorizedAdmin", req.url));
    }
    
    // Proteksi Rute Bendahara
    if (path.startsWith("/bendahara") && token?.role !== "BENDAHARA") {
      return NextResponse.redirect(new URL("/login?error=UnauthorizedBendahara", req.url));
    }
    
    // Proteksi Rute Wali Murid
    if (path.startsWith("/wali") && token?.role !== "WALIMURID") {
      return NextResponse.redirect(new URL("/login?error=UnauthorizedWali", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Mengizinkan middleware berjalan hanya jika user terautentikasi
    },
  }
);

// Rute yang diawasi oleh middleware
export const config = {
  matcher: [
    "/admin/:path*",
    "/bendahara/:path*",
    "/wali/:path*",
  ],
};
