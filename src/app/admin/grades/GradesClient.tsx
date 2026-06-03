"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmDialog";
import type { Lang } from "@/lib/i18n";

type Grade = { id: string; slug: string; nameFr: string; nameEn: string; order: number };

export default function GradesClient({
  lang,
  grades,
}: {
  lang: Lang;
  grades: Grade[];
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [slug, setSlug] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/grades", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, nameFr, nameEn }),
    });
    setBusy(false);
    if (!res.ok) {
      setErr((await res.json()).error ?? "Error");
      return;
    }
    setSlug("");
    setNameFr("");
    setNameEn("");
    router.refresh();
  }

  async function deleteGrade(g: Grade) {
    await confirm({
      title:
        lang === "fr"
          ? `Supprimer « ${g.nameFr} » ?`
          : `Delete "${g.nameEn}"?`,
      description:
        lang === "fr"
          ? "Cette action est définitive. Un niveau utilisé par des fiches ne peut pas être supprimé."
          : "This action is permanent. A grade used by existing worksheets cannot be deleted.",
      confirmText: lang === "fr" ? "Supprimer" : "Delete",
      cancelText: lang === "fr" ? "Annuler" : "Cancel",
      // Runs inside the dialog: button shows a spinner and the dialog stays
      // open until the request resolves.
      onConfirm: async () => {
        const res = await fetch(`/api/grades/${g.id}`, { method: "DELETE" });
        if (!res.ok) {
          const msg = (await res.json().catch(() => null))?.error;
          toast.error(
            msg ?? (lang === "fr" ? "Échec de la suppression." : "Failed to delete.")
          );
          // Throw so the dialog stays open after a failed delete.
          throw new Error(msg ?? "delete failed");
        }
        toast.success(lang === "fr" ? "Niveau supprimé." : "Grade deleted.");
        router.refresh();
      },
    });
  }

  return (
    <>
      {/* Page header */}
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            🎓 {lang === "fr" ? "Catalogue" : "Catalogue"}
          </div>
          <h1 className="h1" style={{ marginBottom: 6 }}>
            {lang === "fr" ? "Niveaux" : "Grade levels"}
          </h1>
          <p className="muted">
            {lang === "fr"
              ? "Les niveaux que ton école couvre. Les libellés anglais et français sont affichés aux élèves."
              : "The grade levels your school covers. Both English and French labels are shown to students."}
          </p>
        </div>
      </div>

      {/* Grade list table */}
      {grades.length > 0 ? (
        <table className="table" style={{ marginBottom: 24 }}>
          <thead>
            <tr>
              <th>#</th>
              <th>{lang === "fr" ? "Slug" : "Slug"}</th>
              <th>{lang === "fr" ? "Nom (FR)" : "Name (FR)"}</th>
              <th>{lang === "fr" ? "Nom (EN)" : "Name (EN)"}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => (
              <tr key={g.id}>
                <td>
                  <span
                    className="numeric"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 22,
                      color: "var(--accent)",
                      lineHeight: 1,
                    }}
                  >
                    {g.order || g.slug}
                  </span>
                </td>
                <td>
                  <span className="badge badge--grade">{g.slug}</span>
                </td>
                <td style={{ fontWeight: 500 }}>{g.nameFr}</td>
                <td style={{ color: "var(--text-muted)" }}>{g.nameEn}</td>
                <td>
                  <div className="table__actions">
                    <button
                      className="icon-btn icon-btn--danger"
                      title={lang === "fr" ? "Supprimer" : "Delete"}
                      onClick={() => deleteGrade(g)}
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
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state" style={{ marginBottom: 24 }}>
          <div className="empty-state__icon">🎓</div>
          <p className="muted" style={{ marginTop: 8 }}>
            {lang === "fr" ? "Aucun niveau pour l'instant." : "No grade levels yet."}
          </p>
        </div>
      )}

      {/* Add grade form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="h3" style={{ marginBottom: 20 }}>
          {lang === "fr" ? "Ajouter un niveau" : "Add grade"}
        </h2>

        <div className="grid grid--3" style={{ gap: 16, marginBottom: 18 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field__label">Slug</label>
            <input
              className="input"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              placeholder={lang === "fr" ? "ex. 6, 7, 12" : "e.g. 6, 7, 12"}
            />
            <span className="field__hint">
              {lang === "fr" ? "Identifiant unique (URL)" : "Unique identifier (URL)"}
            </span>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field__label">
              {lang === "fr" ? "Nom en français" : "French name"}
            </label>
            <input
              className="input"
              value={nameFr}
              onChange={(e) => setNameFr(e.target.value)}
              placeholder={lang === "fr" ? "ex. Sixième" : "e.g. Sixième"}
            />
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field__label">
              {lang === "fr" ? "Nom en anglais" : "English name"}
            </label>
            <input
              className="input"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder={lang === "fr" ? "ex. Grade 6" : "e.g. Grade 6"}
            />
          </div>
        </div>

        {err && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              background: "var(--danger-bg)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "var(--radius)",
              color: "#fca5a5",
              fontSize: 13,
            }}
          >
            {err}
          </div>
        )}

        <button
          className="btn btn--primary btn--sm"
          disabled={busy || !slug || !nameFr || !nameEn}
          onClick={create}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          {busy
            ? lang === "fr"
              ? "Création…"
              : "Creating…"
            : lang === "fr"
            ? "Créer le niveau"
            : "Create grade"}
        </button>
      </div>

      {/* Info tip */}
      <div
        className="card"
        style={{
          background: "rgba(96,165,250,0.06)",
          border: "1px solid rgba(96,165,250,0.18)",
        }}
      >
        <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {lang === "fr"
                ? "À propos des libellés bilingues"
                : "About the dual labels"}
            </div>
            <div className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
              {lang === "fr" ? (
                <>
                  La colonne française suit le système collège/lycée (6ᵉ → Tᵉ). Les
                  élèves voient le libellé correspondant à leur langue ; les enseignants
                  voient les deux côté admin.
                </>
              ) : (
                <>
                  The French column uses the standard <i>collège</i>/<i>lycée</i>{" "}
                  system (6ᵉ → Tᵉ). Students see the label matching their selected
                  language; teachers see both in admin views.
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 48 }} />
    </>
  );
}
