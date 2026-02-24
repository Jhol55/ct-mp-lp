-- CreateEnum
CREATE TYPE "Modality" AS ENUM ('MUAY_THAI', 'FUNCIONAL');

-- CreateEnum
CREATE TYPE "ClassType" AS ENUM ('LIVRE', 'KIDS');

-- AlterTable
ALTER TABLE "schedule_slots" 
  DROP COLUMN IF EXISTS "className",
  ADD COLUMN "modality" "Modality",
  ADD COLUMN "classType" "ClassType" NOT NULL DEFAULT 'LIVRE';
