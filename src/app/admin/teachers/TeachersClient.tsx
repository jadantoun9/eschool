"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";

type T = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "active" | "pending";
  inviteToken: string | null;
  createdAt: string;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #ef4444, #b91c1c)",
  "linear-gradient(135deg, #3b82f6, #1e40af)",
  "linear-gradient(135deg, #22c55e, #15803d)",
  "linear-gradient(135deg, #a855f7, #7e22ce)",
  "linear-gradient(135deg, #f59e0b, #b45309)",
];

export default function TeachersClient({
  teachers,
  strings,
  lang,
}: {
  teachers: T[];
  strings: Record<string, string>;
  lang: Lang;
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

  const activeCount = teachers.filter((t) => t.status === "active").length;
  const pendingCount = teachers.filter((t) => t.status === "pending").length;

  return (
    <>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
          marginBottom: 32,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            🛡 {lang === "fr" ? "Super admin uniquement" : "Super admin only"}
          </div>
          <h1 className="h1" style={{ marginBottom: 6 }}>
            {s["teachers.title"]}
          </h1>
          <p className="muted">{s["teachers.subtitle"]}</p>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="stat__num numeric">{activeCount}</div>
            <div className="stat__label">{s["teachers.active"]}</div>
          </div>
          <div className="stat">
            <div className="stat__num numeric">{pendingCount}</div>
            <div className="stat__label">{s["teachers.pending"]}</div>
          </div>
          <div className="stat">
            <div className="stat__num numeric">{teachers.length}</div>
            <div className="stat__label">
              {lang === "fr" ? "Total" : "Total"}
            </div>
          </div>
        </div>
      </div>

      {/* Invite card */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(255,204,0,0.08), rgba(255,204,0,0.02))",
          border: "1px solid rgba(255,204,0,0.25)",
          borderRadius: "var(--radius-xl)",
          padding: "24px 28px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr auto",
          gap: 14,
          alignItems: "end",
          marginBottom: 28,
        }}
      >
        <div className="field" style={{ margin: 0 }}>
          <label className="field__label">{s["teachers.email"]}</label>
          <input
            className="input"
            type="email"
            placeholder="teacher@school.ae"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label className="field__label">{s["teachers.name"]}</label>
          <input
            className="input"
            placeholder={lang === "fr" ? "Nom complet" : "Full name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          className="btn btn--primary"
          disabled={busy || !email || !name}
          onClick={invite}
        >
          {busy ? (
            lang === "fr" ? (
              "Envoi…"
            ) : (
              "Sending…"
            )
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M2 4l6 5 6-5M2 4v8h12V4M2 4h12" />
              </svg>
              {s["teachers.createInvite"]}
            </>
          )}
        </button>
      </div>

      {/* Error message */}
      {err && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 16px",
            borderRadius: "var(--radius-lg)",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171",
            fontSize: 14,
          }}
        >
          {err}
        </div>
      )}

      {/* Invite link */}
      {link && (
        <div
          style={{
            marginBottom: 24,
            padding: "16px 20px",
            borderRadius: "var(--radius-lg)",
            background: "rgba(255,204,0,0.08)",
            border: "1px solid rgba(255,204,0,0.25)",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              marginBottom: 8,
              color: "var(--accent)",
              fontSize: 13,
            }}
          >
            {s["teachers.linkLabel"]}
          </div>
          <code
            className="mono"
            style={{
              display: "block",
              fontSize: 12,
              wordBreak: "break-all",
              color: "var(--fg)",
              opacity: 0.8,
            }}
          >
            {link}
          </code>
        </div>
      )}

      {/* Teachers table */}
      <table className="table">
        <thead>
          <tr>
            <th>{s["teachers.col.name"]}</th>
            <th>{s["teachers.col.email"]}</th>
            <th>{s["teachers.col.role"]}</th>
            <th style={{ width: 160 }}>{lang === "fr" ? "Inscription" : "Joined"}</th>
            <th style={{ width: 120 }}>{s["teachers.col.status"]}</th>
            <th style={{ width: 80, textAlign: "right" as const }}>
              {lang === "fr" ? "Actions" : "Actions"}
            </th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher, i) => {
            const joined = new Date(teacher.createdAt).toLocaleDateString(
              lang === "fr" ? "fr-FR" : "en-GB",
              { day: "numeric", month: "short", year: "numeric" }
            );
            return (
              <tr key={teacher.id}>
                {/* Name + avatar */}
                <td>
                  <div className="row" style={{ gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "#fff",
                        flexShrink: 0,
                        background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
                      }}
                    >
                      {initials(teacher.name)}
                    </div>
                    <div>
                      <div className="table__title">{teacher.name}</div>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {teacher.email}
                  </span>
                </td>

                {/* Role */}
                <td>
                  {teacher.role === "SUPER_ADMIN" ? (
                    <span className="badge badge--accent">
                      {s["teachers.superAdmin"]}
                    </span>
                  ) : (
                    <span className="badge badge--draft">
                      {s["teachers.teacher"]}
                    </span>
                  )}
                </td>

                {/* Joined */}
                <td>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {joined}
                  </span>
                </td>

                {/* Status */}
                <td>
                  {teacher.status === "active" ? (
                    <span className="badge badge--published">
                      {s["teachers.active"]}
                    </span>
                  ) : (
                    <span
                      className="badge"
                      style={{
                        background: "rgba(255,204,0,0.12)",
                        borderColor: "rgba(255,204,0,0.35)",
                        color: "var(--accent)",
                      }}
                    >
                      {s["teachers.pending"]}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td>
                  <div className="table__actions">
                    {teacher.status === "pending" && teacher.inviteToken && (
                      <button
                        className="btn btn--ghost btn--sm"
                        title={lang === "fr" ? "Renvoyer" : "Resend"}
                        onClick={async () => {
                          const res = await fetch("/api/teachers/invite", {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({
                              email: teacher.email,
                              name: teacher.name,
                            }),
                          });
                          if (res.ok) router.refresh();
                        }}
                      >
                        {lang === "fr" ? "Renvoyer" : "Resend"}
                      </button>
                    )}
                    <button
                      className="icon-btn icon-btn--danger"
                      title={lang === "fr" ? "Supprimer" : "Remove"}
                      onClick={async () => {
                        if (
                          !confirm(
                            lang === "fr"
                              ? `Supprimer ${teacher.name} ?`
                              : `Remove ${teacher.name}?`
                          )
                        )
                          return;
                        await fetch(`/api/teachers/${teacher.id}`, {
                          method: "DELETE",
                        });
                        router.refresh();
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4l1 9h4l1-9" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ height: 80 }} />
    </>
  );
}
