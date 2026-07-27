// =========================================================================
// TANGGUNG JAWAB: Yafi (Database) & Atnan (Backend)
// Deskripsi: Script pembersihan data dummy dan pembuatan akun inti saja.
//            Hanya menyisakan akun Admin dan Bendahara untuk pengujian dari nol.
// Cara menjalankan: npx prisma db seed
// =========================================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai pembersihan data dummy (Reset dari nol)...");

  // 1. Hapus semua data transaksi & data anak/wali
  await prisma.pembayaran.deleteMany({});
  await prisma.topupSaku.deleteMany({});
  await prisma.transaksiKoperasi.deleteMany({});
  await prisma.tagihan.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.siswa.deleteMany({});
  await prisma.waliMurid.deleteMany({});
  await prisma.jenisTagihan.deleteMany({});
  await prisma.kelas.deleteMany({});
  await prisma.tahunAjaran.deleteMany({});

  // 2. Hapus semua akun user ber-role WALIMURID atau KOPERASI
  await prisma.user.deleteMany({
    where: {
      role: { in: ["WALIMURID", "KOPERASI"] },
    },
  });

  console.log("Semua data dummy berhasil dibersihkan!");

  // 3. Buat/Update Akun Inti: Admin & Bendahara
  const adminPassword = await bcrypt.hash("admin123", 10);
  const bendaharaPassword = await bcrypt.hash("bendahara123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      name: "Admin Tata Usaha",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
    create: {
      username: "admin",
      email: "admin@sakusantri.local",
      passwordHash: adminPassword,
      name: "Admin Tata Usaha",
      role: "ADMIN",
    },
  });

  const bendahara = await prisma.user.upsert({
    where: { username: "bendahara" },
    update: {
      name: "Bendahara Pesantren",
      passwordHash: bendaharaPassword,
      role: "BENDAHARA",
    },
    create: {
      username: "bendahara",
      email: "bendahara@sakusantri.local",
      passwordHash: bendaharaPassword,
      name: "Bendahara Pesantren",
      role: "BENDAHARA",
    },
  });

  console.log(`Akun Admin dibuat: ${admin.username} (Password: admin123)`);
  console.log(`Akun Bendahara dibuat: ${bendahara.username} (Password: bendahara123)`);
  console.log("Reset database selesai 100%! Aplikasi siap digunakan dari NOL.");
}

main()
  .catch((e) => {
    console.error("Gagal melakukan reset database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

