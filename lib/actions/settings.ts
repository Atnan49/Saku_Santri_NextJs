// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Server Actions untuk kelola Pengaturan Institusi (Rekening Bank,
//            Nama Pesantren/Yayasan, dll) secara dinamis oleh Admin.
// =========================================================================

"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak. Hanya ADMIN yang dapat mengelola pengaturan.");
  }
  return session;
}

export async function getInstitutionSettings() {
  const settings = await (prisma as any).institutionSettings.findMany();
  
  // Convert list to Object Key-Value
  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }

  // Default Fallbacks
  return {
    INSTITUTION_NAME: settingsMap["INSTITUTION_NAME"] || "Pesantren Digital Saku Santri",
    BANK_NAME_1: settingsMap["BANK_NAME_1"] || "BANK SYARIAH INDONESIA (BSI)",
    BANK_ACC_1: settingsMap["BANK_ACC_1"] || "7182 9910 22",
    BANK_HOLDER_1: settingsMap["BANK_HOLDER_1"] || "a.n. Yayasan Pendidikan Digital",
    BANK_NAME_2: settingsMap["BANK_NAME_2"] || "BANK MANDIRI",
    BANK_ACC_2: settingsMap["BANK_ACC_2"] || "131 00 2938 1192",
    BANK_HOLDER_2: settingsMap["BANK_HOLDER_2"] || "a.n. Yayasan Pendidikan Digital",
    PAYMENT_NOTE: settingsMap["PAYMENT_NOTE"] || "Pastikan nominal transfer tepat sesuai tagihan untuk mempercepat proses verifikasi admin.",
  };
}

export async function updateInstitutionSettings(data: Record<string, string>) {
  await requireAdmin();

  const upsertPromises = Object.entries(data).map(([key, value]) =>
    (prisma as any).institutionSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  );

  await Promise.all(upsertPromises);

  revalidatePath("/admin/pengaturan");
  revalidatePath("/wali/dashboard");

  return { success: true, message: "Pengaturan institusi & rekening bank berhasil disimpan." };
}
