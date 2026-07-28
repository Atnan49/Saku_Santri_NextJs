// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Server Actions untuk manajemen User (Admin, Bendahara, Wali Murid).
//            Digunakan di halaman Pengaturan Admin untuk membuat user baru
//            dan di fitur registrasi wali murid beserta profil WaliMurid-nya.
// =========================================================================

"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak. Hanya ADMIN yang dapat melakukan operasi ini.");
  }
  return session;
}

export async function getUserList() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
}

export async function getWaliMuridList() {
  const waliList = await prisma.waliMurid.findMany({
    include: {
      user: {
        select: { id: true, name: true, phone: true, email: true },
      },
      _count: { select: { siswa: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return waliList;
}

// Buat user Admin atau Bendahara
export async function createStaffUser(data: {
  username: string;
  email?: string;
  name: string;
  password: string;
  role: "ADMIN" | "BENDAHARA";
}) {
  await requireAdmin();

  if (!data.username || data.username.trim().length === 0) {
    throw new Error("Username tidak boleh kosong.");
  }
  if (!data.password || data.password.length < 6) {
    throw new Error("Password minimal 6 karakter.");
  }

  const existing = await prisma.user.findUnique({
    where: { username: data.username.trim() },
  });
  if (existing) {
    throw new Error(`Username "${data.username.trim()}" sudah digunakan.`);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      username: data.username.trim(),
      email: data.email?.trim() || null,
      name: data.name.trim(),
      passwordHash,
      role: data.role,
    },
  });

  revalidatePath("/admin/pengaturan");
  return { id: user.id, name: user.name, role: user.role };
}

// Buat user Wali Murid beserta profil WaliMurid-nya
export async function createWaliMuridUser(data: {
  phone: string;
  name: string;
  password: string;
  alamat?: string;
}) {
  await requireAdmin();

  if (!data.phone || data.phone.trim().length === 0) {
    throw new Error("Nomor HP tidak boleh kosong.");
  }
  if (!data.password || data.password.length < 6) {
    throw new Error("Password minimal 6 karakter.");
  }

  // Cek apakah nomor HP sudah terdaftar
  const existingPhone = await prisma.user.findFirst({
    where: { phone: data.phone.trim() },
  });
  if (existingPhone) {
    throw new Error(`Nomor HP "${data.phone.trim()}" sudah terdaftar.`);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  // Gunakan nomor HP sebagai username untuk wali murid
  const username = `wali_${data.phone.trim().replace(/[^0-9]/g, "")}`;

  const user = await prisma.user.create({
    data: {
      username,
      phone: data.phone.trim(),
      name: data.name.trim(),
      passwordHash,
      role: "WALIMURID",
      wali: {
        create: {
          alamat: data.alamat?.trim() || null,
        },
      },
    },
    include: {
      wali: true,
    },
  });

  revalidatePath("/admin/santri");
  revalidatePath("/admin/pengaturan");
  return { id: user.id, name: user.name, waliId: user.wali?.id };
}

// Update password user
export async function updateUserPassword(userId: string, newPassword: string) {
  await requireAdmin();

  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password baru minimal 6 karakter.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { success: true };
}

// Hapus user (hanya jika tidak memiliki data terkait yang kritis)
export async function deleteUser(userId: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wali: {
        include: {
          _count: { select: { siswa: true } },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User tidak ditemukan.");
  }

  // Jangan izinkan menghapus diri sendiri
  const session = await getServerSession(authOptions);
  if (session?.user.id === userId) {
    throw new Error("Tidak dapat menghapus akun Anda sendiri.");
  }

  // Jika user adalah wali murid yang masih memiliki siswa terkait
  if (user.wali && user.wali._count.siswa > 0) {
    throw new Error(
      `Tidak dapat menghapus user ini. Masih ada ${user.wali._count.siswa} siswa yang terhubung sebagai anak wali.`
    );
  }

  // Hapus notifikasi terkait
  await prisma.notification.deleteMany({ where: { userId } });

  // Hapus riwayat transaksi koperasi yang dilakukan kasir ini jika ada
  await prisma.transaksiKoperasi.deleteMany({ where: { kasirId: userId } });

  // Hapus profil wali jika ada
  if (user.wali) {
    await prisma.waliMurid.delete({ where: { userId } });
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/pengaturan");
  return { success: true };
}
