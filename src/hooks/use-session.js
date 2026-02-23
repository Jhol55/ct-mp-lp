"use client";

import { useSession as useNextAuthSession } from "next-auth/react";

// Usar em components client-side
export function useSession() {
  const { data: session } = useNextAuthSession();

  return {
    session,
    user: session?.user,
    isAuthenticated: !!session,
  };
}
