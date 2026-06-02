"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";
import type { Lang } from "@/lib/i18n";

type Subject = { id: string; nameFr: string; nameEn: string };
type Grade = { id: string; nameFr: string; nameEn: string };

export default function NewQuizForm({
  strings,
  lang,
  subjects,
  grades,
  preSubjectId,
  preGradeId,
}: {
  strings: Record<string, string>;
  lang: Lang;
  subjects: Subject[];
  grades: Grade[];
  preSubjectId: string;
  preGradeId: string;
}) {
  const s = strings;
  const router = useRouter();
  const [titleFr, setTitleFr] = useState("");
  const [subjectId, setSubjectId] = useState(preSubjectId);
  const [gradeId, setGradeId] = useState(preGradeId);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const nameOf = (x: Subject | Grade) => (lang === "fr" ? x.nameFr : x.nameEn);

  async function create() {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ titleFr, subjectId, gradeId }),
    });
    if (!res.ok) {
      setBusy(false);
      setErr((await res.json()).error ?? "Error");
      return;
    }
    const { id } = await res.json();
    router.push(`/admin/quizzes/${id}/edit`);
  }

  const canSubmit = !busy && titleFr.trim() && subjectId && gradeId;

  return (
    <div className="card" style={{ padding: 32 }}>
      <div className="field">
        <label className="field__label" htmlFor="titleFr">
          {s["quiz.titleFr"]}
        </label>
        <input
          id="titleFr"
          className="input"
          value={titleFr}
          onChange={(e) => setTitleFr(e.target.value)}
        />
      </div>

      <div className="grid grid--2">
        <div className="field">
          <label className="field__label" htmlFor="subject">
            {s["quiz.subject"]}
          </label>
          <select
            id="subject"
            className="select"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">{s["quiz.subjectPlaceholder"] ?? "—"}</option>
            {subjects.map((x) => (
              <option key={x.id} value={x.id}>
                {nameOf(x)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="grade">
            {s["quiz.grade"]}
          </label>
          <select
            id="grade"
            className="select"
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
          >
            <option value="">{s["quiz.gradePlaceholder"] ?? "—"}</option>
            {grades.map((x) => (
              <option key={x.id} value={x.id}>
                {nameOf(x)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {err && (
        <div className="field__error" style={{ marginBottom: 18 }}>
          {err}
        </div>
      )}

      <div
        style={{
          borderTop: "1px solid var(--border)",
          marginTop: 12,
          paddingTop: 20,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 12,
        }}
      >
        <a href="/admin/quizzes/new" className="btn btn--ghost">
          {lang === "fr" ? "Changer de méthode" : "Change method"}
        </a>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!canSubmit}
          onClick={create}
        >
          {busy ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Spinner size={16} /> {s["quiz.creating"]}
            </span>
          ) : (
            <>
              {s["quiz.create"]} <span aria-hidden>→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
