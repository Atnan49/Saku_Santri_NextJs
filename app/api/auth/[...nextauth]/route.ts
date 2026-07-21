// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Route handler NextAuth untuk menangani request signin, signout,
//            dan session checks di Next.js App Router.
//            Atnan bertanggung jawab menghubungkan file ini dengan konfigurasi
//            authOptions yang ada di `lib/auth.ts`.
// =========================================================================

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
