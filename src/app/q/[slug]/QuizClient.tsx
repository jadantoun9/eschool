"use client";

import { useEffect, useMemo, useState } from "react";
import { MathJaxContext, MathJax } from "better-react-mathjax";
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
  const [unanswered, setUnanswered] = useState<Set<string>>(new Set());

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

  async function handleSubmit() {
    if (!quiz || !canSubmit) return;

    // Find unanswered main questions. If any, highlight them and scroll to
    // the first instead of submitting.
    const missing = quiz.questions.filter((q) => !answers[q.id]).map((q) => q.id);
    if (missing.length > 0) {
      setUnanswered(new Set(missing));
      const el = document.getElementById(`qb-${missing[0]}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setUnanswered(new Set());

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
      <div
        style={{
          display: "flex",
          minHeight: "70vh",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--g500)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animation: "spin 1s linear infinite" }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  if (!quiz)
    return (
      <div className="wrap" style={{ padding: "3rem 1rem" }}>
        {error ?? "Quiz introuvable."}
      </div>
    );

  // Cumulative question number across parts so users still see "Q1..QN" globally.
  let qCounter = 0;

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="hdr">
        <div className="hdr-badge">{quiz.grade} · {quiz.subject}</div>
        <h1>{quiz.title}</h1>
        <p>{lang === "fr" ? "Réponds à toutes les questions puis soumets." : "Answer all questions, then submit."}</p>
      </div>

      <div className="wrap">
        <div className="lang-bar">
          <button className={`lbtn ${lang === "fr" ? "on" : ""}`} onClick={() => setLang("fr")}>FR</button>
          <button className={`lbtn ${lang === "en" ? "on" : ""}`} onClick={() => setLang("en")}>EN</button>
        </div>

        {stage === "form" && (
          <>
            {quiz.prelim && <PrelimCard prelim={quiz.prelim} lang={lang} />}

            <div className="prog-bar"><div className="prog-fill" style={{ width: `${progress}%` }} /></div>

            <div className="card">
              <div className="card-hdr">
                <div className="cicon">👤</div>
                <div>
                  <div className="ctitle">{lang === "fr" ? "Identité" : "Identity"}</div>
                  <div className="csub">{lang === "fr" ? "Nom et classe" : "Name and class"}</div>
                </div>
              </div>
              <div className="name-grid">
                <div className="field">
                  <label>{lang === "fr" ? "Nom complet" : "Full name"}</label>
                  <input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder={lang === "fr" ? "Ex : Marie Dupont" : "Ex: Marie Dupont"} />
                </div>
                <div className="field">
                  <label>{lang === "fr" ? "Classe (optionnel)" : "Class (optional)"}</label>
                  <input value={studentClass} onChange={(e) => setStudentClass(e.target.value)} placeholder={lang === "fr" ? "Ex : 2nde A" : "Ex: 10A"} />
                </div>
              </div>
            </div>

            <MathJax dynamic>
              {groupedQuestions.map((g, gi) => (
                <div className="card" key={g.part?.id ?? `orphan-${gi}`}>
                  <div className="card-hdr">
                    <div className="cicon" style={{ background: SECTION_BG[gi % SECTION_BG.length] }}>▲</div>
                    <div>
                      <div className="ctitle">{g.part ? g.part.title : (lang === "fr" ? "Questions" : "Questions")}</div>
                      {g.part?.subtitle && <div className="csub">{g.part.subtitle}</div>}
                    </div>
                  </div>

                  {g.questions.map((q) => {
                    qCounter += 1;
                    const n = qCounter;
                    const missed = unanswered.has(q.id);
                    return (
                      <div
                        className="qblock"
                        id={`qb-${q.id}`}
                        key={q.id}
                        style={
                          missed
                            ? {
                                background: "var(--red-l)",
                                borderRadius: 10,
                                padding: 12,
                                margin: "-4px 0 1.35rem",
                                border: "1.5px solid var(--red)",
                              }
                            : undefined
                        }
                      >
                        <p className="qtext">
                          <strong style={{ color: missed ? "var(--red)" : undefined }}>Q{n}. </strong>
                          <span dangerouslySetInnerHTML={{ __html: q.text }} />
                          {missed && (
                            <span style={{ color: "var(--red)", fontWeight: 700, marginLeft: 8, fontSize: 13 }}>
                              {lang === "fr" ? "← question manquante" : "← unanswered"}
                            </span>
                          )}
                        </p>
                        {q.hint && <div className="qhint">{lang === "fr" ? "Indice : " : "Hint: "}<span dangerouslySetInnerHTML={{ __html: q.hint }} /></div>}
                        <div className="opts">
                          {q.options.map((o) => (
                            <div
                              key={o.id}
                              className={`opt ${answers[q.id] === o.letter ? "sel" : ""}`}
                              onClick={() => {
                                setAnswers({ ...answers, [q.id]: o.letter });
                                if (unanswered.has(q.id)) {
                                  const next = new Set(unanswered);
                                  next.delete(q.id);
                                  setUnanswered(next);
                                }
                              }}
                            >
                              <span className="opt-ltr">{o.letter}</span>
                              <span dangerouslySetInnerHTML={{ __html: o.text }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </MathJax>

            {error && <div style={{ color: "var(--red)", marginBottom: 12 }}>{error}</div>}

            <div style={{ paddingBottom: "3rem" }}>
              <button className="btn-primary" disabled={submitting} onClick={handleSubmit}>
                {submitting
                  ? (lang === "fr" ? "Envoi…" : "Submitting…")
                  : (lang === "fr" ? "Soumettre mes réponses" : "Submit answers")}
              </button>
            </div>
          </>
        )}

        {stage === "results" && result && (
          <ResultsView
            result={result}
            lang={lang}
            followUpAnswers={followUpAnswers}
            setFollowUpAnswers={setFollowUpAnswers}
          />
        )}
      </div>
    </MathJaxContext>
  );
}

const SECTION_BG = ["#EFF6FF", "#F5F3FF", "#F0FDF4", "#FFFBEB", "#F0FDFA"];

function PrelimCard({ prelim, lang }: { prelim: PublicPrelim; lang: Lang }) {
  return (
    <div style={{ marginBottom: "1rem", borderRadius: 12, overflow: "hidden", border: "2px solid #3B82F6", boxShadow: "0 4px 16px rgba(0,0,0,.09)" }}>
      <div style={{ background: "linear-gradient(135deg,#1D4ED8,#0F766E)", padding: "1.1rem 1.4rem", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, background: "rgba(255,255,255,.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🔬</div>
        <div style={{ flex: 1 }}>
          {prelim.badge && (
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", opacity: .8, marginBottom: 2 }}>
              {prelim.badge}
            </div>
          )}
          <div style={{ color: "#fff", fontSize: 17, fontWeight: 700, fontFamily: "Crimson Pro, serif", lineHeight: 1.25 }}>
            {prelim.title}
          </div>
        </div>
        {prelim.url && (
          <a href={prelim.url} target="_blank" rel="noopener noreferrer" style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "8px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
            {lang === "fr" ? "Plein écran ↗" : "Fullscreen ↗"}
          </a>
        )}
      </div>
      {prelim.description && (
        <div style={{ background: "#EFF6FF", padding: "1rem 1.4rem", fontSize: 13, color: "var(--g600)" }}>
          {prelim.description}
        </div>
      )}
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
    pct >= 90 ? { cls: "lvl-challenge", lbl: lang === "fr" ? "Excellent" : "Excellent" } :
    pct >= 70 ? { cls: "lvl-ontrack", lbl: lang === "fr" ? "Sur la bonne voie" : "On track" } :
    pct >= 50 ? { cls: "lvl-prereq", lbl: lang === "fr" ? "Bases à revoir" : "Review prerequisites" } :
                { cls: "lvl-remedial", lbl: lang === "fr" ? "Remédiation" : "Remedial" };

  return (
    <MathJax dynamic>
      <div className="card">
        <div className="card-hdr">
          <div className="cicon">📊</div>
          <div>
            <div className="ctitle">{lang === "fr" ? "Résultats" : "Results"}</div>
            <div className="csub">{lang === "fr" ? "Score et niveau" : "Score and level"}</div>
          </div>
        </div>
        <div className="score-row">
          <div className="scard"><div className="snum">{result.score}/{result.total}</div><div className="slbl">{lang === "fr" ? "Score" : "Score"}</div></div>
          <div className="scard"><div className="snum">{pct}%</div><div className="slbl">{lang === "fr" ? "Réussite" : "Success"}</div></div>
          <div className="scard"><div className="snum">{result.total - result.score}</div><div className="slbl">{lang === "fr" ? "À revoir" : "To review"}</div></div>
        </div>
        <div style={{ textAlign: "center" }}>
          <span className={`lvl-badge ${level.cls}`}>{level.lbl}</span>
        </div>
      </div>

      <div className="card">
        <div className="card-hdr">
          <div className="cicon">✅</div>
          <div>
            <div className="ctitle">{lang === "fr" ? "Corrections" : "Corrections"}</div>
            <div className="csub">{lang === "fr" ? "Détail par question" : "Per-question breakdown"}</div>
          </div>
        </div>

        {result.corrections.map((c, i) => (
          <div className="qblock" key={c.questionId}>
            <p className="qtext">
              <strong style={{ color: c.isCorrect ? "var(--green)" : "var(--red)" }}>
                {c.isCorrect ? "✓" : "✗"} Q{i + 1}.{" "}
              </strong>
              <span dangerouslySetInnerHTML={{ __html: c.text }} />
            </p>
            <div className="opts">
              {c.options.map((o) => {
                const isChosen = c.chosenLetter === o.letter;
                let cls = "opt locked";
                if (o.isCorrect) cls += " ok";
                else if (isChosen && !o.isCorrect) cls += " err";
                return (
                  <div key={o.letter} className={cls}>
                    <span className="opt-ltr">{o.letter}</span>
                    <span dangerouslySetInnerHTML={{ __html: o.text }} />
                  </div>
                );
              })}
            </div>

            {!c.isCorrect && c.remediation && (
              <div className="remed-block">
                <div className="remed-hdr">{lang === "fr" ? "❌ Remédiation" : "❌ Remediation"}</div>
                <div className="remed-body">
                  <div className="remed-explain" dangerouslySetInnerHTML={{ __html: c.remediation.explanation }} />
                  {c.remediation.videoUrl && (
                    <a className="remed-video" href={c.remediation.videoUrl} target="_blank" rel="noopener noreferrer">
                      🎬 {c.remediation.videoTitle ?? (lang === "fr" ? "Vidéo d'aide" : "Help video")}
                    </a>
                  )}
                  {c.remediation.followUps.length > 0 && (
                    <>
                      <div className="fu-label">{lang === "fr" ? "Questions de suivi" : "Follow-up questions"}</div>
                      {c.remediation.followUps.map((fu) => {
                        const picked = followUpAnswers[fu.id];
                        const answered = picked != null;
                        const ok = answered && picked === fu.correctLetter;
                        return (
                          <div className="fu-q" key={fu.id}>
                            <p className="qtext" style={{ fontSize: 14, marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: fu.text }} />
                            <div className="opts">
                              {fu.options.map((o) => {
                                let cls = "opt";
                                if (answered) {
                                  cls += " locked";
                                  if (o.isCorrect) cls += " ok";
                                  else if (picked === o.letter) cls += " err";
                                } else if (picked === o.letter) {
                                  cls += " sel";
                                }
                                return (
                                  <div
                                    key={o.letter}
                                    className={cls}
                                    onClick={() => { if (!answered) setFollowUpAnswers({ ...followUpAnswers, [fu.id]: o.letter }); }}
                                  >
                                    <span className="opt-ltr">{o.letter}</span>
                                    <span dangerouslySetInnerHTML={{ __html: o.text }} />
                                  </div>
                                );
                              })}
                            </div>
                            {answered && (
                              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: ok ? "var(--green)" : "var(--red)" }}>
                                {ok
                                  ? (lang === "fr" ? "Bravo !" : "Well done!")
                                  : (lang === "fr" ? "Pas encore — relis l'explication." : "Not yet — re-read the explanation.")}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            )}

            {c.explanation && c.isCorrect && (
              <div className="qhint" style={{ marginTop: 8 }} dangerouslySetInnerHTML={{ __html: c.explanation }} />
            )}
          </div>
        ))}
      </div>
    </MathJax>
  );
}
