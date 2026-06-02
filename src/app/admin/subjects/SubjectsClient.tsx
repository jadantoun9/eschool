"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { chipClass } from "@/lib/subject-style";
import type { Lang } from "@/lib/i18n";

type Subject = {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  icon: string;
  colorKey: string;
};

const COLOR_KEYS = [
  { key: "math",  labelFr: "Bleu",   labelEn: "Blue"   },
  { key: "phys",  labelFr: "Orange", labelEn: "Orange" },
  { key: "chem",  labelFr: "Rouge",  labelEn: "Red"    },
  { key: "bio",   labelFr: "Vert",   labelEn: "Green"  },
];

const ICON_OPTS = ["📐", "⚡", "🧪", "🌿", "🔬", "📊", "🌍", "💻", "📖", "🎵", "📚", "🔭"];

/* ── inline styles for the icon-picker (scoped, not in globals.css) ── */
const pickerOptBase: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10,
  background: "var(--surface-2)",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 16, cursor: "pointer",
  border: "1px solid transparent",
  transition: "border-color 120ms, background 120ms",
  flexShrink: 0,
};
const pickerOptActive: React.CSSProperties = {
  ...pickerOptBase,
  borderColor: "var(--accent)",
  background: "rgba(255,204,0,0.1)",
};

const subjCardBase: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)",
  padding: 22,
  transition: "background 120ms, border-color 120ms",
};

const newCardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px dashed var(--border-strong)",
  borderRadius: "var(--radius-lg)",
  padding: 22,
  minHeight: 220,
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  gap: 10,
  color: "var(--text-muted)",
  cursor: "pointer",
  transition: "background 120ms, border-color 120ms, color 120ms",
};

