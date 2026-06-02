"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Lang } from "@/lib/i18n";

export function LanguageSwitcher({ current }: { current: Lang }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [lang, setLang] = useState<Lang>(current);

  async function change(next: Lang) {
    if (next === lang) return;
    setLang(next);
    await fetch("/api/lang", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lang: next }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      {(["en", "fr"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => change(code)}
          className={code === lang ? "active" : ""}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
