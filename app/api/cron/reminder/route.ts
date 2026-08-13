// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: API Cron Job untuk mengirim pengingat tagihan otomatis (1x/hari).
//            Memeriksa tagihan mendekati jatuh tempo (<= 3 hari) & tunggakan.
// =========================================================================

export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { createNotification } from "@/lib/actions/notification";
import { formatIDR } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    // Verify CRON_SECRET mandatory authorization
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized cron trigger." }, { status: 401 });
    }

    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Cari tagihan yang BELUM BAYAR atau DIBAYAR_SEBAGIAN dengan due date <= 3 hari ke depan
    const upcomingBills: any[] = await (prisma as any).tagihan.findMany({
      where: {
        status: { in: ["BELUM_BAYAR", "DIBAYAR_SEBAGIAN"] },
        dueDate: {
          lte: threeDaysFromNow,
        },
      },
      include: {
        siswa: {
          include: {
            wali: {
              include: {
                user: { select: { id: true, phone: true, name: true } },
              },
            },
            kelas: { select: { name: true } },
          },
        },
        jenisTagihan: { select: { name: true } },
      },
    });

    let sentCount = 0;

    for (const bill of upcomingBills) {
      const siswa = bill.siswa;
      const waliPhone = siswa.wali.user.phone;
      const waliUserId = siswa.wali.user.id;
      const sisaTagihan = Number(bill.nominalAkhir) - Number(bill.nominalTerbayar);
      const sisaFormat = formatIDR(sisaTagihan);

      const dueDateStr = new Date(bill.dueDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const message = `🔔 PENGINGAT TAGIHAN PESANTREN\n\nAssalamu'alaikum Wr. Wb.\n\nTagihan ${bill.jenisTagihan.name} untuk santri ${siswa.name} (${siswa.kelas.name}) sebesar ${sisaFormat} mendekati/telah melewati tanggal jatuh tempo (${dueDateStr}).\n\nMohon untuk segera melakukan pembayaran melalui transfer bank dan unggah bukti transfer di aplikasi Saku Santri.\n\nTerima kasih. 🙏`;

      // In-app notification
      createNotification(
        waliUserId,
        `🔔 Pengingat Tagihan: ${bill.jenisTagihan.name}`,
        `Tagihan ${bill.jenisTagihan.name} untuk ${siswa.name} (${sisaFormat}) jatuh tempo pada ${dueDateStr}.`
      ).catch(() => {});

      // WhatsApp
      if (waliPhone) {
        try {
          await sendWhatsAppMessage({
            targetPhone: waliPhone,
            message,
          });
          sentCount++;
        } catch (err) {
          console.error(`Gagal kirim WA reminder ke ${waliPhone}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: upcomingBills.length,
      notificationsSent: sentCount,
    });
  } catch (error: any) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: error.message || "Cron job failed" }, { status: 500 });
  }
}
