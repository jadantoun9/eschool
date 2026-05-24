"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubjectsClient({
  subjects, grades,
}: {
  subjects: { id: string; name: string; quizCount: number }[];
  grades: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [subj, setSubj] = useState("");
  const [grade, setGrade] = useState("");

  async function addSubj() {
    if (!subj.trim()) return;
    await fetch("/api/subjects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: subj.trim() }) });
    setSubj("");
    router.refresh();
  }
  async function addGrade() {
    if (!grade.trim()) return;
    await fetch("/api/grades", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: grade.trim() }) });
    setGrade("");
    router.refresh();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Mes matières</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {subjects.map((s) => (
            <li key={s.id} style={{ padding: "6px 0", borderBottom: "1px solid var(--g100)", display: "flex", justifyContent: "space-between" }}>
              <span>{s.name}</span>
              <span style={{ color: "var(--g400)", fontSize: 12 }}>{s.quizCount} fiche(s)</span>
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <input value={subj} onChange={(e) => setSubj(e.target.value)} placeholder="Nouvelle matière" />
          <button className="btn-sm" onClick={addSubj}>+</button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Niveaux (partagés)</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {grades.map((g) => (
            <li key={g.id} style={{ padding: "6px 0", borderBottom: "1px solid var(--g100)" }}>{g.name}</li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Ex : Seconde, Première S" />
          <button className="btn-sm" onClick={addGrade}>+</button>
        </div>
      </div>
    </div>
  );
}
