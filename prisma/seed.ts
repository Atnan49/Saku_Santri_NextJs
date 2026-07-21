// =========================================================================
// TANGGUNG JAWAB: Yafi (Database & Initial Data Seeding)
// Deskripsi: Script ini digunakan untuk melakukan seeding (mengisi data awal)
//            pada database. Yafi bertanggung jawab untuk menulis logika yang:
//            1. Membuat akun Admin & Bendahara default untuk login pertama kali.
//            2. Membuat data Kelas (misal: 7A, 7B, 8A).
//            3. Membuat data Tahun Ajaran aktif (misal: 2025/2026).
//            4. Membuat contoh data Siswa, Wali Murid, dan Jenis Tagihan.
// Cara menjalankan: npx prisma db seed
// =========================================================================

import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt"; // Atnan/Yafi akan menggunakan bcrypt untuk hashing password

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai seeding data...");

  // TODO (Yafi): Implementasikan seeding data default di sini.
  // Contoh:
  // const adminPassword = await bcrypt.hash("admin123", 10);
  // await prisma.user.upsert({
  //   where: { username: "admin" },
  //   update: {},
  //   create: {
  //     username: "admin",
  //     name: "Admin Tata Usaha",
  //     passwordHash: adminPassword,
  //     role: "ADMIN",
  //   }
  // });

  console.log("Seeding data selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
