"use server";

import { fetchBackend } from "@/actions/api";

export async function listModalities(unitId) {
  return await fetchBackend(`/units/${unitId}/modalities`);
}

export async function getModality(unitId, modalityId) {
  return await fetchBackend(`/units/${unitId}/modalities/${modalityId}`);
}

export async function updateModalityImage(unitId, modalityId, imageUrl, imageKey) {
  return await fetchBackend(`/units/${unitId}/modalities/${modalityId}/image`, {
    method: "PATCH",
    body: JSON.stringify({ imageUrl, imageKey }),
  });
}
