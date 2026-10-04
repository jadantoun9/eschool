"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

// Re-fetches the current server component in the background whenever the page
// is entered, so the router cache (back/forward, router.push) never shows stale
// data. The existing UI stays on screen until the fresh payload arrives.
export function RefreshOnMount() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => router.refresh());
  }, [router]);

  return null;
}
