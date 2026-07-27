// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Server Actions untuk operasi CRUD data Tahun Ajaran.
//            Aturan bisnis utama: hanya boleh ada 1 tahun ajaran aktif
//            dalam satu waktu.
// =========================================================================

"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak. Hanya ADMIN yang dapat melakukan operasi ini.");
  }
  return session;
}

export async function getTahunAjaranList() {
  const tahunAjaranList = await prisma.tahunAjaran.findMany({
    include: {
      _count: { select: { tagihan: true } },
    },
    orderBy: { year: "desc" },
  });

  return tahunAjaranList;
}

export async function getActiveTahunAjaran() {
  const active = await prisma.tahunAjaran.findFirst({
    where: { isActive: true },
  });

  return active;
}

export async function createTahunAjaran(year: string) {
  await requireAdmin();

  if (!year || year.trim().length === 0) {
    throw new Error("Tahun ajaran tidak boleh kosong.");
  }

  // Validasi format tahun ajaran (misal: "2025/2026")
  const yearPattern = /^\d{4}\/\d{4}$/;
  if (!yearPattern.test(year.trim())) {
    throw new Error('Format tahun ajaran harus "YYYY/YYYY" (contoh: "2025/2026").');
  }

  const existing = await prisma.tahunAjaran.findUnique({
    where: { year: year.trim() },
  });
  if (existing) {
    throw new Error(`Tahun ajaran "${year.trim()}" sudah ada.`);
  }

  const tahunAjaran = await prisma.tahunAjaran.create({
    data: { year: year.trim(), isActive: false },
  });

  revalidatePath("/admin/pengaturan");
  return tahunAjaran;
}

export async function setActiveTahunAjaran(id: string) {
  await requireAdmin();

  // Nonaktifkan semua tahun ajaran terlebih dahulu
  await prisma.tahunAjaran.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  // Aktifkan tahun ajaran yang dipilih
  const tahunAjaran = await prisma.tahunAjaran.update({
    where: { id },
    data: { isActive: true },
  });

  revalidatePath("/admin/pengaturan");
  revalidatePath("/admin/tagihan");
  return tahunAjaran;
}

export async function deleteTahunAjaran(id: string) {
  await requireAdmin();

  const tagihanCount = await prisma.tagihan.count({
    where: { tahunAjaranId: id },
  });

  if (tagihanCount > 0) {
    throw new Error(
      `Tidak dapat menghapus tahun ajaran ini. Masih ada ${tagihanCount} tagihan terkait.`
    );
  }

  await prisma.tahunAjaran.delete({
    where: { id },
  });

  revalidatePath("/admin/pengaturan");
  return { success: true };
}
