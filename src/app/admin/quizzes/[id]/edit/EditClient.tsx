"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";
import { useConfirm } from "@/components/ConfirmDialog";
import { BackLink } from "@/components/BackLink";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

let _idSeq = 0;
const cid = () => `c${Date.now().toString(36)}${(++_idSeq).toString(36)}`;

type Option = { letter: string; textFr: string; textEn?: string | null; isCorrect: boolean };
type FollowUp = { textFr: string; textEn?: string | null; options: Option[] };
type Remediation = {
  explanationFr: string;
  explanationEn?: string | null;
  videoUrl?: string | null;
  videoTitle?: string | null;
};
type Part = {
  clientId: string;
  titleFr: string;
  titleEn?: string | null;
  subtitleFr?: string | null;
  subtitleEn?: string | null;
};
type Question = {
  clientId: string;
  partClientId: string | null;
  skillTag?: string | null;
  textFr: string;
  textEn?: string | null;
  hintFr?: string | null;
  hintEn?: string | null;
  explanationFr: string;
  explanationEn?: string | null;
  options: Option[];
  remediation?: Remediation | null;
  followUps: FollowUp[];
};

type QuizDto = {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string | null;
  isPublished: boolean;
  prelimBadgeFr: string | null;
  prelimBadgeEn: string | null;
  prelimTitleFr: string | null;
  prelimTitleEn: string | null;
  prelimDescFr: string | null;
  prelimDescEn: string | null;
  prelimUrl: string | null;
  prelimEmbedUrl: string | null;
  parts: {
    id: string;
    order: number;
    titleFr: string;
    titleEn: string | null;
    subtitleFr: string | null;
    subtitleEn: string | null;
  }[];
  questions: {
    partId: string | null;
    order: number;
    skillTag: string | null;
    textFr: string;
    textEn: string | null;
    hintFr: string | null;
    hintEn: string | null;
    explanationFr: string;
    explanationEn: string | null;
    options: Option[];
    remediation: Remediation | null;
    followUps: { textFr: string; textEn: string | null; options: Option[] }[];
  }[];
};

function emptyQuestion(partClientId: string | null): Question {
  return {
    clientId: cid(),
    partClientId,
    textFr: "",
    explanationFr: "",
    options: LETTERS.slice(0, 4).map((l, i) => ({ letter: l, textFr: "", isCorrect: i === 0 })),
    followUps: [],
  };
}
function emptyPart(): Part {
  return { clientId: cid(), titleFr: "Nouvelle partie" };
}
function emptyFollowUp(): FollowUp {
  return {
    textFr: "",
    options: LETTERS.slice(0, 4).map((l, i) => ({ letter: l, textFr: "", isCorrect: i === 0 })),
  };
}

