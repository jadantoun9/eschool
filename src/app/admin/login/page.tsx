"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
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
    if (res?.error) setErr("Identifiants invalides.");
    else router.push("/admin");
  }

  return (
    <main className="wrap" style={{ padding: "3rem 1rem", maxWidth: 420 }}>
      <h1 style={{ fontFamily: "Crimson Pro, serif", fontSize: 28, marginBottom: 4 }}>Espace enseignant</h1>
      <p style={{ color: "var(--g500)", marginBottom: 20, fontSize: 14 }}>Connectez-vous pour gérer vos fiches.</p>

      <form onSubmit={onSubmit} className="card">
        <div className="field" style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 12 }}>
          <label>Mot de passe</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {err && <div style={{ color: "var(--red)", marginBottom: 12, fontSize: 13 }}>{err}</div>}
        <button className="btn-primary" disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</button>
      </form>
    </main>
  );
}
