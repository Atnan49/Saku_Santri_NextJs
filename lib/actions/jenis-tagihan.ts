// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Server Actions untuk operasi CRUD data Jenis Tagihan.
//            Mengelola jenis-jenis tagihan seperti SPP Bulanan, Uang Gedung,
//            Seragam, dan jenis tagihan custom lainnya.
// =========================================================================

"use server";

import { prisma } from "@/lib/prisma";
import { TagihanType } from "@prisma/client";
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

export async function getJenisTagihanList() {
  const jenisList = await prisma.jenisTagihan.findMany({
    include: {
      _count: { select: { tagihan: true } },
    },
    orderBy: { name: "asc" },
  });

  return jenisList;
}

export async function createJenisTagihan(data: {
  name: string;
  type: TagihanType;
  nominal: number;
}) {
  await requireAdmin();

  if (!data.name || data.name.trim().length === 0) {
    throw new Error("Nama jenis tagihan tidak boleh kosong.");
  }

  if (data.nominal <= 0) {
    throw new Error("Nominal tagihan harus lebih dari 0.");
  }

  const existing = await prisma.jenisTagihan.findUnique({
    where: { name: data.name.trim() },
  });
  if (existing) {
    throw new Error(`Jenis tagihan "${data.name.trim()}" sudah ada.`);
  }

  const jenis = await prisma.jenisTagihan.create({
    data: {
      name: data.name.trim(),
      type: data.type,
      nominal: data.nominal,
    },
  });

  revalidatePath("/admin/pengaturan");
  revalidatePath("/admin/tagihan");
  return jenis;
}

export async function updateJenisTagihan(
  id: string,
  data: {
    name?: string;
    type?: TagihanType;
    nominal?: number;
  }
) {
  await requireAdmin();

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.type !== undefined) updateData.type = data.type;
  if (data.nominal !== undefined) {
    if (data.nominal <= 0) {
      throw new Error("Nominal tagihan harus lebih dari 0.");
    }
    updateData.nominal = data.nominal;
  }

  const jenis = await prisma.jenisTagihan.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/pengaturan");
  revalidatePath("/admin/tagihan");
  return jenis;
}

export async function deleteJenisTagihan(id: string) {
  await requireAdmin();

  const tagihanCount = await prisma.tagihan.count({
    where: { jenisTagihanId: id },
  });

  if (tagihanCount > 0) {
    throw new Error(
      `Tidak dapat menghapus jenis tagihan ini. Masih ada ${tagihanCount} tagihan terkait.`
    );
  }

  await prisma.jenisTagihan.delete({
    where: { id },
  });

  revalidatePath("/admin/pengaturan");
  return { success: true };
}
