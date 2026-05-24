"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/Spinner";

const inputCls =
  "h-11 border-slate-200 text-sm focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/10";

export default function LoginClient({ strings }: { strings: Record<string, string> }) {
  const s = strings;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) setErr(s["login.invalid"]);
    else router.push("/admin");
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-100 p-6"
      style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {s["login.title"]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{s["login.subtitle"]}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                {s["login.email"]}
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder={s["login.emailPlaceholder"]}
                className={inputCls}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                {s["login.password"]}
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
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
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size={16} /> {s["login.submitting"]}
                </span>
              ) : (
                s["login.submit"]
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
