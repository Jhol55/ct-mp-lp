"use server";

import { fetchBackend } from "@/actions/api";

export async function createPlan(unitId, payload) {
  return await fetchBackend(`/units/${unitId}/plans`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePlan(unitId, planId, payload) {
  return await fetchBackend(`/units/${unitId}/plans/${planId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