export default function EditClient({ quiz, strings }: { quiz: QuizDto; strings: Record<string, string> }) {
  const s = strings;
  const router = useRouter();
  const confirm = useConfirm();

  const [titleFr, setTitleFr] = useState(quiz.titleFr);
  const [titleEn, setTitleEn] = useState(quiz.titleEn ?? "");
  const [isPublished, setIsPublished] = useState(quiz.isPublished);

  const [studentUrl, setStudentUrl] = useState(`/q/${quiz.slug}`);
  const [copied, setCopied] = useState(false);
  const [prelimOpen, setPrelimOpen] = useState(false);
  useEffect(() => {
    setStudentUrl(`${window.location.origin}/q/${quiz.slug}`);
  }, [quiz.slug]);

  async function copyLink() {
    await navigator.clipboard.writeText(studentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const [prelim, setPrelim] = useState({
    badgeFr: quiz.prelimBadgeFr ?? "",
    badgeEn: quiz.prelimBadgeEn ?? "",
    titleFr: quiz.prelimTitleFr ?? "",
    titleEn: quiz.prelimTitleEn ?? "",
    descFr: quiz.prelimDescFr ?? "",
    descEn: quiz.prelimDescEn ?? "",
    url: quiz.prelimUrl ?? "",
    embedUrl: quiz.prelimEmbedUrl ?? "",
  });

  // Auto-migrate any unparted questions into a default part so the new UI
  // (where every question lives inside a part) has somewhere to render them.
  const dbIdToClientId = new Map(quiz.parts.map((p) => [p.id, cid()]));
  const hasUnparted = quiz.questions.some((q) => !q.partId);
  const defaultPartClientId = hasUnparted ? cid() : null;

  const [parts, setParts] = useState<Part[]>(() => {
    const existing = quiz.parts.map((p) => ({
      clientId: dbIdToClientId.get(p.id)!,
      titleFr: p.titleFr,
      titleEn: p.titleEn,
      subtitleFr: p.subtitleFr,
      subtitleEn: p.subtitleEn,
    }));
    if (defaultPartClientId) {
      existing.unshift({
        clientId: defaultPartClientId,
        titleFr: "Part 1",
        titleEn: null,
        subtitleFr: null,
        subtitleEn: null,
      });
    }
    return existing;
  });

  const [questions, setQuestions] = useState<Question[]>(
    quiz.questions.length > 0
      ? quiz.questions.map((q) => ({
          clientId: cid(),
          partClientId: q.partId
            ? dbIdToClientId.get(q.partId) ?? null
            : defaultPartClientId,
          skillTag: q.skillTag,
          textFr: q.textFr,
          textEn: q.textEn,
          hintFr: q.hintFr,
          hintEn: q.hintEn,
          explanationFr: q.explanationFr,
          explanationEn: q.explanationEn,
          options: q.options,
          remediation: q.remediation,
          followUps: q.followUps.map((fu) => ({
            textFr: fu.textFr,
            textEn: fu.textEn,
            options: fu.options,
          })),
        }))
      : []
  );

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function updateQ(i: number, patch: Partial<Question>) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function updateOpt(i: number, j: number, patch: Partial<Option>) {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx !== i
          ? q
          : { ...q, options: q.options.map((o, oi) => (oi === j ? { ...o, ...patch } : o)) }
      )
    );
  }
  function setCorrect(i: number, j: number) {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx !== i
          ? q
          : { ...q, options: q.options.map((o, oi) => ({ ...o, isCorrect: oi === j })) }
      )
    );
  }

  function moveQWithinPart(i: number, delta: number) {
    setQuestions((qs) => {
      const q = qs[i];
      if (!q) return qs;
      const sameIdx: number[] = [];
      qs.forEach((qq, idx) => {
        if (qq.partClientId === q.partClientId) sameIdx.push(idx);
      });
      const posInPart = sameIdx.indexOf(i);
      const targetPos = posInPart + delta;
      if (targetPos < 0 || targetPos >= sameIdx.length) return qs;
      const j = sameIdx[targetPos];
      const next = qs.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function addOption(qi: number) {
    setQuestions((qs) =>
      qs.map((q, idx) => {
        if (idx !== qi) return q;
        if (q.options.length >= 10) return q;
        const nextLetter = LETTERS[q.options.length];
        return {
          ...q,
          options: [
            ...q.options,
            { letter: nextLetter, textFr: "", isCorrect: false },
          ],
        };
      })
    );
  }

  function removeOption(qi: number, oi: number) {
    setQuestions((qs) =>
      qs.map((q, idx) => {
        if (idx !== qi) return q;
        if (q.options.length <= 2) return q;
        const filtered = q.options.filter((_, oj) => oj !== oi);
        const relettered = filtered.map((o, k) => ({ ...o, letter: LETTERS[k] }));
        // If we removed the correct option, default to the first remaining.
        if (!relettered.some((o) => o.isCorrect) && relettered[0]) {
          relettered[0] = { ...relettered[0], isCorrect: true };
        }
        return { ...q, options: relettered };
      })
    );
  }

  function addQuestionToPart(partClientId: string) {
    setQuestions((qs) => {
      // Insert the new question right after the last existing question in
      // this part, so the global flat order keeps part-grouping intact.
      const newQ = emptyQuestion(partClientId);
      let lastIdx = -1;
      qs.forEach((q, idx) => {
        if (q.partClientId === partClientId) lastIdx = idx;
      });
      if (lastIdx === -1) return [...qs, newQ];
      const next = qs.slice();
      next.splice(lastIdx + 1, 0, newQ);
      return next;
    });
  }
  function moveP(i: number, delta: number) {
    setParts((ps) => {
      const j = i + delta;
      if (j < 0 || j >= ps.length) return ps;
      const next = ps.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    const r1 = await fetch(`/api/quizzes/${quiz.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        titleFr,
        titleEn: titleEn || null,
        isPublished,
        prelimBadgeFr: prelim.badgeFr || null,
        prelimBadgeEn: prelim.badgeEn || null,
        prelimTitleFr: prelim.titleFr || null,
        prelimTitleEn: prelim.titleEn || null,
        prelimDescFr: prelim.descFr || null,
        prelimDescEn: prelim.descEn || null,
        prelimUrl: prelim.url || null,
        prelimEmbedUrl: prelim.embedUrl || null,
      }),
    });
    if (!r1.ok) {
      setBusy(false);
      setMsg({ kind: "err", text: s["edit.errorMeta"] });
      return;
    }

    const r2 = await fetch(`/api/quizzes/${quiz.id}/questions`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        parts: parts.map((p, idx) => ({
          clientId: p.clientId,
          order: idx + 1,
          titleFr: p.titleFr,
          titleEn: p.titleEn || null,
          subtitleFr: p.subtitleFr || null,
          subtitleEn: p.subtitleEn || null,
        })),
        questions: questions.map((q, idx) => ({
          order: idx + 1,
          partClientId: q.partClientId,
          skillTag: q.skillTag || null,
          textFr: q.textFr,
          textEn: q.textEn || null,
          hintFr: q.hintFr || null,
          hintEn: q.hintEn || null,
          explanationFr: q.explanationFr,
          explanationEn: q.explanationEn || null,
          options: q.options,
          remediation: q.remediation
            ? { ...q.remediation, videoUrl: q.remediation.videoUrl || null }
            : null,
          followUps: q.followUps,
        })),
      }),
    });
    setBusy(false);
    if (!r2.ok) {
      const j = await r2.json().catch(() => ({}));
      setMsg({ kind: "err", text: j.error ?? s["edit.error"] });
      return;
    }
    setMsg({ kind: "ok", text: s["edit.saved"] });
    router.refresh();
  }

  return (
    <div style={{ paddingBottom: 96 }}>
      <BackLink href="/admin" label={s["common.backDashboard"]} />
      {/* Page header: title + status + publish */}
      <div className="section-head" style={{ flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="row" style={{ gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <span className="eyebrow">{s["edit.title"]}</span>
          </div>
          <input
            className="input"
            value={titleFr}
            onChange={(e) => setTitleFr(e.target.value)}
            placeholder={s["quiz.titleFr"]}
            style={{
              background: "transparent",
              border: "1px solid transparent",
              padding: "4px 8px",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 36,
              letterSpacing: "-0.02em",
            }}
          />
          <input
            className="input"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder={s["quiz.titleEn"]}
            style={{
              background: "transparent",
              border: "1px solid transparent",
              padding: "2px 8px",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 20,
              letterSpacing: "-0.01em",
              color: "var(--text-muted)",
            }}
          />
        </div>
        <div className="row" style={{ flexShrink: 0 }}>
          <div className="switch__row">
            <button
              type="button"
              role="switch"
              className="switch"
              aria-checked={isPublished}
              aria-label={s["edit.published"]}
              onClick={() => setIsPublished(!isPublished)}
            >
              <span className="switch__thumb" />
            </button>
            <span className="switch__label">
              {isPublished ? s["dash.published"] : s["dash.draft"]}
            </span>
          </div>
          <button
            className="btn btn--solid btn--sm"
            onClick={save}
            disabled={busy}
          >
            {busy ? (
              <span className="row" style={{ gap: 8 }}>
                <Spinner size={16} /> {s["edit.saving"]}
              </span>
            ) : (
              s["edit.save"]
            )}
          </button>
        </div>
      </div>

      <div className="col" style={{ gap: 16 }}>
        {/* Student link card */}
        <div className="card row" style={{ flexWrap: "wrap", gap: 12 }}>
          <span className="field__label" style={{ whiteSpace: "nowrap" }}>
            {s["share.linkLabel"] ?? "Student link"}
          </span>
          <input
            className="input"
            readOnly
            value={studentUrl}
            onFocus={(e) => e.currentTarget.select()}
            disabled={!isPublished}
            style={{ flex: 1, minWidth: 200, opacity: isPublished ? 1 : 0.5 }}
          />
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={copyLink}
            disabled={!isPublished}
            title={!isPublished ? s["share.warning"] : undefined}
          >
            {copied ? s["share.copied"] : s["share.copy"]}
          </button>
        </div>

        {/* Intro activity (collapsible) */}
        <div className="card" style={{ padding: 0 }}>
          <button
            type="button"
            onClick={() => setPrelimOpen((v) => !v)}
            className="row"
            style={{
              width: "100%",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "18px 22px",
              textAlign: "left",
            }}
          >
            <div>
              <div className="h4">{s["edit.prelim.title"]}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                {s["edit.prelim.desc"]}
              </div>
            </div>
            <span className="icon-btn" style={{ flexShrink: 0 }}>{prelimOpen ? "▴" : "▾"}</span>
          </button>
          {prelimOpen && (
            <div style={{ padding: "0 22px 22px" }}>
              <div className="divider" style={{ margin: "0 0 18px" }} />
              <div className="field">
                <label className="field__label">{s["edit.prelim.intoTitle"]}</label>
                <input
                  className="input"
                  value={prelim.titleFr}
                  onChange={(e) => setPrelim({ ...prelim, titleFr: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="field__label">{s["edit.prelim.intoDesc"]}</label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={prelim.descFr}
                  onChange={(e) => setPrelim({ ...prelim, descFr: e.target.value })}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field__label">{s["edit.prelim.intoUrl"]}</label>
                <input
                  className="input"
                  value={prelim.url}
                  onChange={(e) => setPrelim({ ...prelim, url: e.target.value })}
                  placeholder="https://www.geogebra.org/m/..."
                />
              </div>
            </div>
          )}
        </div>

        {parts.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">📝</div>
            <div className="muted">{s["edit.noPartsHint"]}</div>
          </div>
        )}

        {parts.map((p, pi) => {
          const partQuestions: { q: Question; globalIdx: number }[] = [];
          questions.forEach((qq, idx) => {
            if (qq.partClientId === p.clientId)
              partQuestions.push({ q: qq, globalIdx: idx });
          });

          return (
            <div className="card col" key={p.clientId} style={{ gap: 14 }}>
              {/* Part header */}
              <div className="row" style={{ flexWrap: "wrap" }}>
                <span className="badge badge--accent">
                  {s["edit.part"]} {pi + 1}
                </span>
                <div className="spacer" />
                <button
                  className="icon-btn"
                  title="↑"
                  onClick={() => moveP(pi, -1)}
                  disabled={pi === 0}
                  style={{ opacity: pi === 0 ? 0.4 : 1 }}
                >
                  ↑
                </button>
                <button
                  className="icon-btn"
                  title="↓"
                  onClick={() => moveP(pi, 1)}
                  disabled={pi === parts.length - 1}
                  style={{ opacity: pi === parts.length - 1 ? 0.4 : 1 }}
                >
                  ↓
                </button>
                <button
                  className="icon-btn icon-btn--danger"
                  title={s["edit.delete"]}
                  onClick={async () => {
                    if (partQuestions.length > 0) {
                      const ok = await confirm({
                        title: "Delete this part?",
                        description: `This part has ${partQuestions.length} question(s). Deleting it will remove the part and all of its questions.`,
                        confirmText: "Delete part",
                      });
                      if (!ok) return;
                    }
                    setQuestions((qs) =>
                      qs.filter((qq) => qq.partClientId !== p.clientId)
                    );
                    setParts((ps) => ps.filter((_, idx) => idx !== pi));
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Part fields */}
              <div className="grid grid--2">
                <div className="field" style={{ marginBottom: 0 }}>
                  <label className="field__label">{s["edit.partTitle"]}</label>
                  <input
                    className="input"
                    value={p.titleFr}
                    onChange={(e) =>
                      setParts(
                        parts.map((pp, idx) =>
                          idx === pi ? { ...pp, titleFr: e.target.value } : pp
                        )
                      )
                    }
                  />
                  <label className="field__label" style={{ marginTop: 8 }}>{s["edit.partTitle.en"]}</label>
                  <input
                    className="input"
                    value={p.titleEn ?? ""}
                    onChange={(e) =>
                      setParts(
                        parts.map((pp, idx) =>
                          idx === pi ? { ...pp, titleEn: e.target.value } : pp
                        )
                      )
                    }
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label className="field__label">{s["edit.partSubtitle"]}</label>
                  <input
                    className="input"
                    value={p.subtitleFr ?? ""}
                    onChange={(e) =>
                      setParts(
                        parts.map((pp, idx) =>
                          idx === pi
                            ? { ...pp, subtitleFr: e.target.value }
                            : pp
                        )
                      )
                    }
                  />
                  <label className="field__label" style={{ marginTop: 8 }}>{s["edit.partSubtitle.en"]}</label>
                  <input
                    className="input"
                    value={p.subtitleEn ?? ""}
                    onChange={(e) =>
                      setParts(
                        parts.map((pp, idx) =>
                          idx === pi
                            ? { ...pp, subtitleEn: e.target.value }
                            : pp
                        )
                      )
                    }
                  />
                </div>
              </div>

              {/* Questions */}
              {partQuestions.map(({ q, globalIdx: i }, posInPart) => (
                <div
                  key={q.clientId}
                  className="card"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div className="row" style={{ flexWrap: "wrap", marginBottom: 8 }}>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        background: "var(--surface-2)",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {posInPart + 1}
                    </span>
                    <span className="h4" style={{ flex: 1 }}>
                      {s["edit.question"]} {posInPart + 1}
                    </span>
                    <button
                      className="icon-btn"
                      title="↑"
                      onClick={() => moveQWithinPart(i, -1)}
                      disabled={posInPart === 0}
                      style={{ opacity: posInPart === 0 ? 0.4 : 1 }}
                    >
                      ↑
                    </button>
                    <button
                      className="icon-btn"
                      title="↓"
                      onClick={() => moveQWithinPart(i, 1)}
                      disabled={posInPart === partQuestions.length - 1}
                      style={{ opacity: posInPart === partQuestions.length - 1 ? 0.4 : 1 }}
                    >
                      ↓
                    </button>
                    <button
                      className="icon-btn icon-btn--danger"
                      title={s["edit.delete"]}
                      onClick={() =>
                        setQuestions((qs) => qs.filter((_, idx) => idx !== i))
                      }
                    >
                      ✕
                    </button>
                  </div>
                  <div className="divider" style={{ margin: "0 0 16px" }} />
                  <QuestionBody
                    q={q}
                    i={i}
                    s={s}
                    updateQ={updateQ}
                    updateOpt={updateOpt}
                    setCorrect={setCorrect}
                    addOption={addOption}
                    removeOption={removeOption}
                  />
                </div>
              ))}

              <div>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => addQuestionToPart(p.clientId)}
                >
                  {s["edit.addQuestionToPart"]}
                </button>
              </div>
            </div>
          );
        })}

        <div>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setParts([...parts, emptyPart()])}
          >
            {s["edit.addPart"]}
          </button>
        </div>

        {msg && (
          <div
            className="card"
            style={{
              borderColor:
                msg.kind === "ok"
                  ? "rgba(34,197,94,0.4)"
                  : "rgba(239,68,68,0.4)",
              background:
                msg.kind === "ok" ? "var(--success-bg)" : "var(--danger-bg)",
              color: msg.kind === "ok" ? "#86efac" : "#fca5a5",
            }}
          >
            {msg.text}
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      <div
        style={{
          position: "sticky",
          bottom: 24,
          marginTop: 24,
          background: "rgba(10, 25, 54, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-lg)",
          padding: "12px 16px",
          display: "flex",
          gap: 12,
          alignItems: "center",
          zIndex: 5,
        }}
      >
        <span className="muted" style={{ fontSize: 13 }}>
          {msg?.kind === "ok" ? s["edit.saved"] : s["edit.subtitle"]}
        </span>
        <div className="spacer" />
        <button className="btn btn--solid btn--sm" onClick={save} disabled={busy}>
          {busy ? (
            <span className="row" style={{ gap: 8 }}>
              <Spinner size={16} /> {s["edit.saving"]}
            </span>
          ) : (
            s["edit.save"]
          )}
        </button>
      </div>
    </div>
  );
}

function QuestionBody({
  q,
  i,
  s,
  updateQ,
  updateOpt,
  setCorrect,
  addOption,
  removeOption,
}: {
  q: Question;
  i: number;
  s: Record<string, string>;
  updateQ: (i: number, patch: Partial<Question>) => void;
  updateOpt: (i: number, j: number, patch: Partial<Option>) => void;
  setCorrect: (i: number, j: number) => void;
  addOption: (qi: number) => void;
  removeOption: (qi: number, oi: number) => void;
}) {
  return (
    <div>
      <div className="field">
        <label className="field__label">{s["edit.statement.fr"]}</label>
        <textarea
          className="textarea"
          rows={2}
          value={q.textFr}
          onChange={(e) => updateQ(i, { textFr: e.target.value })}
        />
        <label className="field__label" style={{ marginTop: 8 }}>{s["edit.statement.en"]}</label>
        <textarea
          className="textarea"
          rows={2}
          value={q.textEn ?? ""}
          onChange={(e) => updateQ(i, { textEn: e.target.value })}
        />
      </div>
      <div className="grid grid--2">
        <div className="field">
          <label className="field__label">{s["edit.hint"]}</label>
          <input
            className="input"
            value={q.hintFr ?? ""}
            onChange={(e) => updateQ(i, { hintFr: e.target.value })}
          />
          <label className="field__label" style={{ marginTop: 8 }}>{s["edit.hint.en"]}</label>
          <input
            className="input"
            value={q.hintEn ?? ""}
            onChange={(e) => updateQ(i, { hintEn: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="field__label">{s["edit.skill"]}</label>
          <input
            className="input"
            value={q.skillTag ?? ""}
            onChange={(e) => updateQ(i, { skillTag: e.target.value })}
            placeholder="ex: congruence_def"
          />
        </div>
      </div>

      <div className="field">
        <label className="field__label">{s["edit.options"]}</label>
        {q.options.map((o, j) => (
          <div className="row" key={j} style={{ marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => setCorrect(i, j)}
              title={s["edit.options"]}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 12,
                flexShrink: 0,
                background: o.isCorrect ? "var(--success)" : "var(--surface-2)",
                color: o.isCorrect ? "#03260f" : "#fff",
              }}
            >
              {o.isCorrect ? "✓" : o.letter}
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <input
                className="input"
                placeholder={o.letter}
                value={o.textFr}
                onChange={(e) => updateOpt(i, j, { textFr: e.target.value })}
              />
              <input
                className="input"
                placeholder={s["edit.options.en"]}
                value={o.textEn ?? ""}
                onChange={(e) => updateOpt(i, j, { textEn: e.target.value })}
                style={{ fontSize: 13, color: "var(--text-muted)" }}
              />
            </div>
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              onClick={() => removeOption(i, j)}
              disabled={q.options.length <= 2}
              title={
                q.options.length <= 2
                  ? "Minimum 2 options"
                  : (s["edit.removeOption"] ?? "Remove")
              }
              style={{ opacity: q.options.length <= 2 ? 0.4 : 1 }}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => addOption(i)}
          disabled={q.options.length >= 10}
          style={{ marginTop: 2 }}
        >
          {s["edit.addOption"]}
        </button>
      </div>

      <div className="field">
        <label className="field__label">{s["edit.explanation.fr"]}</label>
        <textarea
          className="textarea"
          rows={2}
          value={q.explanationFr}
          onChange={(e) => updateQ(i, { explanationFr: e.target.value })}
        />
        <label className="field__label" style={{ marginTop: 8 }}>{s["edit.explanation.en"]}</label>
        <textarea
          className="textarea"
          rows={2}
          value={q.explanationEn ?? ""}
          onChange={(e) => updateQ(i, { explanationEn: e.target.value })}
        />
      </div>

      <RemediationEditor
        s={s}
        value={q.remediation ?? null}
        onChange={(rm) => updateQ(i, { remediation: rm })}
      />

      {q.remediation && (
        <FollowUpsEditor
          s={s}
          followUps={q.followUps}
          onChange={(fus) => updateQ(i, { followUps: fus })}
        />
      )}
    </div>
  );
}

function RemediationEditor({
  value,
  onChange,
  s,
}: {
  value: Remediation | null;
  onChange: (v: Remediation | null) => void;
  s: Record<string, string>;
}) {
  if (!value) {
    return (
      <div className="field" style={{ marginBottom: 18 }}>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => onChange({ explanationFr: "" })}
        >
          {s["edit.addRemed"]}
        </button>
      </div>
    );
  }
  return (
    <div
      className="card"
      style={{ background: "rgba(0,0,0,0.18)", marginBottom: 18 }}
    >
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <span className="badge badge--accent">{s["edit.remed.title"]}</span>
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          title={s["edit.delete"]}
          onClick={() => onChange(null)}
        >
          ✕
        </button>
      </div>
      <div className="field">
        <label className="field__label">{s["edit.remed.detailFr"]}</label>
        <textarea
          className="textarea"
          rows={2}
          value={value.explanationFr}
          onChange={(e) => onChange({ ...value, explanationFr: e.target.value })}
        />
        <label className="field__label" style={{ marginTop: 8 }}>{s["edit.remed.detailEn"]}</label>
        <textarea
          className="textarea"
          rows={2}
          value={value.explanationEn ?? ""}
          onChange={(e) => onChange({ ...value, explanationEn: e.target.value })}
        />
      </div>
      <div className="grid grid--2">
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="field__label">{s["edit.remed.videoUrl"]}</label>
          <input
            className="input"
            value={value.videoUrl ?? ""}
            onChange={(e) => onChange({ ...value, videoUrl: e.target.value })}
            placeholder="https://youtube.com/..."
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="field__label">{s["edit.remed.videoTitle"]}</label>
          <input
            className="input"
            value={value.videoTitle ?? ""}
            onChange={(e) => onChange({ ...value, videoTitle: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function FollowUpsEditor({
  followUps,
  onChange,
  s,
}: {
  followUps: FollowUp[];
  onChange: (v: FollowUp[]) => void;
  s: Record<string, string>;
}) {
  return (
    <div className="field" style={{ marginBottom: 0 }}>
      <label className="field__label">{s["edit.followups"]}</label>
      {followUps.map((fu, k) => (
        <div
          key={k}
          className="card"
          style={{ background: "rgba(0,0,0,0.18)", marginBottom: 10 }}
        >
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <span className="badge badge--accent">
              {s["edit.followup"]} {k + 1}
            </span>
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              title={s["edit.delete"]}
              onClick={() => onChange(followUps.filter((_, x) => x !== k))}
            >
              ✕
            </button>
          </div>
          <div className="field">
            <label className="field__label">{s["edit.statement.fr"]}</label>
            <textarea
              className="textarea"
              rows={2}
              value={fu.textFr}
              onChange={(e) =>
                onChange(followUps.map((f, x) => (x === k ? { ...f, textFr: e.target.value } : f)))
              }
            />
            <label className="field__label" style={{ marginTop: 8 }}>{s["edit.statement.en"]}</label>
            <textarea
              className="textarea"
              rows={2}
              value={fu.textEn ?? ""}
              onChange={(e) =>
                onChange(followUps.map((f, x) => (x === k ? { ...f, textEn: e.target.value } : f)))
              }
            />
          </div>
          {fu.options.map((o, j) => (
            <div className="row" key={j} style={{ marginBottom: 8 }}>
              <button
                type="button"
                onClick={() =>
                  onChange(
                    followUps.map((f, x) =>
                      x === k
                        ? {
                            ...f,
                            options: f.options.map((oo, oi) => ({ ...oo, isCorrect: oi === j })),
                          }
                        : f
                    )
                  )
                }
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 12,
                  flexShrink: 0,
                  background: o.isCorrect ? "var(--success)" : "var(--surface-2)",
                  color: o.isCorrect ? "#03260f" : "#fff",
                }}
              >
                {o.isCorrect ? "✓" : o.letter}
              </button>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <input
                  className="input"
                  placeholder={o.letter}
                  value={o.textFr}
                  onChange={(e) =>
                    onChange(
                      followUps.map((f, x) =>
                        x === k
                          ? {
                              ...f,
                              options: f.options.map((oo, oi) =>
                                oi === j ? { ...oo, textFr: e.target.value } : oo
                              ),
                            }
                          : f
                      )
                    )
                  }
                />
                <input
                  className="input"
                  placeholder={s["edit.options.en"]}
                  value={o.textEn ?? ""}
                  onChange={(e) =>
                    onChange(
                      followUps.map((f, x) =>
                        x === k
                          ? {
                              ...f,
                              options: f.options.map((oo, oi) =>
                                oi === j ? { ...oo, textEn: e.target.value } : oo
                              ),
                            }
                          : f
                      )
                    )
                  }
                  style={{ fontSize: 13, color: "var(--text-muted)" }}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
      <div>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => onChange([...followUps, emptyFollowUp()])}
        >
          {s["edit.addFollowup"]}
        </button>
      </div>
    </div>
  );
}
