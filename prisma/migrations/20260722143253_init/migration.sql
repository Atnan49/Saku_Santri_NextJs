-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'WALIMURID', 'BENDAHARA');

-- CreateEnum
CREATE TYPE "TagihanType" AS ENUM ('BULANAN', 'TAHUNAN');

-- CreateEnum
CREATE TYPE "TagihanStatus" AS ENUM ('BELUM_BAYAR', 'MENUNGGU_VERIFIKASI_ADMIN', 'MENUNGGU_APPROVAL_BENDAHARA', 'LUNAS', 'DITOLAK_ADMIN', 'DITOLAK_BENDAHARA');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaliMurid" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "alamat" TEXT,

    CONSTRAINT "WaliMurid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kelas" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TahunAjaran" (
    "id" UUID NOT NULL,
    "year" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TahunAjaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Siswa" (
    "id" UUID NOT NULL,
    "nisn" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kelasId" UUID NOT NULL,
    "waliId" UUID NOT NULL,
    "potonganTetap" DECIMAL(65,30) NOT NULL DEFAULT 0.0,

    CONSTRAINT "Siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JenisTagihan" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TagihanType" NOT NULL,
    "nominal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "JenisTagihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tagihan" (
    "id" UUID NOT NULL,
    "siswaId" UUID NOT NULL,
    "jenisTagihanId" UUID NOT NULL,
    "tahunAjaranId" UUID NOT NULL,
    "nominalAwal" DECIMAL(65,30) NOT NULL,
    "potongan" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "nominalAkhir" DECIMAL(65,30) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "period" TEXT NOT NULL,
    "status" "TagihanStatus" NOT NULL DEFAULT 'BELUM_BAYAR',
    "catatanTagihan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tagihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" UUID NOT NULL,
    "tagihanId" UUID NOT NULL,
    "buktiUrl" TEXT,
    "catatanWali" TEXT,
    "catatanAdmin" TEXT,
    "catatanBendahara" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "WaliMurid_userId_key" ON "WaliMurid"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Kelas_name_key" ON "Kelas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TahunAjaran_year_key" ON "TahunAjaran"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Siswa_nisn_key" ON "Siswa"("nisn");

-- CreateIndex
CREATE UNIQUE INDEX "Pembayaran_tagihanId_key" ON "Pembayaran"("tagihanId");

-- AddForeignKey
ALTER TABLE "WaliMurid" ADD CONSTRAINT "WaliMurid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_waliId_fkey" FOREIGN KEY ("waliId") REFERENCES "WaliMurid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tagihan" ADD CONSTRAINT "Tagihan_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tagihan" ADD CONSTRAINT "Tagihan_jenisTagihanId_fkey" FOREIGN KEY ("jenisTagihanId") REFERENCES "JenisTagihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tagihan" ADD CONSTRAINT "Tagihan_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "TahunAjaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_tagihanId_fkey" FOREIGN KEY ("tagihanId") REFERENCES "Tagihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
