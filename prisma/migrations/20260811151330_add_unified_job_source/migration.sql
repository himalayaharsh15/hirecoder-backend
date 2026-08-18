/*
  Warnings:

  - A unique constraint covering the columns `[source,sourceJobId]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."JobSource" AS ENUM ('HIRECODER', 'GREENHOUSE', 'ASHBY', 'ADZUNA');

-- DropForeignKey
ALTER TABLE "public"."Job" DROP CONSTRAINT "Job_companyId_fkey";

-- AlterTable
ALTER TABLE "public"."Job" ADD COLUMN     "applyUrl" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "recruiterId" TEXT,
ADD COLUMN     "source" "public"."JobSource" NOT NULL DEFAULT 'HIRECODER',
ADD COLUMN     "sourceJobId" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ALTER COLUMN "companyId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Job_source_idx" ON "public"."Job"("source");

-- CreateIndex
CREATE INDEX "Job_recruiterId_idx" ON "public"."Job"("recruiterId");

-- CreateIndex
CREATE INDEX "Job_companyId_idx" ON "public"."Job"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_source_sourceJobId_key" ON "public"."Job"("source", "sourceJobId");

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
