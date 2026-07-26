// =========================================================================
// TANGGUNG JAWAB: Yafi (Database & Initial Data Seeding)
// Deskripsi: Script ini mengisi database Neon/PostgreSQL dengan data awal
//            untuk akun default, kelas, tahun ajaran, jenis tagihan, wali,
//            siswa, dan contoh tagihan.
// Cara menjalankan: npx prisma db seed
// =========================================================================

import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai seeding data...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const bendaharaPassword = await bcrypt.hash("bendahara123", 10);
  const waliPassword = await bcrypt.hash("wali123", 10);

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

  const waliUser = await prisma.user.upsert({
    where: { username: "wali001" },
    update: {
      name: "Wali Murid 001",
      passwordHash: waliPassword,
      role: "WALIMURID",
    },
    create: {
      username: "wali001",
      email: "wali001@sakusantri.local",
      phone: "081234567890",
      passwordHash: waliPassword,
      name: "Wali Murid 001",
      role: "WALIMURID",
    },
  });

  const wali = await prisma.waliMurid.upsert({
    where: { userId: waliUser.id },
    update: {
      alamat: "Jl. Kenanga No. 12, Kota Santri",
    },
    create: {
      userId: waliUser.id,
      alamat: "Jl. Kenanga No. 12, Kota Santri",
    },
  });

  const kelas7A = await prisma.kelas.upsert({
    where: { name: "7A" },
    update: {},
    create: { name: "7A" },
  });

  const kelas7B = await prisma.kelas.upsert({
    where: { name: "7B" },
    update: {},
    create: { name: "7B" },
  });

  const tahunAjaran = await prisma.tahunAjaran.upsert({
    where: { year: "2025/2026" },
    update: { isActive: true },
    create: { year: "2025/2026", isActive: true },
  });

  const jenisSPP = await prisma.jenisTagihan.upsert({
    where: { name: "SPP Bulanan" },
    update: {
      nominal: new Prisma.Decimal("250000"),
      type: "BULANAN",
    },
    create: {
      name: "SPP Bulanan",
      type: "BULANAN",
      nominal: new Prisma.Decimal("250000"),
    },
  });

  const jenisGedung = await prisma.jenisTagihan.upsert({
    where: { name: "Uang Gedung" },
    update: {
      nominal: new Prisma.Decimal("1000000"),
      type: "TAHUNAN",
    },
    create: {
      name: "Uang Gedung",
      type: "TAHUNAN",
      nominal: new Prisma.Decimal("1000000"),
    },
  });

  const siswa = await prisma.siswa.upsert({
    where: { nisn: "1234567890" },
    update: {
      name: "Ahmad Santri",
      kelasId: kelas7A.id,
      waliId: wali.id,
      potonganTetap: new Prisma.Decimal("150000"),
    },
    create: {
      nisn: "1234567890",
      name: "Ahmad Santri",
      kelasId: kelas7A.id,
      waliId: wali.id,
      potonganTetap: new Prisma.Decimal("150000"),
    },
  });

  await prisma.tagihan.upsert({
    where: { id: "00000000-0000-0000-0000-000000000010" },
    update: {
      siswaId: siswa.id,
      jenisTagihanId: jenisSPP.id,
      tahunAjaranId: tahunAjaran.id,
      nominalAwal: new Prisma.Decimal("250000"),
      potongan: new Prisma.Decimal("150000"),
      nominalAkhir: new Prisma.Decimal("100000"),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      period: "2025-09",
      status: "BELUM_BAYAR",
      catatanTagihan: "Tagihan SPP bulanan untuk September 2025.",
    },
    create: {
      id: "00000000-0000-0000-0000-000000000010",
      siswaId: siswa.id,
      jenisTagihanId: jenisSPP.id,
      tahunAjaranId: tahunAjaran.id,
      nominalAwal: new Prisma.Decimal("250000"),
      potongan: new Prisma.Decimal("150000"),
      nominalAkhir: new Prisma.Decimal("100000"),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      period: "2025-09",
      status: "BELUM_BAYAR",
      catatanTagihan: "Tagihan SPP bulanan untuk September 2025.",
    },
  });

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
