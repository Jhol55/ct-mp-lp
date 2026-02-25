-- CreateTable
CREATE TABLE "modalities" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "modality" "Modality" NOT NULL,
    "imageUrl" TEXT,
    "imageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modalities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "modalities_unitId_idx" ON "modalities"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "modalities_unitId_modality_key" ON "modalities"("unitId", "modality");

-- AddForeignKey
ALTER TABLE "modalities" ADD CONSTRAINT "modalities_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data: create modalities for each unit
-- First, create MUAY_THAI modality for each unit
INSERT INTO "modalities" ("id", "unitId", "modality", "imageUrl", "imageKey", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    u.id,
    'MUAY_THAI'::"Modality",
    u."plansImageUrl",
    u."plansImageKey",
    NOW(),
    NOW()
FROM "units" u
WHERE NOT EXISTS (
    SELECT 1 FROM "modalities" m WHERE m."unitId" = u.id AND m.modality = 'MUAY_THAI'
);

-- Create FUNCIONAL modality for each unit
INSERT INTO "modalities" ("id", "unitId", "modality", "imageUrl", "imageKey", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    u.id,
    'FUNCIONAL'::"Modality",
    NULL,
    NULL,
    NOW(),
    NOW()
FROM "units" u
WHERE NOT EXISTS (
    SELECT 1 FROM "modalities" m WHERE m."unitId" = u.id AND m.modality = 'FUNCIONAL'
);

-- Add modalityId column to plans (temporarily nullable)
ALTER TABLE "plans" ADD COLUMN "modalityId" TEXT;

-- Migrate existing plans to MUAY_THAI modality (default)
UPDATE "plans" p
SET "modalityId" = (
    SELECT m.id 
    FROM "modalities" m 
    WHERE m."unitId" = p."unitId" 
    AND m.modality = 'MUAY_THAI' 
    LIMIT 1
);

-- Make modalityId NOT NULL
ALTER TABLE "plans" ALTER COLUMN "modalityId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "plans_modalityId_idx" ON "plans"("modalityId");

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "modalities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove unitId from plans
ALTER TABLE "plans" DROP CONSTRAINT "plans_unitId_fkey";
DROP INDEX IF EXISTS "plans_unitId_idx";
ALTER TABLE "plans" DROP COLUMN "unitId";

-- Remove plansImageUrl and plansImageKey from units
ALTER TABLE "units" DROP COLUMN "plansImageUrl";
ALTER TABLE "units" DROP COLUMN "plansImageKey";
