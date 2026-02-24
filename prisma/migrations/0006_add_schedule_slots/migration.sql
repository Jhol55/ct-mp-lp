-- CreateTable
CREATE TABLE "schedule_slots" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "className" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schedule_slots_unitId_idx" ON "schedule_slots"("unitId");

-- CreateIndex
CREATE INDEX "schedule_slots_unitId_dayOfWeek_idx" ON "schedule_slots"("unitId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_slots_unitId_dayOfWeek_time_key" ON "schedule_slots"("unitId", "dayOfWeek", "time");

-- AddForeignKey
ALTER TABLE "schedule_slots" ADD CONSTRAINT "schedule_slots_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
