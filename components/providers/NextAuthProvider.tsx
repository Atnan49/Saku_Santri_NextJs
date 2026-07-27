// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Client Component wrapper untuk NextAuth SessionProvider.
//            Diperlukan karena SessionProvider menggunakan React Context
//            yang hanya berjalan di sisi client ("use client").
//            Dibungkus di app/layout.tsx agar state autentikasi tersedia
//            di seluruh halaman Client Component (useSession, signIn, signOut).
// =========================================================================

"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
