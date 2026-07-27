// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Server Actions untuk operasi CRUD data Kelas.
//            Digunakan di halaman Admin untuk mengelola kelas (7A, 8B, dll).
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

export async function getKelasList() {
  const kelasList = await prisma.kelas.findMany({
    include: {
      _count: { select: { siswa: true } },
    },
    orderBy: { name: "asc" },
  });

  return kelasList;
}

export async function createKelas(name: string) {
  await requireAdmin();

  if (!name || name.trim().length === 0) {
    throw new Error("Nama kelas tidak boleh kosong.");
  }

  const existing = await prisma.kelas.findUnique({
    where: { name: name.trim() },
  });
  if (existing) {
    throw new Error(`Kelas "${name.trim()}" sudah ada.`);
  }

  const kelas = await prisma.kelas.create({
    data: { name: name.trim() },
  });

  revalidatePath("/admin/santri");
  revalidatePath("/admin/pengaturan");
  return kelas;
}

export async function deleteKelas(id: string) {
  await requireAdmin();

  const siswaCount = await prisma.siswa.count({
    where: { kelasId: id },
  });

  if (siswaCount > 0) {
    throw new Error(
      `Tidak dapat menghapus kelas ini. Masih ada ${siswaCount} siswa terdaftar.`
    );
  }

  await prisma.kelas.delete({
    where: { id },
  });

  revalidatePath("/admin/santri");
  revalidatePath("/admin/pengaturan");
  return { success: true };
}
