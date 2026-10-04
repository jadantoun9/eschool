"use client";

import { useEffect, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import type { QuizImport } from "@/lib/quiz-import-schema";
import { BackLink } from "@/components/BackLink";
import { Spinner } from "@/components/Spinner";
import ImportClient from "../import/ImportClient";

type Option = { id: string; nameFr: string; nameEn: string };
type Generated = { data: QuizImport; provider: "claude" | "openai"; model: string };
type Progress = {
  provider: "claude" | "openai";
  phase: "thinking" | "writing";
  questionsStarted: number;
  // When the current provider started and when its current question started,
  // used to estimate the time left.
  providerStartedAt: number;
  firstQuestionAt: number | null;
};

export default function GenerateClient({
  lang,
  subjects,
  grades,
  preSubjectId,
  preGradeId,
}: {
  lang: Lang;
  subjects: Option[];
  grades: Option[];
  preSubjectId: string;
  preGradeId: string;
}) {
  const [stage, setStage] = useState<"form" | "generating" | "preview">("form");
  const [subjectId, setSubjectId] = useState(preSubjectId);
  const [gradeId, setGradeId] = useState(preGradeId);
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [notes, setNotes] = useState("");
  const [prelimUrl, setPrelimUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<Generated | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState<Progress | null>(null);

  const nameOf = (x: Option) => (lang === "fr" ? x.nameFr : x.nameEn);
  const canSubmit = subjectId && gradeId && topic.trim().length >= 3;

  useEffect(() => {
    if (stage !== "generating") return;
    setElapsed(0);
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [stage]);

  async function generate() {
    if (!canSubmit) {
      setErr(t("gen.validation", lang));
      return;
    }
    setErr(null);
    setProgress(null);
    setStage("generating");
    try {
      const res = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subjectId,
          gradeId,
          topic: topic.trim(),
          questionCount,
          notes: notes.trim() || undefined,
          prelimUrl: prelimUrl.trim() || undefined,
        }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.details ? JSON.stringify(j.details) : j.error || t("gen.error", lang));
      }

      // The server streams one JSON event per line.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done: Generated | null = null;
      for (;;) {
        const { value, done: finished } = await reader.read();
        if (finished) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line);
          if (ev.type === "progress") {
            setProgress((prev) => {
              const now = Date.now();
              const switched = !prev || prev.provider !== ev.provider;
              const providerStartedAt = switched ? now : prev.providerStartedAt;
              const firstQuestionAt =
                switched || ev.questionsStarted === 0
                  ? null
                  : prev.firstQuestionAt ?? now;
              return {
                provider: ev.provider,
                phase: ev.phase,
                questionsStarted: ev.questionsStarted,
                providerStartedAt,
                firstQuestionAt,
              };
            });
          } else if (ev.type === "result") {
            done = ev as Generated;
          } else if (ev.type === "error") {
            throw new Error(ev.details || t("gen.error", lang));
          }
        }
      }
      if (!done) throw new Error(t("gen.error", lang));
      setResult(done);
      setStage("preview");
    } catch (e) {
      setErr(`${t("gen.error", lang)}\n${(e as Error).message}`);
      setStage("form");
    }
  }

  if (stage === "preview" && result) {
    return (
      <div className="col" style={{ gap: 18 }}>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <span className="badge badge--accent">
            ✦ {t("gen.generatedBy", lang)} {result.provider === "claude" ? "Claude" : "ChatGPT"} · {result.model}
          </span>
          {result.provider === "claude" && (
            <span className="muted" style={{ fontSize: 13 }}>
              {t("gen.fallbackNote", lang)}
            </span>
          )}
        </div>
        <ImportClient lang={lang} initialData={result.data} onStartOver={() => setStage("form")} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <BackLink href="/admin/quizzes/new" label={t("quizNew.changeMethodBack", lang)} />
      <div className="eyebrow" style={{ marginBottom: 16 }}>
        {t("gen.eyebrow", lang)}
      </div>
      <h1 className="display" style={{ fontSize: "clamp(34px, 3.6vw, 48px)" }}>
        {lang === "fr" ? (
          <>
            Décris ta fiche, l&apos;<span className="accent">IA l&apos;écrit</span>
          </>
        ) : (
          <>
            Describe it, the <span className="accent">AI writes it</span>
          </>
        )}
      </h1>
      <p className="muted" style={{ marginTop: 16, marginBottom: 32, maxWidth: 600 }}>
        {t("gen.subtitle", lang)}
      </p>

      {stage === "generating" ? (
        <GeneratingCard lang={lang} progress={progress} total={questionCount} elapsed={elapsed} />
      ) : (
        <div className="card" style={{ padding: 32 }}>
          <div className="grid grid--2">
            <div className="field">
              <label className="field__label" htmlFor="gen-subject">
                {t("gen.subject", lang)}
              </label>
              <select
                id="gen-subject"
                className="select"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">{t("gen.pick", lang)}</option>
                {subjects.map((x) => (
                  <option key={x.id} value={x.id}>
                    {nameOf(x)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="gen-grade">
                {t("gen.grade", lang)}
              </label>
              <select
                id="gen-grade"
                className="select"
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
              >
                <option value="">{t("gen.pick", lang)}</option>
                {grades.map((x) => (
                  <option key={x.id} value={x.id}>
                    {nameOf(x)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="gen-topic">
              {t("gen.topic", lang)}
            </label>
            <input
              id="gen-topic"
              className="input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("gen.topicPlaceholder", lang)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="gen-count">
              {t("gen.count", lang)}
            </label>
            <input
              id="gen-count"
              className="input"
              type="number"
              min={1}
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              style={{ maxWidth: 140 }}
            />
            <div className="field__hint">{t("gen.countHint", lang)}</div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="gen-notes">
              {t("gen.notes", lang)}
            </label>
            <textarea
              id="gen-notes"
              className="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("gen.notesPlaceholder", lang)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="gen-prelim">
              {t("gen.prelim", lang)}
            </label>
            <input
              id="gen-prelim"
              className="input"
              type="url"
              value={prelimUrl}
              onChange={(e) => setPrelimUrl(e.target.value)}
              placeholder="https://www.geogebra.org/m/…"
            />
          </div>

          {err && (
            <div className="field__error" style={{ marginBottom: 18, whiteSpace: "pre-wrap" }}>
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
              {t("quizNew.changeMethod", lang)}
            </a>
            <button type="button" className="btn btn--primary" disabled={!canSubmit} onClick={generate}>
              ✦ {t("gen.submit", lang)} <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const sec = String(Math.floor(seconds % 60)).padStart(2, "0");
  return `${m}:${sec}`;
}

// Progress: thinking → 0–8%, then each written question moves the bar.
// The estimate is based on the average time per completed question.
function GeneratingCard({
  lang,
  progress,
  total,
  elapsed,
}: {
  lang: Lang;
  progress: Progress | null;
  total: number;
  elapsed: number;
}) {
  const writing = progress?.phase === "writing" && progress.questionsStarted > 0;
  const completed = writing ? Math.min(total, Math.max(0, progress!.questionsStarted - 1)) : 0;
  const current = writing ? Math.min(total, progress!.questionsStarted) : 0;

  const pct = !progress
    ? 2
    : !writing
    ? Math.min(8, 2 + elapsed * 0.15)
    : 8 + (92 * (completed + 0.5)) / Math.max(1, total);

  let remaining: number | null = null;
  if (writing && progress!.firstQuestionAt && completed > 0) {
    const perQuestion = (Date.now() - progress!.firstQuestionAt) / 1000 / completed;
    remaining = Math.max(5, perQuestion * (total - completed));
  }

  const status = !progress
    ? t("gen.statusStarting", lang)
    : !writing
    ? t("gen.statusThinking", lang)
    : t("gen.statusWriting", lang).replace("{n}", String(current)).replace("{total}", String(total));

  return (
    <div className="card" style={{ padding: "40px 32px" }}>
      <div className="row" style={{ gap: 12, marginBottom: 6 }}>
        <span style={{ display: "inline-flex", color: "var(--accent)" }}>
          <Spinner size={22} />
        </span>
        <div className="h3">{t("gen.generating", lang)}</div>
      </div>
      <p className="muted" style={{ marginBottom: 22 }}>
        {status}
        {progress?.provider === "claude" && <> · {t("gen.retryingClaude", lang)}</>}
      </p>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 999,
            background: "linear-gradient(90deg, rgba(255,204,0,0.6), var(--accent))",
            transition: "width 600ms ease",
          }}
        />
      </div>

      <div className="row numeric dim" style={{ justifyContent: "space-between", marginTop: 10, fontSize: 13 }}>
        <span>
          {t("gen.elapsed", lang)} {fmt(elapsed)}
        </span>
        <span>
          {remaining != null
            ? t("gen.remaining", lang).replace("{t}", fmt(remaining))
            : t("gen.estimating", lang)}
        </span>
      </div>
      <p className="dim" style={{ fontSize: 12, marginTop: 18 }}>
        {t("gen.generatingHint", lang)}
      </p>
    </div>
  );
}
