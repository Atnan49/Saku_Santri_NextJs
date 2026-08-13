// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Security)
// Deskripsi: Shared helper untuk verifikasi autentikasi dan peran (Role-Based)
//            pada Server Actions dan API Routes.
// =========================================================================

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type Role = "ADMIN" | "BENDAHARA" | "WALIMURID" | "KOPERASI";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Akses ditolak. Silakan login terlebih dahulu.");
  }
  return session;
}

export async function requireRole(...allowedRoles: Role[]) {
  const session = await requireSession();
  const userRole = session.user.role as Role;

  if (!allowedRoles.includes(userRole)) {
    throw new Error(
      `Akses ditolak. Fitur ini memerlukan hak akses [${allowedRoles.join(", ")}].`
    );
  }

  return session;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}
