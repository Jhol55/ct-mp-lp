"use server";

import { fetchBackend } from "@/actions/api";

export async function presignUpload({ contentType, ext }) {
  return await fetchBackend("/uploads/presign", {
    method: "POST",
    body: JSON.stringify({ contentType, ext }),
  });
}

