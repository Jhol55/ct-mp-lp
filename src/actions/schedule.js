"use server";

import { fetchBackend } from "@/actions/api";

export async function getSchedule(unitId) {
  return await fetchBackend(`/units/${unitId}/schedule`, { method: "GET" });
}

export async function upsertScheduleSlot(unitId, dayOfWeek, time, modality, classType) {
  return await fetchBackend(`/units/${unitId}/schedule/slots`, {
    method: "POST",
    body: JSON.stringify({ dayOfWeek, time, modality, classType }),
  });
}

export async function deleteScheduleSlot(unitId, dayOfWeek, time) {
  return await fetchBackend(
    `/units/${unitId}/schedule/slots?dayOfWeek=${dayOfWeek}&time=${encodeURIComponent(time)}`,
    { method: "DELETE" },
  );
}

export async function bulkUpdateScheduleSlots(unitId, slots) {
  return await fetchBackend(`/units/${unitId}/schedule/bulk`, {
    method: "PUT",
    body: JSON.stringify({ slots }),
  });
}
