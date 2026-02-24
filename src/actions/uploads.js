"use server";

import { fetchBackend } from "@/actions/api";

export async function presignUpload({ contentType, ext, type = 'plans' }) {
  return await fetchBackend("/uploads/presign", {
    method: "POST",
    body: JSON.stringify({ contentType, ext, type }),
  });
}

