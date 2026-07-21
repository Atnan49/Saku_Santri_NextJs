// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Singleton instance untuk Prisma Client. Menghindari kebocoran
//            koneksi database saat reload di lingkungan development (Next.js hot reload).
//            Atnan bertanggung jawab mengimpor client ini di Server Actions
//            maupun API Routes untuk mengakses database yang dirancang Yafi.
// =========================================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
