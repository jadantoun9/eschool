"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Spinner } from "@/components/Spinner";

export default function LoginClient({
  strings,
  notice,
}: {
  strings: Record<string, string>;
  notice?: string | null;
}) {
  const s = strings;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setBusy(false);
      setErr(s["login.invalid"]);
      return;
    }
    // Hard navigate so the server re-renders /admin with the new session cookie.
    // Leaving `busy` true keeps the spinner visible until the new page arrives.
    window.location.assign("/admin");
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 80px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 460,
        background: "var(--surface)",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-xl)",
        padding: 40,
        boxShadow: "0 30px 80px -20px rgba(0,0,0,0.5)",
        position: "relative",
      }}>
        {/* Brand mark */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <Image src="/ice-logo.png" alt="ICE" width={64} height={64} priority />
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: "-0.015em",
          textAlign: "center",
          marginBottom: 8,
        }}>
          {s["login.title"]}
        </h1>
        <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: 32, fontSize: 14 }}>
          {s["login.subtitle"]}
        </p>

        {/* Session-expired notice */}
        {notice && (
          <div style={{
            padding: "12px 14px",
            marginBottom: 18,
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.35)",
            borderRadius: 10,
            color: "#fcd34d",
            fontSize: 13,
            display: "flex",
            gap: 10,
          }}>
            <span style={{ fontWeight: 700 }}>⚠</span>
            <span>{notice}</span>
          </div>
        )}

        {/* Wrong credentials error */}
        {err && (
          <div style={{
            padding: "12px 14px",
            marginBottom: 18,
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.35)",
            borderRadius: 10,
            color: "#fca5a5",
            fontSize: 13,
            display: "flex",
            gap: 10,
          }}>
            <span style={{ fontWeight: 700 }}>✗</span>
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="email">{s["login.email"]}</label>
            <input
              id="email"
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder={s["login.emailPlaceholder"]}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="password">{s["login.password"]}</label>
            <input
              id="password"
              className="input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="btn btn--primary"
            style={{ width: "100%", marginTop: 4 }}
          >
            {busy ? (
              <>
                <Spinner size={16} /> {s["login.submitting"]}
              </>
            ) : (
              s["login.submit"]
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
