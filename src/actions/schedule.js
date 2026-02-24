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

// Helper para gerar nome da aula a partir de modality e classType
export function formatClassName(modality, classType) {
  if (!modality) return null;
  
  const modalityLabel = modality === "MUAY_THAI" ? "Muay Thai" : "Funcional";
  const typeLabel = classType === "KIDS" ? "Kids" : null;
  
  if (typeLabel) {
    return `${modalityLabel} - ${typeLabel}`;
  }
  return modalityLabel;
}
