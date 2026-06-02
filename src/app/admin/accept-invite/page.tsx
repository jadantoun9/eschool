"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { dict, type Lang } from "@/lib/i18n";
import { Spinner } from "@/components/Spinner";

function readLangCookie(): Lang {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/(?:^|;\s*)lang=(en|fr)/);
  return (m?.[1] as Lang) ?? "en";
}

function strengthColor(strength: number): string {
  if (strength === 1) return "var(--danger)";
  if (strength === 2) return "var(--warning)";
  return "var(--success)";
}

function AcceptInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token") ?? "";
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => setLang(readLangCookie()), []);
  const s = dict[lang];

  const strength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : 3;

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
      <div className="invite">
        <div className="invite__card">
          <p className="field__error" style={{ textAlign: "center", fontSize: 14 }}>
            {s["invite.invalidLink"]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="invite">
      <div className="invite__card">
        {/* Title */}
        <h1
          className="h2"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "-0.015em",
            textAlign: "center",
            marginBottom: 6,
          }}
        >
          {s["invite.title"]}
        </h1>
        <p className="muted" style={{ textAlign: "center", marginBottom: 28, fontSize: 14 }}>
          {s["invite.subtitle"]}
        </p>

        <form onSubmit={submit}>
          {/* Password */}
          <div className="field">
            <label className="field__label">{s["invite.password"]}</label>
            <input
              className="input"
              type="password"
              required
              minLength={8}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            {strength > 0 && (
              <>
                <div className="invite__strength">
                  {[1, 2, 3].map((n) => (
                    <span
                      key={n}
                      style={{
                        background:
                          n <= strength ? strengthColor(strength) : "rgba(255,255,255,0.08)",
                      }}
                    />
                  ))}
                </div>
                <span className="field__hint">
                  {strength === 1 &&
                    (lang === "fr"
                      ? "Trop court — au moins 10 caractères"
                      : "Too short — at least 10 characters")}
                  {strength === 2 &&
                    (lang === "fr"
                      ? "Correct — ajoute un symbole ou un chiffre"
                      : "OK — add a symbol or number")}
                  {strength === 3 && (lang === "fr" ? "Solide" : "Strong")}
                </span>
              </>
            )}
          </div>

          {/* Confirm password */}
          <div className="field">
            <label className="field__label">{s["invite.confirm"]}</label>
            <input
              className="input"
              type="password"
              required
              minLength={8}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
            />
          </div>

          {/* Error */}
          {err && (
            <p className="field__error" style={{ marginBottom: 16, fontSize: 13 }}>
              {err}
            </p>
          )}

          {/* Terms checkbox */}
          <label
            className="row"
            style={{
              gap: 10,
              alignItems: "flex-start",
              marginBottom: 20,
              fontSize: 13,
              color: "var(--text-muted)",
              cursor: "pointer",
              lineHeight: 1.5,
            }}
          >
            <span
              className={`checkbox${agreed ? " checkbox--checked" : ""}`}
              style={{ marginTop: 1, flexShrink: 0 }}
              onClick={() => setAgreed((v) => !v)}
              role="checkbox"
              aria-checked={agreed}
            >
              {agreed ? "✓" : ""}
            </span>
            <span>
              {lang === "fr" ? (
                <>
                  {"J'accepte les "}
                  <a href="#" style={{ color: "var(--accent)" }}>
                    conditions
                  </a>
                  {" et la "}
                  <a href="#" style={{ color: "var(--accent)" }}>
                    politique de confidentialité
                  </a>
                  .
                </>
              ) : (
                <>
                  {"I agree to the "}
                  <a href="#" style={{ color: "var(--accent)" }}>
                    terms
                  </a>
                  {" and "}
                  <a href="#" style={{ color: "var(--accent)" }}>
                    privacy policy
                  </a>
                  .
                </>
              )}
            </span>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="btn btn--primary btn--block"
          >
            {busy ? <Spinner size={16} /> : s["invite.submit"]}
          </button>
        </form>

        <p className="muted" style={{ textAlign: "center", fontSize: 12, marginTop: 18 }}>
          {lang === "fr"
            ? "Cette invitation expire dans 7 jours."
            : "This invite expires in 7 days."}
        </p>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInner />
    </Suspense>
  );
}
