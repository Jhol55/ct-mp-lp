"use server";

import { fetchBackend } from "@/actions/api";

export async function listUnits() {
  return await fetchBackend("/units", { method: "GET" });
}

export async function createUnit({ name }) {
  return await fetchBackend("/units", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function getUnit(id) {
  return await fetchBackend(`/units/${id}`, { method: "GET" });
}

export async function updateUnit(id, patch) {
  return await fetchBackend(`/units/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteUnit(id) {
  return await fetchBackend(`/units/${id}`, {
    method: "DELETE",
  });
}