/* ── SubjectCard ── */
function SubjectCard({
  subject,
  lang,
  onDeleted,
}: {
  subject: Subject;
  lang: Lang;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [nameFr, setNameFr] = useState(subject.nameFr);
  const [nameEn, setNameEn] = useState(subject.nameEn);
  const [icon, setIcon] = useState(subject.icon);
  const [colorKey, setColorKey] = useState(subject.colorKey);
  const [busy, setBusy] = useState(false);
  const [hovered, setHovered] = useState(false);

  async function save() {
    setBusy(true);
    await fetch(`/api/subjects/${subject.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nameFr, nameEn, icon, colorKey }),
    });
    setBusy(false);
    setEditing(false);
    router.refresh();
  }

  async function del() {
    if (!confirm(lang === "fr" ? "Supprimer cette matière ?" : "Delete this subject?")) return;
    await fetch(`/api/subjects/${subject.id}`, { method: "DELETE" });
    onDeleted();
    router.refresh();
  }

  const cardStyle: React.CSSProperties = hovered
    ? { ...subjCardBase, background: "var(--surface-2)", borderColor: "var(--border-strong)" }
    : subjCardBase;

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row: icon + action buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className={`icon-chip ${chipClass(colorKey)}`}>{icon}</span>
        <div className="row" style={{ gap: 2 }}>
          <button
            className="icon-btn icon-btn--accent"
            title={editing ? (lang === "fr" ? "Enregistrer" : "Save") : (lang === "fr" ? "Modifier" : "Edit")}
            onClick={editing ? save : () => setEditing(true)}
            disabled={busy}
          >
            {editing ? (
              /* checkmark */
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 8l3 3 5-6" />
              </svg>
            ) : (
              /* pencil */
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M11 2l3 3-8 8H3v-3z" />
              </svg>
            )}
          </button>
          <button
            className="icon-btn icon-btn--danger"
            title={lang === "fr" ? "Supprimer" : "Delete"}
            onClick={del}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4l1 9h4l1-9" />
            </svg>
          </button>
        </div>
      </div>

      {!editing && (
        <>
          <div className="h3" style={{ marginTop: 16 }}>
            {lang === "fr" ? subject.nameFr : subject.nameEn}
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            {lang === "fr" ? "EN" : "FR"} · {lang === "fr" ? subject.nameEn : subject.nameFr}
          </div>
          <div className="row" style={{ marginTop: 14, gap: 8 }}>
            <span className="badge">{subject.slug}</span>
          </div>
        </>
      )}

      {editing && (
        <>
          <div className="field" style={{ marginTop: 14 }}>
            <label className="field__label">
              {lang === "fr" ? "Nom (anglais)" : "Name (English)"}
            </label>
            <input
              className="input"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label">
              {lang === "fr" ? "Nom (français)" : "Name (French)"}
            </label>
            <input
              className="input"
              value={nameFr}
              onChange={(e) => setNameFr(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label">
              {lang === "fr" ? "Icône" : "Icon"}
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              {ICON_OPTS.map((ic) => (
                <span
                  key={ic}
                  style={ic === icon ? pickerOptActive : pickerOptBase}
                  onClick={() => setIcon(ic)}
                >
                  {ic}
                </span>
              ))}
            </div>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field__label">
              {lang === "fr" ? "Couleur" : "Color"}
            </label>
            <div className="row" style={{ gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              {COLOR_KEYS.map((c) => (
                <span
                  key={c.key}
                  className={`icon-chip icon-chip--sm ${chipClass(c.key)}`}
                  style={{
                    cursor: "pointer",
                    outline: colorKey === c.key ? "2px solid var(--accent)" : "2px solid transparent",
                    outlineOffset: 2,
                  }}
                  onClick={() => setColorKey(c.key)}
                  title={lang === "fr" ? c.labelFr : c.labelEn}
                />
              ))}
            </div>
          </div>
          <div className="row" style={{ marginTop: 14, gap: 8 }}>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setEditing(false);
                setNameFr(subject.nameFr);
                setNameEn(subject.nameEn);
                setIcon(subject.icon);
                setColorKey(subject.colorKey);
              }}
            >
              {lang === "fr" ? "Annuler" : "Cancel"}
            </button>
            <button
              className="btn btn--primary btn--sm"
              onClick={save}
              disabled={busy || !nameEn || !nameFr}
            >
              {busy
                ? (lang === "fr" ? "Enregistrement…" : "Saving…")
                : (lang === "fr" ? "Enregistrer" : "Save")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Add-subject card (dashed "new" card) ── */
function NewSubjectCard({
  lang,
  onCreated,
}: {
  lang: Lang;
  onCreated: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [icon, setIcon] = useState("📚");
  const [colorKey, setColorKey] = useState("math");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);

  async function create() {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, nameFr, nameEn, icon, colorKey }),
    });
    setBusy(false);
    if (!res.ok) {
      setErr((await res.json()).error ?? "Error");
      return;
    }
    setSlug("");
    setNameFr("");
    setNameEn("");
    setIcon("📚");
    setColorKey("math");
    setOpen(false);
    onCreated();
    router.refresh();
  }

  if (!open) {
    const hStyle: React.CSSProperties = hovered
      ? { ...newCardStyle, color: "var(--accent)", border: "1px dashed var(--accent)", background: "rgba(255,204,0,0.04)" }
      : newCardStyle;
    return (
      <div
        style={hStyle}
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          style={{
            width: 52, height: 52, borderRadius: 14,
            background: "var(--surface-2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 200,
          }}
        >
          +
        </div>
        <div style={{ fontWeight: 600 }}>
          {lang === "fr" ? "Nouvelle matière" : "New subject"}
        </div>
        <div className="muted" style={{ fontSize: 12, textAlign: "center", maxWidth: 200 }}>
          {lang === "fr"
            ? "Ajoute une catégorie comme Géographie ou Informatique"
            : "Add a top-level category like Geography or Computer science"}
        </div>
      </div>
    );
  }

  return (
    <div style={subjCardBase}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span className="h4">{lang === "fr" ? "Nouvelle matière" : "New subject"}</span>
        <button className="icon-btn" onClick={() => setOpen(false)}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      </div>

      <div className="field">
        <label className="field__label">Slug</label>
        <input
          className="input"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          placeholder="e.g. math, physics"
        />
      </div>
      <div className="field">
        <label className="field__label">
          {lang === "fr" ? "Nom (anglais)" : "Name (English)"}
        </label>
        <input
          className="input"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field__label">
          {lang === "fr" ? "Nom (français)" : "Name (French)"}
        </label>
        <input
          className="input"
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field__label">
          {lang === "fr" ? "Icône" : "Icon"}
        </label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
          {ICON_OPTS.map((ic) => (
            <span
              key={ic}
              style={ic === icon ? pickerOptActive : pickerOptBase}
              onClick={() => setIcon(ic)}
            >
              {ic}
            </span>
          ))}
        </div>
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label className="field__label">
          {lang === "fr" ? "Couleur" : "Color"}
        </label>
        <div className="row" style={{ gap: 6, flexWrap: "wrap", marginTop: 4 }}>
          {COLOR_KEYS.map((c) => (
            <span
              key={c.key}
              className={`icon-chip icon-chip--sm ${chipClass(c.key)}`}
              style={{
                cursor: "pointer",
                outline: colorKey === c.key ? "2px solid var(--accent)" : "2px solid transparent",
                outlineOffset: 2,
              }}
              onClick={() => setColorKey(c.key)}
              title={lang === "fr" ? c.labelFr : c.labelEn}
            />
          ))}
        </div>
      </div>

      {err && (
        <p className="field__error" style={{ marginTop: 10 }}>{err}</p>
      )}

      <div className="row" style={{ marginTop: 16, gap: 8 }}>
        <button className="btn btn--ghost btn--sm" onClick={() => setOpen(false)}>
          {lang === "fr" ? "Annuler" : "Cancel"}
        </button>
        <button
          className="btn btn--primary btn--sm"
          onClick={create}
          disabled={busy || !slug || !nameFr || !nameEn}
        >
          {busy
            ? (lang === "fr" ? "Création…" : "Creating…")
            : (lang === "fr" ? "Créer" : "Create")}
        </button>
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function SubjectsClient({
  strings,
  lang,
  subjects: initialSubjects,
}: {
  strings: Record<string, string>;
  lang: Lang;
  subjects: Subject[];
}) {
  const router = useRouter();
  // local copy so we can optimistically update count in parent; real data via router.refresh()
  const [subjects] = useState<Subject[]>(initialSubjects);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16,
      }}
    >
      {subjects.map((s) => (
        <SubjectCard
          key={s.id}
          subject={s}
          lang={lang}
          onDeleted={() => router.refresh()}
        />
      ))}
      <NewSubjectCard lang={lang} onCreated={() => router.refresh()} />
    </div>
  );
}
