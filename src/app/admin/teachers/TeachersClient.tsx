"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/Spinner";

type T = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "active" | "pending";
  inviteToken: string | null;
};

const inputCls =
  "h-11 border-slate-200 text-sm focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/10";

export default function TeachersClient({
  teachers,
  strings,
}: {
  teachers: T[];
  strings: Record<string, string>;
}) {
  const s = strings;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function invite() {
    setBusy(true);
    setErr(null);
    setLink(null);
    const res = await fetch("/api/teachers/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    setBusy(false);
    if (!res.ok) {
      setErr((await res.json()).error ?? "Error");
      return;
    }
    const data = await res.json();
    setLink(`${window.location.origin}${data.inviteUrl}`);
    setEmail("");
    setName("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 text-base font-semibold text-slate-900">
          {s["teachers.inviteTitle"]}
        </div>
        <div className="mb-5 text-sm text-slate-500">
          {s["teachers.inviteDescription"]}
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="t-name" className="text-sm font-medium text-slate-700">
                {s["teachers.name"]}
              </Label>
              <Input
                id="t-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="t-email" className="text-sm font-medium text-slate-700">
                {s["teachers.email"]}
              </Label>
              <Input
                id="t-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          {err && (
            <Alert variant="destructive">
              <AlertDescription>{err}</AlertDescription>
            </Alert>
          )}
          <div>
            <Button
              disabled={busy || !email || !name}
              onClick={invite}
              className="h-11 bg-slate-900 px-6 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              {busy ? <Spinner size={16} /> : s["teachers.createInvite"]}
            </Button>
          </div>
          {link && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <div className="mb-2 font-medium">{s["teachers.linkLabel"]}</div>
              <code className="block break-all rounded bg-white/70 px-2 py-1.5 text-xs">
                {link}
              </code>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {s["teachers.col.name"]}
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {s["teachers.col.email"]}
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {s["teachers.col.role"]}
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {s["teachers.col.status"]}
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {s["teachers.col.link"]}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teachers.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-slate-50/60">
                <td className="px-6 py-4 font-medium text-slate-900">{t.name}</td>
                <td className="px-6 py-4 text-slate-500">{t.email}</td>
                <td className="px-6 py-4">
                  {t.role === "SUPER_ADMIN" ? (
                    <Badge className="border-violet-200 bg-violet-50 text-violet-700">
                      {s["teachers.superAdmin"]}
                    </Badge>
                  ) : (
                    <Badge className="border-slate-200 bg-slate-100 text-slate-600">
                      {s["teachers.teacher"]}
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4">
                  {t.status === "active" ? (
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      {s["teachers.active"]}
                    </Badge>
                  ) : (
                    <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                      {s["teachers.pending"]}
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4">
                  {t.status === "pending" && t.inviteToken ? (
                    <code className="text-xs text-slate-500">
                      /admin/accept-invite?token={t.inviteToken.slice(0, 12)}…
                    </code>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
