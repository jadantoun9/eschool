"use client";

import { useRouter } from "next/navigation";

// A table row that navigates to `href` when clicked anywhere, same as the
// row's own link. Clicks on inner links/buttons keep their own behaviour, and
// Cmd/Ctrl-click opens a new tab.
export function RowLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <tr
      style={{ cursor: "pointer" }}
      onMouseEnter={() => router.prefetch(href)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a, button")) return;
        if (e.metaKey || e.ctrlKey) {
          window.open(href, "_blank");
          return;
        }
        router.push(href);
      }}
    >
      {children}
    </tr>
  );
}
