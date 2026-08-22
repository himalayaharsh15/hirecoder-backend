-- CreateEnum
CREATE TYPE "public"."JobCategory" AS ENUM ('TECHNOLOGY', 'DATA', 'SALES', 'MARKETING', 'FINANCE', 'HUMAN_RESOURCES', 'DESIGN', 'OPERATIONS', 'CUSTOMER_SUPPORT', 'OTHER');

-- AlterTable
ALTER TABLE "public"."Job" ADD COLUMN     "category" "public"."JobCategory" NOT NULL DEFAULT 'OTHER';

-- CreateIndex
CREATE INDEX "Job_category_idx" ON "public"."Job"("category");
