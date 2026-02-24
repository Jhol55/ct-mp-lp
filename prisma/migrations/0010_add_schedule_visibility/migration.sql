-- CreateTable
CREATE TABLE "schedule_visibility" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "hiddenTimeSlots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_visibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schedule_visibility_unitId_key" ON "schedule_visibility"("unitId");

-- AddForeignKey
ALTER TABLE "schedule_visibility" ADD CONSTRAINT "schedule_visibility_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
