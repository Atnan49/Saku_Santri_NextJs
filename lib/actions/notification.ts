// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Server Actions untuk operasi notifikasi in-app.
//            Digunakan untuk membuat notifikasi baru saat perubahan status
//            tagihan/pembayaran, dan mengambil/menandai notifikasi sebagai dibaca.
// =========================================================================

"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ========== READ ==========

export async function getNotifications() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Tidak terautentikasi.");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return notifications;
}

export async function getUnreadCount() {
  const session = await getServerSession(authOptions);
  if (!session) return 0;

  const count = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
    },
  });

  return count;
}

// ========== UPDATE ==========

export async function markAsRead(notifId: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Tidak terautentikasi.");
  }

  await prisma.notification.updateMany({
    where: {
      id: notifId,
      userId: session.user.id,
    },
    data: { isRead: true },
  });

  return { success: true };
}

export async function markAllAsRead() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Tidak terautentikasi.");
  }

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      isRead: false,
    },
    data: { isRead: true },
  });

  return { success: true };
}

// ========== CREATE (Helper internal — dipanggil oleh actions lain) ==========

export async function createNotification(
  userId: string,
  title: string,
  message: string
) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });

  return notification;
}

// Kirim notifikasi ke semua user dengan role tertentu
export async function notifyByRole(
  role: "ADMIN" | "BENDAHARA" | "WALIMURID",
  title: string,
  message: string
) {
  const users = await prisma.user.findMany({
    where: { role },
    select: { id: true },
  });

  if (users.length === 0) return;

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      title,
      message,
    })),
  });
}
