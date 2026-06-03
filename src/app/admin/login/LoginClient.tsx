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
  const [keep, setKeep] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
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
      minHeight: "100vh",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "clamp(48px, 9vh, 110px) 24px 48px",
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
          <span className="brand__mark" style={{ width: 36, height: 36 }}>
            <Image src="/ice-logo.png" alt="ICE" width={36} height={36} priority />
          </span>
          <span className="brand__word" style={{ fontSize: 18 }}>
            <b>ICE</b> Learning
          </span>
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
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <label className="field__label" htmlFor="password">{s["login.password"]}</label>
              <button
                type="button"
                onClick={() => setShowForgot((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--text-muted)",
                }}
              >
                {s["login.forgot"]}
              </button>
            </div>
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
            {showForgot && <span className="field__hint">{s["login.forgotHint"]}</span>}
          </div>

          {/* Keep me signed in */}
          <label
            className="row"
            style={{
              gap: 10,
              alignItems: "center",
              marginBottom: 20,
              fontSize: 13,
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            <span
              className={`checkbox${keep ? " checkbox--checked" : ""}`}
              style={{ flexShrink: 0 }}
              onClick={() => setKeep((v) => !v)}
              role="checkbox"
              aria-checked={keep}
            >
              {keep ? "✓" : ""}
            </span>
            <span>{s["login.keep"]}</span>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="btn btn--primary"
            style={{ width: "100%" }}
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

        <p className="muted" style={{ textAlign: "center", fontSize: 13, marginTop: 20 }}>
          {s["login.noAccount"]}{" "}
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>{s["login.askInvite"]}</span>
        </p>
      </div>
    </div>
  );
}
