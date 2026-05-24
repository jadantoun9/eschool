"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AcceptInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token") ?? "";
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) { setErr("Les mots de passe ne correspondent pas."); return; }
    setBusy(true); setErr(null);
    const res = await fetch("/api/teachers/accept-invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password: pw }),
    });
    setBusy(false);
    if (!res.ok) { setErr((await res.json()).error ?? "Erreur"); return; }
    router.push("/admin/login");
  }

  if (!token) return <p>Lien invalide.</p>;
  return (
    <form onSubmit={submit} className="card">
      <h1 style={{ fontFamily: "Crimson Pro, serif", fontSize: 22, marginBottom: 8 }}>Activer votre compte</h1>
      <p style={{ fontSize: 13, color: "var(--g500)", marginBottom: 14 }}>Choisissez votre mot de passe.</p>
      <div className="field" style={{ marginBottom: 10 }}>
        <label>Mot de passe (8 caractères min.)</label>
        <input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} />
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Confirmer</label>
        <input type="password" required minLength={8} value={pw2} onChange={(e) => setPw2(e.target.value)} />
      </div>
      {err && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 10 }}>{err}</div>}
      <button className="btn-primary" disabled={busy}>{busy ? "…" : "Activer mon compte"}</button>
    </form>
  );
}

export default function AcceptInvitePage() {
  return (
    <main className="wrap" style={{ padding: "3rem 1rem", maxWidth: 420 }}>
      <Suspense>
        <AcceptInner />
      </Suspense>
    </main>
  );
}
