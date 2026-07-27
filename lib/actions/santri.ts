// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Server Actions untuk operasi CRUD data Santri (Siswa).
//            Digunakan oleh halaman Admin Santri untuk menambah, mengubah,
//            menghapus, dan mengambil daftar siswa beserta relasi kelas & wali.
// =========================================================================

"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Helper: Pastikan user adalah ADMIN
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak. Hanya ADMIN yang dapat melakukan operasi ini.");
  }
  return session;
}

// ========== READ ==========

export async function getSantriList() {
  const santriList = await prisma.siswa.findMany({
    include: {
      kelas: { select: { id: true, name: true } },
      wali: {
        select: {
          id: true,
          alamat: true,
          user: { select: { id: true, name: true, phone: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return santriList;
}

export async function getSantriById(id: string) {
  const santri = await prisma.siswa.findUnique({
    where: { id },
    include: {
      kelas: true,
      wali: {
        include: {
          user: { select: { name: true, phone: true } },
        },
      },
      tagihan: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { jenisTagihan: true },
      },
    },
  });

  return santri;
}

// ========== CREATE ==========

export async function createSantri(data: {
  nisn?: string;
  name: string;
  kelasId: string;
  waliId: string;
  potonganTetap?: number;
}) {
  await requireAdmin();

  let finalNisn = data.nisn?.trim();
  if (!finalNisn) {
    const year = new Date().getFullYear();
    const count = await prisma.siswa.count();
    finalNisn = `SNT-${year}-${String(count + 1).padStart(4, "0")}`;
  }

  // Validasi NISN unik
  const existing = await prisma.siswa.findUnique({
    where: { nisn: finalNisn },
  });
  if (existing) {
    // Jika bentrok, tambahkan timestamp acak
    finalNisn = `SNT-${Date.now().toString().slice(-6)}`;
  }

  const santri = await prisma.siswa.create({
    data: {
      nisn: finalNisn,
      name: data.name,
      kelasId: data.kelasId,
      waliId: data.waliId,
      potonganTetap: data.potonganTetap || 0,
    },
  });

  revalidatePath("/admin/santri");
  return santri;
}

// ========== UPDATE ==========

export async function updateSantri(
  id: string,
  data: {
    name?: string;
    kelasId?: string;
    waliId?: string;
    potonganTetap?: number;
  }
) {
  await requireAdmin();

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.kelasId !== undefined) updateData.kelasId = data.kelasId;
  if (data.waliId !== undefined) updateData.waliId = data.waliId;
  if (data.potonganTetap !== undefined) {
    updateData.potonganTetap = data.potonganTetap;
  }

  const santri = await prisma.siswa.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/santri");
  return santri;
}

// ========== DELETE ==========

export async function deleteSantri(id: string) {
  await requireAdmin();

  // Cek apakah ada tagihan aktif (belum lunas) yang terkait
  const activeTagihan = await prisma.tagihan.count({
    where: {
      siswaId: id,
      status: { notIn: ["LUNAS"] },
    },
  });

  if (activeTagihan > 0) {
    throw new Error(
      `Tidak dapat menghapus siswa ini. Masih ada ${activeTagihan} tagihan aktif/belum lunas.`
    );
  }

  // Hapus semua tagihan LUNAS terkait terlebih dahulu
  await prisma.tagihan.deleteMany({
    where: { siswaId: id },
  });

  await prisma.siswa.delete({
    where: { id },
  });

  revalidatePath("/admin/santri");
  return { success: true };
}
