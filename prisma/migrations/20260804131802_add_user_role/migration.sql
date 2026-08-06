-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('CANDIDATE', 'RECRUITER', 'ADMIN');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'CANDIDATE';
