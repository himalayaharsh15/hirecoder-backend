/*
  Warnings:

  - The values [REVIEWING,INTERVIEW] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ApplicationStatus_new" AS ENUM ('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED', 'HIRED', 'WITHDRAWN');
ALTER TABLE "public"."Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Application" ALTER COLUMN "status" TYPE "public"."ApplicationStatus_new" USING ("status"::text::"public"."ApplicationStatus_new");
ALTER TYPE "public"."ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "public"."ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "public"."ApplicationStatus_old";
ALTER TABLE "public"."Application" ALTER COLUMN "status" SET DEFAULT 'APPLIED';
COMMIT;
