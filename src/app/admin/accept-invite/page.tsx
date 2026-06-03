"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { dict, t, type Lang } from "@/lib/i18n";
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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

function roleLabel(role: string, lang: Lang): string {
  if (role === "SUPER_ADMIN") return "Admin";
  return t("teachers.teacher", lang);
}

type Invitee = { name: string; email: string; role: string };

function CardBrand() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
      <span className="brand__mark" style={{ width: 36, height: 36 }}>
        <Image src="/ice-logo.png" alt="ICE" width={36} height={36} priority />
      </span>
      <span className="brand__word" style={{ fontSize: 18 }}>
        <b>ICE</b> Learning
      </span>
    </div>
  );
}

function AcceptInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token") ?? "";
  const [pw, setPw] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [invitee, setInvitee] = useState<Invitee | null>(null);
  const [expired, setExpired] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLang(readLangCookie()), []);
  const s = dict[lang];

  // Load the invited account so we can confirm who's activating.
  useEffect(() => {
    if (!token) {
      setLoaded(true);
      return;
    }
    let alive = true;
    fetch(`/api/teachers/accept-invite?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        if (!alive) return;
        if (r.status === 410) {
          setExpired(true);
          return;
        }
        if (r.ok) {
          const data = await r.json();
          if (data && data.name) setInvitee(data);
        }
      })
      .catch(() => {})
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [token]);

  const strength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : 3;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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

  // Expired link: token was valid but past its 7-day window — prompt for a fresh invite.
  if (expired) {
    return (
      <div className="invite">
        <div className="invite__card">
          <CardBrand />
          <p className="field__error" style={{ textAlign: "center", fontSize: 14 }}>
            {s["invite.expired"]}
          </p>
        </div>
      </div>
    );
  }

  // Invalid links: token missing, or lookup found no matching invite.
  if (!token || (loaded && !invitee)) {
    return (
      <div className="invite">
        <div className="invite__card">
          <CardBrand />
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
        <CardBrand />

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

        {/* Who's activating — email, name and role are already set by the invite */}
        {invitee && (
          <div className="invite__from">
            <span className="invite__avatar">{initials(invitee.name)}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{invitee.name}</div>
              <div className="muted" style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {invitee.email}
              </div>
            </div>
            <span className="badge badge--accent" style={{ flexShrink: 0 }}>
              {roleLabel(invitee.role, lang)}
            </span>
          </div>
        )}

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
              autoComplete="new-password"
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
                  {strength === 1 && t("invite.strengthWeak", lang)}
                  {strength === 2 && t("invite.strengthOk", lang)}
                  {strength === 3 && t("invite.strengthStrong", lang)}
                </span>
              </>
            )}
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
            disabled={busy || !agreed}
            className="btn btn--primary btn--block"
          >
            {busy ? <Spinner size={16} /> : s["invite.submit"]}
          </button>
        </form>

        <p className="muted" style={{ textAlign: "center", fontSize: 12, marginTop: 18 }}>
          {s["invite.expires"]}
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
