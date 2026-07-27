// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Type augmentation untuk NextAuth agar TypeScript mengenali
//            properti kustom (role, id, waliId) pada objek Session dan JWT.
//            Ini diperlukan agar middleware dan seluruh Server/Client Components
//            dapat mengakses informasi role pengguna secara type-safe.
// =========================================================================

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name: string;
      waliId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    waliId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    waliId?: string;
  }
}
