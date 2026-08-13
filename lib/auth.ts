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
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  console.warn("PERINGATAN SANGAT KRITIS: NEXTAUTH_SECRET belum dikonfigurasi di file .env!");
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username / No HP", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan password wajib diisi.");
        }

        const identifier = credentials.username.trim();
        const password = credentials.password;

        // Deteksi apakah input berupa nomor HP (awalan 0 atau +62)
        const isPhoneNumber = /^(\+62|62|0)\d{8,13}$/.test(identifier);

        let user;

        if (isPhoneNumber) {
          // Normalisasi nomor HP: konversi awalan 0 ke +62
          let normalizedPhone = identifier;
          if (normalizedPhone.startsWith("0")) {
            normalizedPhone = "+62" + normalizedPhone.slice(1);
          } else if (normalizedPhone.startsWith("62")) {
            normalizedPhone = "+" + normalizedPhone;
          }

          // Login Wali Murid via Nomor HP
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { phone: identifier },
                { phone: normalizedPhone },
                // Juga cek format tanpa +62 (simpan fleksibilitas)
                { phone: normalizedPhone.replace("+62", "0") },
              ],
              role: "WALIMURID",
            },
            include: {
              wali: { select: { id: true } },
            },
          });
        } else {
          // Login Admin / Bendahara via Username atau Email
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { username: identifier },
                { email: identifier },
              ],
              role: { in: ["ADMIN", "BENDAHARA", "KOPERASI"] },
            },
          });
        }

        if (!user) {
          throw new Error("Akun tidak ditemukan. Periksa kembali data login Anda.");
        }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Password salah. Silakan coba lagi.");
        }

        // Return user object yang akan dikirim ke JWT callback
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          waliId: (user as any).wali?.id || undefined,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Saat login pertama, inject data user ke token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.waliId = user.waliId;
      }
      return token;
    },

    async session({ session, token }) {
      // Forward data token ke session agar tersedia di client
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.waliId = token.waliId;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 jam
  },

  secret: process.env.NEXTAUTH_SECRET,
};

