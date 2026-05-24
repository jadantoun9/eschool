"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { dict, type Lang } from "@/lib/i18n";

const inputCls =
  "h-11 border-slate-200 text-sm focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/10";

function readLangCookie(): Lang {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/(?:^|;\s*)lang=(en|fr)/);
  return (m?.[1] as Lang) ?? "en";
}

function AcceptInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token") ?? "";
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => setLang(readLangCookie()), []);
  const s = dict[lang];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) {
      setErr(s["invite.mismatch"]);
      return;
    }
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/teachers/accept-invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password: pw }),
    });
    setBusy(false);
    if (!res.ok) {
      setErr((await res.json()).error ?? "Error");
      return;
    }
    router.push("/admin/login");
  }

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{s["invite.invalidLink"]}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {s["invite.title"]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{s["invite.subtitle"]}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="pw" className="text-sm font-medium text-slate-700">
              {s["invite.password"]}
            </Label>
            <Input
              id="pw"
              type="password"
              required
              minLength={8}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw2" className="text-sm font-medium text-slate-700">
              {s["invite.confirm"]}
            </Label>
            <Input
              id="pw2"
              type="password"
              required
              minLength={8}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className={inputCls}
            />
          </div>
          {err && (
            <Alert variant="destructive">
              <AlertDescription>{err}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full bg-slate-900 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            {busy ? "…" : s["invite.submit"]}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-100 p-6"
      style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
    >
      <Suspense>
        <AcceptInner />
      </Suspense>
    </div>
  );
}
