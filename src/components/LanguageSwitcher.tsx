"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Lang } from "@/lib/i18n";

export function LanguageSwitcher({ current }: { current: Lang }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lang, setLang] = useState<Lang>(current);

  function change(next: Lang) {
    if (next === lang || isPending) return;
    // Highlight the target immediately, then persist + re-render. isPending
    // stays true through the fetch and the server refresh, driving the loader.
    setLang(next);
    startTransition(async () => {
      await fetch("/api/lang", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lang: next }),
      });
      router.refresh();
    });
  }

  return (
    <>
      {isPending && <span className="route-progress" aria-hidden />}
      <div
        className="lang-toggle"
        role="group"
        aria-label="Language"
        aria-busy={isPending}
        data-busy={isPending ? "true" : undefined}
      >
        {(["en", "fr"] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => change(code)}
            disabled={isPending}
            className={code === lang ? "active" : ""}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
    </>
  );
}
