"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string };

export default function NewQuizForm({ subjects, grades }: { subjects: Item[]; grades: Item[] }) {
  const router = useRouter();
  const [titleFr, setTitleFr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [gradeId, setGradeId] = useState(grades[0]?.id ?? "");
  const [newSubject, setNewSubject] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function addSubject() {
    if (!newSubject.trim()) return;
    const res = await fetch("/api/subjects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: newSubject.trim() }) });
    if (res.ok) { const s = await res.json(); subjects.push(s); setSubjectId(s.id); setNewSubject(""); }
  }
  async function addGrade() {
    if (!newGrade.trim()) return;
    const res = await fetch("/api/grades", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: newGrade.trim() }) });
    if (res.ok) { const g = await res.json(); grades.push(g); setGradeId(g.id); setNewGrade(""); }
  }

  async function create() {
    setBusy(true); setErr(null);
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ titleFr, titleEn: titleEn || null, subjectId, gradeId }),
    });
    setBusy(false);
    if (!res.ok) { setErr((await res.json()).error ?? "Erreur"); return; }
    const { id } = await res.json();
    router.push(`/admin/quizzes/${id}/edit`);
  }

  return (
    <div className="card">
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Titre (FR)</label>
        <input value={titleFr} onChange={(e) => setTitleFr(e.target.value)} placeholder="Ex : Triangles Congruents SAS" />
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Titre (EN, optionnel)</label>
        <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
      </div>

      <div className="name-grid" style={{ marginBottom: 12 }}>
        <div className="field">
          <label>Matière</label>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input placeholder="Nouvelle matière" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
            <button type="button" className="btn-sm" onClick={addSubject}>+</button>
          </div>
        </div>
        <div className="field">
          <label>Niveau</label>
          <select value={gradeId} onChange={(e) => setGradeId(e.target.value)}>
            {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input placeholder="Nouveau niveau" value={newGrade} onChange={(e) => setNewGrade(e.target.value)} />
            <button type="button" className="btn-sm" onClick={addGrade}>+</button>
          </div>
        </div>
      </div>

      {err && <div style={{ color: "var(--red)", marginBottom: 12, fontSize: 13 }}>{err}</div>}

      <button className="btn-primary" disabled={busy || !titleFr.trim() || !subjectId || !gradeId} onClick={create}>
        {busy ? "Création…" : "Créer et continuer"}
      </button>
    </div>
  );
}
