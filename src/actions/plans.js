"use server";

import { fetchBackend } from "@/actions/api";

export async function createPlan(unitId, modalityId, payload) {
  return await fetchBackend(`/units/${unitId}/modalities/${modalityId}/plans`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePlan(unitId, modalityId, planId, payload) {
  return await fetchBackend(`/units/${unitId}/modalities/${modalityId}/plans/${planId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
