import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { scoreColor, scorePct } from "@/lib/students";

type SummaryPart = { id: string; titleFr: string; titleEn: string | null };
type SummaryQuestion = { id: string; partId: string | null; skillTag: string | null };
type SummaryAnswer = { chosenLetter: string | null; isCorrect: boolean };

const loc = (lang: Lang, fr: string, en: string | null) => (lang === "en" && en ? en : fr);

// Skill tags are snake_case ids ("sign_rule_identification"); show them as words.
function skillLabel(tag: string): string {
  const words = tag.replace(/[_-]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function barColor(pct: number): string {
  return pct >= 80 ? "var(--success)" : pct >= 60 ? "var(--accent)" : "var(--danger)";
}

const headingStyle = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase" as const,
  color: "var(--text-muted)",
  marginBottom: 12,
};

function SkillChips({
  items,
  tone,
  emptyLabel,
}: {
  items: { number: number; label: string | null }[];
  tone: "good" | "bad";
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <p className="muted" style={{ fontSize: 13 }}>
        {emptyLabel}
      </p>
    );
  }
  const color = tone === "good" ? "#86efac" : "#fca5a5";
  const bg = tone === "good" ? "var(--success-bg)" : "var(--danger-bg)";
  const border = tone === "good" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)";
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((it) => (
        <a
          key={it.number}
          href={`#q-${it.number}`}
          style={{
            display: "inline-flex",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 999,
            border: `1px solid ${border}`,
            background: bg,
            color,
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          <span style={{ fontWeight: 700 }}>Q{it.number}</span>
          {it.label && <span>{it.label}</span>}
        </a>
      ))}
    </div>
  );
}

// Teacher-facing overview of one submission: score per part, the strongest
// and weakest part, and which skills the student got right or wrong. Only
// main questions count, matching how the score itself is graded.
export function SubmissionSummary({
  parts,
  questions,
  answers,
  lang,
}: {
  parts: SummaryPart[];
  questions: SummaryQuestion[];
  answers: Record<string, SummaryAnswer>;
  lang: Lang;
}) {
  const items = questions.map((q, idx) => ({
    number: idx + 1,
    label: q.skillTag ? skillLabel(q.skillTag) : null,
    partId: q.partId,
    isCorrect: answers[q.id]?.isCorrect ?? false,
  }));
  const strengths = items.filter((it) => it.isCorrect);
  const weaknesses = items.filter((it) => !it.isCorrect);

  const partStats = parts
    .map((p) => {
      const inPart = items.filter((it) => it.partId === p.id);
      const correct = inPart.filter((it) => it.isCorrect).length;
      return { id: p.id, title: loc(lang, p.titleFr, p.titleEn), correct, total: inPart.length, pct: scorePct(correct, inPart.length) };
    })
    .filter((p) => p.total > 0);

  // Ties go to the earlier part for "strongest" and the later one for "weakest".
  let best = partStats[0];
  let worst = partStats[0];
  for (const p of partStats) {
    if (p.pct > best.pct) best = p;
    if (p.pct <= worst.pct) worst = p;
  }
  const showHighlights = partStats.length > 1 && best.pct !== worst.pct;

  return (
    <div className="card card--flush" style={{ padding: 24, marginBottom: 24 }}>
      <div style={{ ...headingStyle, marginBottom: 18 }}>{t("students.summary", lang)}</div>

      {partStats.length > 1 && (
        <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 18 }}>
          {showHighlights ? (
            <>
              <span className="muted">{t("students.strongestPart", lang)}:</span>{" "}
              <strong>{best.title}</strong>{" "}
              <span className="numeric" style={{ color: scoreColor(best.pct) }}>({best.pct}%)</span>
              <br />
              <span className="muted">{t("students.weakestPart", lang)}:</span>{" "}
              <strong>{worst.title}</strong>{" "}
              <span className="numeric" style={{ color: scoreColor(worst.pct) }}>({worst.pct}%)</span>
            </>
          ) : (
            <span className="muted">{t("students.evenAcrossParts", lang)}</span>
          )}
        </p>
      )}

      {partStats.length > 0 && (
        <div className="col" style={{ gap: 12, marginBottom: 24 }}>
          {partStats.map((p) => (
            <div key={p.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontWeight: 500, minWidth: 0 }}>{p.title}</span>
                <span className="numeric" style={{ whiteSpace: "nowrap" }}>
                  <span className="muted">
                    {p.correct}/{p.total}
                  </span>{" "}
                  <span style={{ fontWeight: 600, color: scoreColor(p.pct) }}>{p.pct}%</span>
                </span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
                <span
                  style={{
                    display: "block",
                    height: "100%",
                    borderRadius: 999,
                    width: `${p.pct}%`,
                    background: barColor(p.pct),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
        <div>
          <div style={headingStyle}>
            {t("students.strengths", lang)} · <span className="numeric">{strengths.length}</span>
          </div>
          <SkillChips items={strengths} tone="good" emptyLabel={t("students.noStrengths", lang)} />
        </div>
        <div>
          <div style={headingStyle}>
            {t("students.weaknesses", lang)} · <span className="numeric">{weaknesses.length}</span>
          </div>
          <SkillChips items={weaknesses} tone="bad" emptyLabel={t("students.noWeaknesses", lang)} />
        </div>
      </div>
    </div>
  );
}
