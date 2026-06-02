"use client";

import { useEffect, useMemo, useState } from "react";
import { MathJaxContext, MathJax } from "better-react-mathjax";
import { Skeleton } from "@/components/Skeleton";
import type { Lang, SubmitResponse } from "@/types/quiz";

type PublicQuestion = {
  id: string;
  partId: string | null;
  order: number;
  text: string;
  hint: string | null;
  options: { id: string; letter: string; text: string }[];
  hasRemediation: boolean;
};

type PublicPart = { id: string; order: number; title: string; subtitle: string | null };

type PublicPrelim = {
  badge: string;
  title: string;
  description: string;
  url: string | null;
  embedUrl: string | null;
};

type PublicQuiz = {
  slug: string;
  title: string;
  subject: string;
  grade: string;
  parts: PublicPart[];
  prelim: PublicPrelim | null;
  questions: PublicQuestion[];
};

type Stage = "form" | "results";

const mathJaxConfig = {
  tex: { inlineMath: [["\\(", "\\)"], ["$", "$"]] },
  startup: { typeset: true },
};

export default function QuizClient({ slug }: { slug: string }) {
  const [lang, setLang] = useState<Lang>("fr");
  const [quiz, setQuiz] = useState<PublicQuiz | null>(null);
  const [loading, setLoading] = useState(true);

  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [stage, setStage] = useState<Stage>("form");
  // Wizard position: 0 = identity/intro screen, 1..N = question N (one per screen).
  const [step, setStep] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/public/quiz/${slug}?lang=${lang}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
      .then((data: PublicQuiz) => { if (!cancelled) setQuiz(data); })
      .catch(() => { if (!cancelled) setError("Quiz introuvable."); })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [slug, lang]);

  const progress = useMemo(() => {
    if (!quiz) return 0;
    const answered = quiz.questions.filter((q) => answers[q.id]).length;
    return Math.round((answered / Math.max(1, quiz.questions.length)) * 100);
  }, [quiz, answers]);

  const answeredCount = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.filter((q) => answers[q.id]).length;
  }, [quiz, answers]);

  const canSubmit = !!quiz && studentName.trim().length > 0;

  // Group questions by partId (preserving part order; unparted go last).
  const groupedQuestions = useMemo(() => {
    if (!quiz) return [];
    type Group = { part: PublicPart | null; questions: PublicQuestion[] };
    const groups: Group[] = quiz.parts.map((p) => ({ part: p, questions: [] }));
    const orphan: Group = { part: null, questions: [] };
    const partIndex = new Map(quiz.parts.map((p, i) => [p.id, i]));
    for (const q of quiz.questions) {
      const idx = q.partId ? partIndex.get(q.partId) : undefined;
      if (idx !== undefined) groups[idx].questions.push(q);
      else orphan.questions.push(q);
    }
    if (orphan.questions.length) groups.push(orphan);
    return groups.filter((g) => g.questions.length > 0);
  }, [quiz]);

  // Flatten into a single ordered list (one question per wizard screen), each
  // carrying its part title for the screen's eyebrow label.
  const flatQuestions = useMemo(() => {
    const list: { q: PublicQuestion; partTitle: string }[] = [];
    for (const g of groupedQuestions) {
      const pt = g.part ? g.part.title : lang === "fr" ? "Questions" : "Questions";
      for (const q of g.questions) list.push({ q, partTitle: pt });
    }
    return list;
  }, [groupedQuestions, lang]);

  async function handleSubmit() {
    if (!quiz || !canSubmit) return;

    // If any question is unanswered, jump to the first one instead of submitting.
    const missingIdx = flatQuestions.findIndex(({ q }) => !answers[q.id]);
    if (missingIdx >= 0) {
      setStep(missingIdx + 1);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/public/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: quiz.slug,
          studentName: studentName.trim(),
          studentClass: studentClass.trim(),
          language: lang,
          answers: quiz.questions.map((q) => ({
            questionId: q.id,
            chosenLetter: answers[q.id] ?? null,
          })),
          followUpAnswers: Object.entries(followUpAnswers).map(([qid, letter]) => ({
            questionId: qid,
            chosenLetter: letter,
          })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur");
      const data: SubmitResponse = await res.json();
      setResult(data);
      setStage("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <div aria-busy="true" aria-label="Loading">
        <Skeleton w={140} h={13} r={6} />
        <Skeleton w="70%" h={34} r={8} style={{ marginTop: 12 }} />
        <Skeleton w="100%" h={6} r={999} style={{ marginTop: 24 }} />
        {Array.from({ length: 2 }).map((_, c) => (
          <div key={c} className="card" style={{ marginTop: 20 }}>
            <Skeleton w={110} h={22} r={999} />
            <Skeleton w="85%" h={18} r={6} style={{ marginTop: 16 }} />
            <Skeleton w="60%" h={18} r={6} style={{ marginTop: 8 }} />
            <div className="col" style={{ gap: 10, marginTop: 18 }}>
              {Array.from({ length: 4 }).map((_, o) => (
                <div
                  key={o}
                  className="row"
                  style={{
                    gap: 14,
                    padding: "16px 18px",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    background: "var(--surface)",
                  }}
                >
                  <Skeleton w={32} h={32} r={8} />
                  <Skeleton w={`${50 + ((o * 13) % 35)}%`} h={15} r={6} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  if (!quiz)
    return (
      <div className="empty-state">
        <div className="empty-state__icon">📄</div>
        <div className="h3" style={{ color: "#fff" }}>{error ?? "Quiz introuvable."}</div>
      </div>
    );

  return (
    <MathJaxContext config={mathJaxConfig}>
      {/* Header — breadcrumbs + progress + language toggle */}
      <div className="qp__head">
        <div className="qp__crumbs">
          <span>{quiz.subject}</span>
          <ChevronRight />
          <span>{quiz.grade}</span>
          <ChevronRight />
          <span style={{ color: "#fff" }}>{quiz.title}</span>
        </div>
        <div className="row" style={{ gap: 16, flexShrink: 0 }}>
          {stage === "form" && (
            <div className="qp__progress">
              <div className="qp__progress-row">
                <span>{lang === "fr" ? "Progression" : "Progress"}</span>
                <span className="numeric">
                  <b style={{ color: "#fff" }}>{answeredCount}</b> / {quiz.questions.length}
                </span>
              </div>
              <div className="progress">
                <div className="progress__fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <div className="row" style={{ gap: 6 }}>
            <button
              className={`btn btn--sm ${lang === "fr" ? "btn--primary" : "btn--ghost"}`}
              onClick={() => setLang("fr")}
            >
              FR
            </button>
            <button
              className={`btn btn--sm ${lang === "en" ? "btn--primary" : "btn--ghost"}`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {stage === "form" && (() => {
        const total = flatQuestions.length;

        // ---- Intro / identity screen (step 0) ----
        if (step === 0) {
          return (
            <MathJax dynamic>
              {quiz.prelim && <PrelimCard prelim={quiz.prelim} lang={lang} />}
              <div className="qp__card">
                <div className="qp__part">{lang === "fr" ? "Avant de commencer" : "Before you begin"}</div>
                <div className="qp__q">{quiz.title}</div>
                <p className="muted" style={{ marginTop: -14, marginBottom: 26, fontSize: 14.5 }}>
                  {lang === "fr"
                    ? `${total} question${total > 1 ? "s" : ""} · une par écran. Tes réponses sont évaluées à la fin.`
                    : `${total} question${total > 1 ? "s" : ""} · one per screen. Your answers are graded at the end.`}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 16,
                  }}
                >
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="field__label">{lang === "fr" ? "Nom complet" : "Full name"}</label>
                    <input
                      className="input"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder={lang === "fr" ? "Ex : Marie Dupont" : "Ex: Marie Dupont"}
                    />
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="field__label">{lang === "fr" ? "Classe (optionnel)" : "Class (optional)"}</label>
                    <input
                      className="input"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      placeholder={lang === "fr" ? "Ex : 2nde A" : "Ex: 10A"}
                    />
                  </div>
                </div>
                <div className="qp__nav">
                  <span className="muted" style={{ fontSize: 13 }}>
                    {studentName.trim()
                      ? lang === "fr" ? "Prêt quand tu l'es" : "Ready when you are"
                      : lang === "fr" ? "Entre ton nom pour commencer" : "Enter your name to begin"}
                  </span>
                  <button className="btn btn--primary" disabled={!studentName.trim()} onClick={() => setStep(1)}>
                    {lang === "fr" ? "Commencer" : "Start"} <ChevronRight />
                  </button>
                </div>
              </div>
            </MathJax>
          );
        }

        // ---- One question per screen (steps 1..N) ----
        const idx = step - 1;
        const current = flatQuestions[idx];
        if (!current) return null;
        const { q, partTitle } = current;
        const isLast = step === total;
        const answered = !!answers[q.id];

        return (
          <MathJax dynamic>
            <div className="qp__card">
              <div className="qp__part">{partTitle}</div>
              <div className="qp__q">
                <span style={{ color: "var(--accent)", marginRight: 10 }}>Q{step}.</span>
                <span dangerouslySetInnerHTML={{ __html: q.text }} />
              </div>
              {q.hint && (
                <div className="muted" style={{ fontSize: 13, marginTop: -16, marginBottom: 22 }}>
                  {lang === "fr" ? "Indice : " : "Hint: "}
                  <span dangerouslySetInnerHTML={{ __html: q.hint }} />
                </div>
              )}
              <div className="qp__options">
                {q.options.map((o) => {
                  const selected = answers[q.id] === o.letter;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      className={`quiz-option ${selected ? "quiz-option--selected" : ""}`}
                      onClick={() => setAnswers({ ...answers, [q.id]: o.letter })}
                    >
                      <span className="quiz-option__letter">{o.letter}</span>
                      <span className="quiz-option__text" dangerouslySetInnerHTML={{ __html: o.text }} />
                    </button>
                  );
                })}
              </div>

              {error && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 16,
                    borderRadius: "var(--radius)",
                    background: "var(--danger-bg)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    color: "#fca5a5",
                    fontSize: 14,
                  }}
                >
                  {error}
                </div>
              )}

              <div className="qp__nav">
                {step > 1 ? (
                  <button className="btn btn--ghost" onClick={() => setStep(step - 1)}>
                    <ChevronLeft /> {lang === "fr" ? "Précédent" : "Previous"}
                  </button>
                ) : (
                  <span className="muted" style={{ fontSize: 13 }}>
                    {answered
                      ? lang === "fr" ? "Tu peux changer ta réponse" : "You can change your answer"
                      : lang === "fr" ? "Choisis une réponse pour continuer" : "Pick one to continue"}
                  </span>
                )}

                {isLast ? (
                  <button
                    className="btn btn--primary"
                    disabled={!answered || submitting || !canSubmit}
                    onClick={handleSubmit}
                  >
                    {submitting
                      ? lang === "fr" ? "Envoi…" : "Submitting…"
                      : lang === "fr" ? "Soumettre mes réponses" : "Submit answers"}
                  </button>
                ) : (
                  <button className="btn btn--primary" disabled={!answered} onClick={() => setStep(step + 1)}>
                    {lang === "fr" ? "Question suivante" : "Next question"} <ChevronRight />
                  </button>
                )}
              </div>
            </div>
          </MathJax>
        );
      })()}

      {stage === "results" && result && (
        <ResultsView
          result={result}
          lang={lang}
          followUpAnswers={followUpAnswers}
          setFollowUpAnswers={setFollowUpAnswers}
        />
      )}

      <style>{`
        .qp__head { display: flex; justify-content: space-between; align-items: center; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
        .qp__crumbs { color: var(--text-muted); font-size: 13px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .qp__crumbs svg { opacity: 0.5; flex-shrink: 0; }
        .qp__progress { display: flex; flex-direction: column; gap: 6px; min-width: 180px; }
        .qp__progress-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); }
        .qp__card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 36px; position: relative; }
        .qp__part { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
        .qp__q { font-family: var(--font-display); font-weight: 700; font-size: 28px; line-height: 1.3; letter-spacing: -0.015em; margin-bottom: 28px; color: #fff; }
        .qp__options { display: flex; flex-direction: column; gap: 10px; }
        .qp__nav { display: flex; justify-content: space-between; align-items: center; margin-top: 28px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 600px) {
          .qp__card { padding: 24px; }
          .qp__q { font-size: 23px; }
        }
      `}</style>
    </MathJaxContext>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}
function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 4l-4 4 4 4" />
    </svg>
  );
}

function PrelimCard({ prelim, lang }: { prelim: PublicPrelim; lang: Lang }) {
  return (
    <div className="card" style={{ marginBottom: 20, padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          borderBottom: prelim.description ? "1px solid var(--border)" : undefined,
        }}
      >
        <div
          className="icon-chip icon-chip--accent"
          style={{ flexShrink: 0 }}
        >
          🔬
        </div>
        <div style={{ flex: 1 }}>
          {prelim.badge && (
            <div className="quiz-part-label" style={{ marginBottom: 4 }}>{prelim.badge}</div>
          )}
          <div className="h4" style={{ color: "#fff", lineHeight: 1.25 }}>{prelim.title}</div>
        </div>
        {prelim.url && (
          <a
            href={prelim.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost btn--sm"
            style={{ flexShrink: 0 }}
          >
            {lang === "fr" ? "Plein écran ↗" : "Fullscreen ↗"}
          </a>
        )}
      </div>
      {prelim.description && (
        <div className="muted" style={{ padding: "16px 24px", fontSize: 14 }}>
          {prelim.description}
        </div>
      )}
      <style>{`.quiz-part-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }`}</style>
    </div>
  );
}

function ResultsView({
  result,
  lang,
  followUpAnswers,
  setFollowUpAnswers,
}: {
  result: SubmitResponse;
  lang: Lang;
  followUpAnswers: Record<string, string>;
  setFollowUpAnswers: (v: Record<string, string>) => void;
}) {
  const pct = Math.round((result.score / Math.max(1, result.total)) * 100);
  const level =
    pct >= 90 ? { lbl: lang === "fr" ? "Excellent" : "Excellent" } :
    pct >= 70 ? { lbl: lang === "fr" ? "Sur la bonne voie" : "On track" } :
    pct >= 50 ? { lbl: lang === "fr" ? "Bases à revoir" : "Review prerequisites" } :
                { lbl: lang === "fr" ? "Remédiation" : "Remedial" };

  // Conic ring fill proportional to score percentage.
  const ringDeg = Math.round((pct / 100) * 360);

  return (
    <MathJax dynamic>
      {/* Score summary screen */}
      <div className="card" style={{ textAlign: "center", padding: "48px 32px", marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 24 }}>
          {lang === "fr" ? "Fiche terminée" : "Worksheet complete"}
        </div>
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `conic-gradient(var(--accent) 0deg ${ringDeg}deg, rgba(255,255,255,0.08) ${ringDeg}deg 360deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <div
            style={{
              width: 168,
              height: 168,
              background: "var(--bg)",
              borderRadius: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="numeric"
              style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 56, lineHeight: 1, color: "#fff" }}
            >
              {pct}
            </div>
            <div
              style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}
            >
              %
            </div>
          </div>
        </div>
        <span className="badge badge--accent" style={{ marginBottom: 16 }}>{level.lbl}</span>
        <p className="muted" style={{ maxWidth: 460, margin: "12px auto 0", fontSize: 15 }}>
          {lang === "fr"
            ? `Tu as eu ${result.score} bonnes réponses sur ${result.total}. Les erreurs sont enregistrées avec leurs explications — à revoir quand tu veux.`
            : `You got ${result.score} of ${result.total} questions right. The ones you missed have explanations saved — review anytime.`}
        </p>
        <div className="row" style={{ justifyContent: "center", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div className="numeric" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "#fff" }}>
              {result.score}/{result.total}
            </div>
            <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>
              {lang === "fr" ? "Score" : "Score"}
            </div>
          </div>
          <div className="vdivider" style={{ height: 40 }} />
          <div style={{ textAlign: "center" }}>
            <div className="numeric" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "#fff" }}>
              {result.total - result.score}
            </div>
            <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>
              {lang === "fr" ? "À revoir" : "To review"}
            </div>
          </div>
        </div>
      </div>

      {/* Per-question corrections */}
      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 24 }}>
          {lang === "fr" ? "Corrections" : "Corrections"}
        </div>

        {result.corrections.map((c, i) => (
          <div key={c.questionId} style={{ marginBottom: 32 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 20,
                lineHeight: 1.35,
                color: "#fff",
                marginBottom: 16,
              }}
            >
              <span style={{ color: c.isCorrect ? "var(--success)" : "var(--danger)", marginRight: 8 }}>
                {c.isCorrect ? "✓" : "✗"} Q{i + 1}.
              </span>
              <span dangerouslySetInnerHTML={{ __html: c.text }} />
            </div>
            <div className="col" style={{ gap: 10 }}>
              {c.options.map((o) => {
                const isChosen = c.chosenLetter === o.letter;
                let cls = "quiz-option quiz-option--disabled";
                if (o.isCorrect) cls = "quiz-option quiz-option--correct";
                else if (isChosen && !o.isCorrect) cls = "quiz-option quiz-option--wrong";
                return (
                  <div key={o.letter} className={cls} style={{ cursor: "default" }}>
                    <span className="quiz-option__letter">{o.letter}</span>
                    <span className="quiz-option__text" dangerouslySetInnerHTML={{ __html: o.text }} />
                    {o.isCorrect && (
                      <span style={{ color: "var(--success)", fontWeight: 700, fontSize: 13 }}>✓</span>
                    )}
                    {isChosen && !o.isCorrect && (
                      <span style={{ color: "var(--danger)", fontWeight: 700, fontSize: 13 }}>✗</span>
                    )}
                  </div>
                );
              })}
            </div>

            {!c.isCorrect && c.remediation && (
              <div
                style={{
                  marginTop: 20,
                  padding: 20,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--danger-bg)",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#fca5a5",
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      background: "var(--danger)",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    ✗
                  </span>
                  {lang === "fr" ? "Pas tout à fait — voyons pourquoi." : "Not quite — let's look at why."}
                </div>
                <div
                  style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: c.remediation.explanation }}
                />
                {c.remediation.videoUrl && (
                  <div style={{ marginTop: 18 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: "var(--text-muted)",
                        marginBottom: 10,
                      }}
                    >
                      {lang === "fr" ? "Regarder & apprendre" : "Watch & learn"}
                    </div>
                    <a
                      href={c.remediation.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        gap: 14,
                        padding: 14,
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.95)",
                          color: "#0a1936",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: 16,
                        }}
                      >
                        ▶
                      </span>
                      <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>
                          {c.remediation.videoTitle ?? (lang === "fr" ? "Vidéo d'aide" : "Help video")}
                        </span>
                        <span className="muted" style={{ fontSize: 12 }}>
                          {lang === "fr" ? "Vidéo · 3–5 min" : "Video · 3–5 min"}
                        </span>
                      </span>
                    </a>
                  </div>
                )}
                {c.remediation.followUps.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: "var(--text-muted)",
                        marginBottom: 12,
                      }}
                    >
                      {lang === "fr" ? "Questions de suivi" : "Follow-up questions"}
                    </div>
                    {c.remediation.followUps.map((fu) => {
                      const picked = followUpAnswers[fu.id];
                      const answered = picked != null;
                      const ok = answered && picked === fu.correctLetter;
                      return (
                        <div key={fu.id} style={{ marginBottom: 18 }}>
                          <div
                            style={{ fontSize: 15, marginBottom: 10, color: "#fff", fontWeight: 600 }}
                            dangerouslySetInnerHTML={{ __html: fu.text }}
                          />
                          <div className="col" style={{ gap: 10 }}>
                            {fu.options.map((o) => {
                              let cls = "quiz-option";
                              if (answered) {
                                cls += " quiz-option--disabled";
                                if (o.isCorrect) cls = "quiz-option quiz-option--correct";
                                else if (picked === o.letter) cls = "quiz-option quiz-option--wrong";
                              } else if (picked === o.letter) {
                                cls += " quiz-option--selected";
                              }
                              return (
                                <button
                                  key={o.letter}
                                  type="button"
                                  className={cls}
                                  style={answered ? { cursor: "default" } : undefined}
                                  onClick={() => {
                                    if (!answered) setFollowUpAnswers({ ...followUpAnswers, [fu.id]: o.letter });
                                  }}
                                >
                                  <span className="quiz-option__letter">{o.letter}</span>
                                  <span className="quiz-option__text" dangerouslySetInnerHTML={{ __html: o.text }} />
                                </button>
                              );
                            })}
                          </div>
                          {answered && (
                            <div
                              style={{
                                marginTop: 10,
                                fontSize: 13,
                                fontWeight: 600,
                                color: ok ? "var(--success)" : "var(--danger)",
                              }}
                            >
                              {ok
                                ? (lang === "fr" ? "Bravo !" : "Well done!")
                                : (lang === "fr" ? "Pas encore — relis l'explication." : "Not yet — re-read the explanation.")}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {c.explanation && c.isCorrect && (
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--success-bg)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  fontSize: 14,
                  color: "#cbd5e1",
                  lineHeight: 1.6,
                }}
              >
                <div
                  style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: "#86efac", display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: "var(--success)",
                      color: "#03260f",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                  {lang === "fr" ? "Bien joué." : "Nice work."}
                </div>
                <div dangerouslySetInnerHTML={{ __html: c.explanation }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </MathJax>
  );
}
