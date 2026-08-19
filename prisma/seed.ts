// =========================================================================
// TANGGUNG JAWAB: Yafi (Database) & Atnan (Backend)
// Deskripsi: Script reset database yang membersihkan seluruh riwayat transaksi,
//            tagihan, pembayaran, dan notifikasi, namun tetap mempertahankan
//            data akun User, Wali Murid, Siswa, Kelas, dan Jenis Tagihan.
// Cara menjalankan: npx prisma db seed
// =========================================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai pembersihan data transaksi & tagihan...");

  // 1. Hapus data transaksi & pembayaran
  const delPembayaran = await prisma.pembayaran.deleteMany({});
  const delTopup = await prisma.topupSaku.deleteMany({});
  const delTransaksiKoperasi = await prisma.transaksiKoperasi.deleteMany({});
  const delTagihan = await prisma.tagihan.deleteMany({});
  const delNotif = await prisma.notification.deleteMany({});
  const delJenisTagihan = await prisma.jenisTagihan.deleteMany({});

  console.log(`- Terhapus ${delPembayaran.count} data pembayaran`);
  console.log(`- Terhapus ${delTopup.count} data topup saku`);
  console.log(`- Terhapus ${delTransaksiKoperasi.count} data transaksi koperasi`);
  console.log(`- Terhapus ${delTagihan.count} data tagihan`);
  console.log(`- Terhapus ${delNotif.count} notifikasi`);

  // 2. Reset saldo saku seluruh siswa ke modal awal untuk E2E test
  await prisma.siswa.updateMany({
    data: {
      saldoSaku: 100000,
    },
  });
  console.log("- Saldo saku seluruh santri berhasil di-reset ke Rp 100.000");

  // 3. Pastikan Akun Inti (Admin & Bendahara) Selalu Tersedia
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

  const koperasiPassword = await bcrypt.hash("koperasi123", 10);
  const koperasi = await prisma.user.upsert({
    where: { username: "koperasi" },
    update: {
      name: "Kasir Koperasi Mart",
      passwordHash: koperasiPassword,
      role: "KOPERASI",
    },
    create: {
      username: "koperasi",
      email: "koperasi@sakusantri.local",
      passwordHash: koperasiPassword,
      name: "Kasir Koperasi Mart",
      role: "KOPERASI",
    },
  });

  const totalUsers = await prisma.user.count();
  const totalSiswa = await prisma.siswa.count();

  console.log("---------------------------------------------------------");
  console.log(`Akun Admin     : ${admin.username} (Password: admin123)`);
  console.log(`Akun Bendahara : ${bendahara.username} (Password: bendahara123)`);
  console.log(`Akun Koperasi  : ${koperasi.username} (Password: koperasi123)`);
  console.log(`Total Akun Tersedia : ${totalUsers} User (Dipertahankan)`);
  console.log(`Total Data Santri   : ${totalSiswa} Santri (Dipertahankan)`);
  console.log("---------------------------------------------------------");
  console.log("Reset database selesai! Transaksi bersih & Akun tetap aman.");
}

main()
  .catch((e) => {
    console.error("Gagal melakukan reset database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
