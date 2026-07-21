// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Konfigurasi autentikasi menggunakan NextAuth.js.
//            Atnan bertanggung jawab untuk:
//            1. Mengatur AuthOptions dengan Credentials Provider.
//            2. Implementasi login ganda:
//               - Wali Murid menggunakan Nomor HP (phone) + Password.
//               - Admin/Bendahara menggunakan Username/Email + Password.
//            3. Memasukkan role user ke dalam JWT dan Session callback
//               agar bisa dibaca oleh middleware dan Client Component.
// =========================================================================

import { AuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { prisma } from "./prisma";
// import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
  // TODO (Atnan): Konfigurasi providers, callbacks, pages, dan session di sini.
  providers: [
    /*
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username / No HP", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Logika verifikasi credentials terhadap database prisma
        return null;
      }
    })
    */
  ],
  callbacks: {
    // Inject role dan id ke token/session
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
