"use client";

import Link from "next/link";
import { useState } from "react";

export type BreakdownQuestion = {
  id: string;
  number: number;
  text: string;
  options: Record<string, string>;
  correctLetter: string | null;
};

export type BreakdownStudent = {
  submissionId: string;
  studentKey: string;
  name: string;
  cls: string | null;
  score: number;
  total: number;
  answers: Record<string, { chosenLetter: string | null; isCorrect: boolean }>;
};

type Labels = {
  correctAnswer: string;
  noAnswer: string;
  overall: string;
  correct: string;
  chose: string;
  hint: string;
};

const GRID = "1fr 64px 80px";

function pctColor(pct: number) {
  return pct >= 80 ? "#86efac" : pct >= 60 ? "var(--accent)" : "#fca5a5";
}

export function SkillBreakdownRow({
  skill,
  correct,
  total,
  questions,
  students,
  labels,
  isLast,
}: {
  skill: string;
  correct: number;
  total: number;
  questions: BreakdownQuestion[];
  students: BreakdownStudent[];
  labels: Labels;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);

  const pct = Math.round((correct / Math.max(1, total)) * 100);
  const tier = pct >= 70 ? "good" : pct >= 50 ? "mid" : "bad";
  const barColor = tier === "good" ? "var(--success)" : tier === "mid" ? "var(--accent)" : "var(--danger)";
  const textColor = tier === "bad" ? "#fca5a5" : "#fff";

  // Students who missed something in this skill come first.
  const allCorrect = (s: BreakdownStudent) => questions.every((q) => s.answers[q.id]?.isCorrect);
  const sorted = [...students].sort(
    (a, b) => Number(allCorrect(a)) - Number(allCorrect(b)) || a.name.localeCompare(b.name)
  );

  return (
    <div style={{ borderBottom: isLast ? undefined : "1px solid var(--border)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: GRID,
          gap: 12,
          alignItems: "start",
          padding: "12px 0",
          fontSize: 13,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ marginBottom: 6, fontWeight: 500 }}>{skill}</div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", borderRadius: 999, width: `${pct}%`, background: barColor }} />
          </div>
          <div className="col" style={{ gap: 4, marginTop: 8 }}>
            {questions.map((q) => (
              <div key={q.id} className="muted" style={{ fontSize: 12, lineHeight: 1.45 }}>
                <span style={{ fontWeight: 700, marginRight: 6 }}>Q{q.number}</span>
                <span dangerouslySetInnerHTML={{ __html: q.text }} />
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          title={labels.hint}
          className="numeric"
          style={{
            justifySelf: "end",
            padding: "3px 8px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: open ? "var(--surface-2)" : "var(--surface)",
            color: "#fff",
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {correct}/{total} <span style={{ fontSize: 10, opacity: 0.7 }}>{open ? "▴" : "▾"}</span>
        </button>
        <div className="numeric" style={{ textAlign: "right", fontWeight: 600, color: textColor, paddingTop: 3 }}>
          {pct}%
        </div>
      </div>

      {open && (
        <div
          style={{
            margin: "0 0 14px",
            padding: 16,
            borderRadius: 12,
            background: "rgba(0,0,0,0.18)",
            border: "1px solid var(--border)",
            fontSize: 13,
          }}
        >
          {questions.map((q) => (
            <div key={q.id} style={{ marginBottom: 10 }}>
              <span className="muted">
                {questions.length > 1 ? `Q${q.number} · ` : ""}
                {labels.correctAnswer}:
              </span>{" "}
              {q.correctLetter ? (
                <span style={{ color: "#86efac", fontWeight: 600 }}>
                  {q.correctLetter}.{" "}
                  <span dangerouslySetInnerHTML={{ __html: q.options[q.correctLetter] ?? "" }} />
                </span>
              ) : (
                "—"
              )}
            </div>
          ))}

          <div className="col" style={{ gap: 0 }}>
            {sorted.map((s, i) => {
              const overall = Math.round((s.score / Math.max(1, s.total)) * 100);
              return (
                <div
                  key={s.submissionId}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    padding: "10px 0",
                    borderTop: i === 0 ? "1px solid var(--border)" : undefined,
                    borderBottom: i < sorted.length - 1 ? "1px solid var(--border)" : undefined,
                  }}
                >
                  <div style={{ minWidth: 0, flex: "1 1 260px" }}>
                    <Link
                      href={`/admin/students/${s.studentKey}/${s.submissionId}`}
                      style={{ fontWeight: 600 }}
                    >
                      {s.name}
                    </Link>
                    {s.cls && <span className="muted"> · {s.cls}</span>}
                    {questions.map((q) => {
                      const a = s.answers[q.id];
                      const prefix = questions.length > 1 ? `Q${q.number} · ` : "";
                      if (a?.isCorrect) {
                        return (
                          <div key={q.id} style={{ color: "#86efac", marginTop: 3 }}>
                            {prefix}✓ {labels.correct}
                          </div>
                        );
                      }
                      return (
                        <div key={q.id} style={{ color: "#fca5a5", marginTop: 3 }}>
                          {prefix}✗{" "}
                          {a?.chosenLetter ? (
                            <>
                              {labels.chose}: {a.chosenLetter}.{" "}
                              <span dangerouslySetInnerHTML={{ __html: q.options[a.chosenLetter] ?? "" }} />
                            </>
                          ) : (
                            labels.noAnswer
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div className="muted" style={{ fontSize: 11 }}>
                      {labels.overall}
                    </div>
                    <div className="numeric" style={{ fontWeight: 700, color: pctColor(overall) }}>
                      {s.score}/{s.total} · {overall}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
