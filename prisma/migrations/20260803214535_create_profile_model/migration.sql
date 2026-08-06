-- AlterTable
ALTER TABLE "public"."Profile" ADD COLUMN     "portfolioUrl" TEXT,
ALTER COLUMN "skills" SET DEFAULT ARRAY[]::TEXT[];
