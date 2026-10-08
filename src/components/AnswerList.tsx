import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type OptionDto = { letter: string; textFr: string; textEn: string | null; isCorrect: boolean };
type QuestionDto = {
  id: string;
  skillTag: string | null;
  textFr: string;
  textEn: string | null;
  options: OptionDto[];
};
export type AnswerListQuestion = QuestionDto & { remediation: { id: string } | null; followUps: QuestionDto[] };
export type AnswerListAnswer = { chosenLetter: string | null; isCorrect: boolean };

const loc = (lang: Lang, fr: string, en: string | null) => (lang === "en" && en ? en : fr);

function StatusBadge({ answer, lang }: { answer: AnswerListAnswer | undefined; lang: Lang }) {
  if (!answer || answer.chosenLetter == null) {
    return <span className="badge badge--draft">{t("students.noAnswer", lang)}</span>;
  }
  return answer.isCorrect ? (
    <span className="badge badge--published">✓ {t("students.correct", lang)}</span>
  ) : (
    <span className="badge badge--danger">✗ {t("students.incorrect", lang)}</span>
  );
}

function Options({
  question,
  answer,
  lang,
}: {
  question: QuestionDto;
  answer: AnswerListAnswer | undefined;
  lang: Lang;
}) {
  return (
    <div className="col" style={{ gap: 6 }}>
      {question.options.map((o) => {
        const chosen = answer?.chosenLetter === o.letter;
        const bg = o.isCorrect
          ? "var(--success-bg)"
          : chosen
          ? "var(--danger-bg)"
          : "transparent";
        const border = o.isCorrect
          ? "rgba(34,197,94,0.4)"
          : chosen
          ? "rgba(239,68,68,0.4)"
          : "var(--border)";
        return (
          <div
            key={o.letter}
            className="row"
            style={{
              gap: 10,
              padding: "8px 12px",
              borderRadius: 10,
              border: `1px solid ${border}`,
              background: bg,
              fontSize: 14,
            }}
          >
            <span style={{ fontWeight: 700, minWidth: 18 }}>{o.letter}</span>
            <span style={{ flex: 1 }} dangerouslySetInnerHTML={{ __html: loc(lang, o.textFr, o.textEn) }} />
            {chosen && (
              <span className="muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                ← {t("students.studentAnswer", lang)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AnswerList({
  questions,
  answers,
  lang,
}: {
  questions: AnswerListQuestion[];
  answers: Record<string, AnswerListAnswer>;
  lang: Lang;
}) {
  return (
    <div className="col" style={{ gap: 14 }}>
      {questions.map((q, idx) => {
        const answer = answers[q.id];
        // Follow-ups show under a wrong answer that has a remediation; list
        // every one the student was given, answered or not.
        const offered = answer && !answer.isCorrect && q.remediation != null;
        const followUps = q.followUps.filter((fu) => offered || answers[fu.id]);
        const followUpsCorrect = followUps.filter((fu) => answers[fu.id]?.isCorrect).length;
        return (
          <div key={q.id} id={`q-${idx + 1}`} className="card" style={{ padding: 20, scrollMarginTop: 24 }}>
            <div className="row" style={{ gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <span className="badge badge--grade">Q{idx + 1}</span>
              <StatusBadge answer={answer} lang={lang} />
              {followUps.length > 0 && (
                <span className="badge badge--draft numeric">
                  {t("students.followUpScore", lang)} {followUpsCorrect}/{followUps.length}
                </span>
              )}
              {q.skillTag && (
                <span className="muted" style={{ fontSize: 12 }}>
                  {q.skillTag}
                </span>
              )}
            </div>
            <div
              style={{ fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}
              dangerouslySetInnerHTML={{ __html: loc(lang, q.textFr, q.textEn) }}
            />
            <Options question={q} answer={answer} lang={lang} />

            {followUps.map((fu) => (
              <div
                key={fu.id}
                style={{
                  marginTop: 14,
                  paddingLeft: 14,
                  borderLeft: "2px solid var(--border)",
                }}
              >
                <div className="row" style={{ gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <span className="eyebrow" style={{ fontSize: 11 }}>
                    {t("students.followUp", lang)}
                  </span>
                  <StatusBadge answer={answers[fu.id]} lang={lang} />
                </div>
                <div
                  style={{ fontWeight: 500, marginBottom: 10, lineHeight: 1.5 }}
                  dangerouslySetInnerHTML={{ __html: loc(lang, fu.textFr, fu.textEn) }}
                />
                <Options question={fu} answer={answers[fu.id]} lang={lang} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
