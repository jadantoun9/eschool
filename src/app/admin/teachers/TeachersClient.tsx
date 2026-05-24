"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type T = { id: string; email: string; name: string; role: string; status: "active" | "pending"; inviteToken: string | null };

export default function TeachersClient({ teachers }: { teachers: T[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function invite() {
    setBusy(true); setErr(null); setLink(null);
    const res = await fetch("/api/teachers/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    setBusy(false);
    if (!res.ok) { setErr((await res.json()).error ?? "Erreur"); return; }
    const data = await res.json();
    setLink(`${window.location.origin}${data.inviteUrl}`);
    setEmail(""); setName("");
    router.refresh();
  }

  return (
    <>
      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Inviter un enseignant</h2>
        <div className="name-grid" style={{ marginBottom: 12 }}>
          <div className="field"><label>Nom</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        {err && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 10 }}>{err}</div>}
        <button className="btn-primary" disabled={busy || !email || !name} onClick={invite}>
          {busy ? "…" : "Créer l'invitation"}
        </button>
        {link && (
          <div style={{ marginTop: 12, padding: 10, background: "var(--green-l)", borderRadius: 8, fontSize: 13 }}>
            Lien d&apos;invitation (à transmettre par email manuellement) :<br />
            <code style={{ wordBreak: "break-all" }}>{link}</code>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "var(--g50)", textAlign: "left" }}>
              <th style={th}>Nom</th>
              <th style={th}>Email</th>
              <th style={th}>Rôle</th>
              <th style={th}>Statut</th>
              <th style={th}>Lien</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} style={{ borderTop: "1px solid var(--g100)" }}>
                <td style={td}>{t.name}</td>
                <td style={td}>{t.email}</td>
                <td style={td}>{t.role === "SUPER_ADMIN" ? "Super-admin" : "Enseignant"}</td>
                <td style={td}>{t.status === "active" ? "Actif" : "En attente"}</td>
                <td style={td}>
                  {t.status === "pending" && t.inviteToken ? (
                    <code style={{ fontSize: 11 }}>/admin/accept-invite?token={t.inviteToken}</code>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const th: React.CSSProperties = { padding: "10px 14px", fontSize: 11, color: "var(--g500)", textTransform: "uppercase", fontWeight: 700, letterSpacing: ".05em" };
const td: React.CSSProperties = { padding: "10px 14px", color: "var(--g600)" };
