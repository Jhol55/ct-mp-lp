"use server";

import { fetchBackend } from "@/actions/api";

export async function getSchedule(unitId) {
  return await fetchBackend(`/units/${unitId}/schedule`, { method: "GET" });
}

export async function upsertScheduleSlot(unitId, dayOfWeek, time, modality, classType, durationMinutes) {
  return await fetchBackend(`/units/${unitId}/schedule/slots`, {
    method: "POST",
    body: JSON.stringify({ dayOfWeek, time, modality, classType, durationMinutes }),
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

export async function getScheduleVisibility(unitId) {
  return await fetchBackend(`/units/${unitId}/schedule/visibility`, {
    method: "GET",
  });
}

export async function updateScheduleVisibility(unitId, hiddenTimeSlots) {
  return await fetchBackend(`/units/${unitId}/schedule/visibility`, {
    method: "PUT",
    body: JSON.stringify({ hiddenTimeSlots }),
  });
}
