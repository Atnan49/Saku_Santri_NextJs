/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `JenisTagihan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "JenisTagihan_name_key" ON "JenisTagihan"("name");
