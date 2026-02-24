"use server";

import { fetchBackend } from "@/actions/api";

export async function listPartners(unitId) {
  return await fetchBackend(`/units/${unitId}/partners`, { method: "GET" });
}

export async function createPartner(unitId, { name, rulesAndNotes }) {
  return await fetchBackend(`/units/${unitId}/partners`, {
    method: "POST",
    body: JSON.stringify({ name, rulesAndNotes }),
  });
}

export async function updatePartner(unitId, partnerId, { name, rulesAndNotes }) {
  return await fetchBackend(`/units/${unitId}/partners/${partnerId}`, {
    method: "PATCH",
    body: JSON.stringify({ name, rulesAndNotes }),
  });
}

export async function deletePartner(unitId, partnerId) {
  return await fetchBackend(`/units/${unitId}/partners/${partnerId}`, {
    method: "DELETE",
  });
}
