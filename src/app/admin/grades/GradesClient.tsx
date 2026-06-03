"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmDialog";
import { t, type Lang } from "@/lib/i18n";

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
      description: t("grades.deleteDescription", lang),
      confirmText: t("grades.delete", lang),
      cancelText: t("grades.cancel", lang),
      // Runs inside the dialog: button shows a spinner and the dialog stays
      // open until the request resolves.
      onConfirm: async () => {
        const res = await fetch(`/api/grades/${g.id}`, { method: "DELETE" });
        if (!res.ok) {
          const msg = (await res.json().catch(() => null))?.error;
          toast.error(
            msg ?? t("grades.deleteFailed", lang)
          );
          // Throw so the dialog stays open after a failed delete.
          throw new Error(msg ?? "delete failed");
        }
        toast.success(t("grades.gradeDeleted", lang));
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
            🎓 {t("grades.catalogue", lang)}
          </div>
          <h1 className="h1" style={{ marginBottom: 6 }}>
            {t("grades.title", lang)}
          </h1>
          <p className="muted">
            {t("grades.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Grade list table */}
      {grades.length > 0 ? (
        <table className="table" style={{ marginBottom: 24 }}>
          <thead>
            <tr>
              <th>#</th>
              <th>{t("grades.colSlug", lang)}</th>
              <th>{t("grades.colNameFr", lang)}</th>
              <th>{t("grades.colNameEn", lang)}</th>
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
                      title={t("grades.delete", lang)}
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
            {t("grades.noGrades", lang)}
          </p>
        </div>
      )}

      {/* Add grade form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="h3" style={{ marginBottom: 20 }}>
          {t("grades.addGrade", lang)}
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
              placeholder={t("grades.slugPlaceholder", lang)}
            />
            <span className="field__hint">
              {t("grades.slugHint", lang)}
            </span>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field__label">
              {t("grades.frenchName", lang)}
            </label>
            <input
              className="input"
              value={nameFr}
              onChange={(e) => setNameFr(e.target.value)}
              placeholder={t("grades.frenchNamePlaceholder", lang)}
            />
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field__label">
              {t("grades.englishName", lang)}
            </label>
            <input
              className="input"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder={t("grades.englishNamePlaceholder", lang)}
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
          {busy ? t("grades.creating", lang) : t("grades.createGrade", lang)}
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
              {t("grades.aboutDualLabels", lang)}
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
