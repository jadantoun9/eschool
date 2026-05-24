"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Lang } from "@/lib/i18n";

export function LanguageSwitcher({ current }: { current: Lang }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
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
    <div
      className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium"
      aria-busy={pending}
    >
      {(["en", "fr"] as const).map((code) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            onClick={() => change(code)}
            className={
              active
                ? "rounded-full bg-white px-3 py-1 text-slate-900 shadow-sm"
                : "rounded-full px-3 py-1 text-slate-500 hover:text-slate-700"
            }
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
