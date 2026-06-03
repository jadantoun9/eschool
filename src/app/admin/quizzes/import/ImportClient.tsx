"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { quizImportSchema, type QuizImport } from "@/lib/quiz-import-schema";
import { t, type Lang } from "@/lib/i18n";
import { BackLink } from "@/components/BackLink";

type Stage = "input" | "preview";

// Pick the localized string for the admin's current UI language, falling back
// to French (always present) when the English variant is missing.
function loc(isEn: boolean, fr: string, en?: string | null) {
  return isEn && en ? en : fr;
}

type ChoiceOption = { textFr: string; textEn: string };

/* ── Inline-edit field primitives (used by the "Edit content" view) ── */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="muted"
      style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}
    >
      {children}
    </div>
  );
}

// A single-language input prefixed with its language tag (FR / EN).
function LangInput({
  tag,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  tag?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      {tag && (
        <span style={{ flexShrink: 0, width: 22, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", paddingTop: 10 }}>
          {tag}
        </span>
      )}
      {multiline ? (
        <textarea
          className="textarea"
          style={{ minHeight: 58, fontSize: 13, flex: 1 }}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input"
          style={{ fontSize: 13, flex: 1 }}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

// Paired FR + EN inputs for a bilingual field.
function TwoLang({
  label,
  fr,
  en,
  onFr,
  onEn,
  multiline,
}: {
  label?: string;
  fr: string;
  en: string;
  onFr: (v: string) => void;
  onEn: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="col" style={{ gap: 6 }}>
        <LangInput tag="FR" value={fr} onChange={onFr} multiline={multiline} />
        <LangInput tag="EN" value={en} onChange={onEn} multiline={multiline} />
      </div>
    </div>
  );
}

// Editable 4-option block with a radio to pick the correct answer.
function OptionsEditor({
  options,
  correctIndex,
  name,
  label,
  onText,
  onCorrect,
}: {
  options: ChoiceOption[];
  correctIndex: number;
  name: string;
  label: string;
  onText: (oi: number, which: "fr" | "en", v: string) => void;
  onCorrect: (oi: number) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="col" style={{ gap: 8 }}>
        {options.map((opt, oi) => {
          const correct = oi === correctIndex;
          return (
            <div
              key={oi}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                padding: "8px 10px",
                border: "1px solid " + (correct ? "rgba(34,197,94,0.4)" : "var(--border)"),
                borderRadius: 8,
                background: correct ? "rgba(34,197,94,0.06)" : "transparent",
              }}
            >
              <input
                type="radio"
                name={name}
                checked={correct}
                onChange={() => onCorrect(oi)}
                style={{ marginTop: 10, flexShrink: 0, accentColor: "var(--success)" }}
                title="Mark as the correct answer"
              />
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  background: correct ? "var(--success)" : "var(--surface-2)",
                  color: correct ? "#03260f" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 10,
                  flexShrink: 0,
                  marginTop: 9,
                }}
              >
                {String.fromCharCode(65 + oi)}
              </span>
              <div className="col" style={{ gap: 6, flex: 1 }}>
                <LangInput tag="FR" value={opt.textFr} onChange={(v) => onText(oi, "fr", v)} />
                <LangInput tag="EN" value={opt.textEn} onChange={(v) => onText(oi, "en", v)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Compact answer list reused for follow-up questions.
function MiniChoices({
  options,
  correctIndex,
  isEn,
}: {
  options: ChoiceOption[];
  correctIndex: number;
  isEn: boolean;
}) {
  return (
    <div className="col" style={{ gap: 5 }}>
      {options.map((opt, oi) => {
        const correct = oi === correctIndex;
        return (
          <div
            key={oi}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              background: correct ? "rgba(34,197,94,0.08)" : "transparent",
              border: "1px solid " + (correct ? "rgba(34,197,94,0.3)" : "var(--border)"),
              borderRadius: 7,
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                background: correct ? "var(--success)" : "var(--surface-2)",
                color: correct ? "#03260f" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 10,
                flexShrink: 0,
              }}
            >
              {String.fromCharCode(65 + oi)}
            </span>
            <span dangerouslySetInnerHTML={{ __html: loc(isEn, opt.textFr, opt.textEn) }} />
            {correct && (
              <span style={{ marginLeft: "auto", color: "var(--success)", fontWeight: 700, fontSize: 11 }}>
                ✓
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ImportClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("input");
  const [raw, setRaw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<QuizImport | null>(null);
  const [busy, setBusy] = useState(false);
  const [videoChecked, setVideoChecked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"preview" | "edit" | "json">("preview");
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonErr, setJsonErr] = useState<string | null>(null);
  const isEn = lang === "en";

  // Immutable update of the parsed quiz data for inline editing.
  function mutate(fn: (draft: QuizImport) => void) {
    setData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev) as QuizImport;
      fn(next);
      return next;
    });
  }

  function openJson() {
    setJsonDraft(JSON.stringify(data, null, 2));
    setJsonErr(null);
    setView("json");
  }

  // Re-parse + re-validate the edited JSON and fold it back into `data`.
  function applyJson() {
    let json: unknown;
    try {
      json = JSON.parse(jsonDraft);
    } catch (e) {
      setJsonErr((isEn ? "Invalid JSON: " : "JSON invalide : ") + (e as Error).message);
      return;
    }
    const parsed = quizImportSchema.safeParse(json);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .slice(0, 8)
        .map((i) => `• ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      setJsonErr((isEn ? "Schema errors:\n" : "Schéma invalide :\n") + issues);
      return;
    }
    setData(parsed.data);
    setRaw(jsonDraft);
    setJsonErr(null);
    setView("preview");
  }

  function toggleExpanded(key: string) {
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  }

  const counts = useMemo(() => {
    if (!data) return null;
    let questions = 0;
    let videos = 0;
    for (const p of data.parts) {
      questions += p.questions.length;
      for (const q of p.questions) videos += q.remediation.videos.length;
    }
    return { parts: data.parts.length, questions, videos };
  }, [data]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    try {
      const text = await file.text();
      setRaw(text);
      validate(text);
    } catch {
      setErr(t("import.fileReadError", lang));
    }
  }

  function validate(input?: string) {
    const source = input ?? raw;
    setErr(null);
    let json: unknown;
    try {
      json = JSON.parse(source);
    } catch (e) {
      setErr(t("import.invalidJson", lang) + (e as Error).message);
      return;
    }
    const parsed = quizImportSchema.safeParse(json);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .slice(0, 8)
        .map((i) => `• ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      setErr(t("import.schemaErrors", lang) + issues);
      return;
    }
    setData(parsed.data);
    setStage("preview");
  }

  async function submit() {
    if (!data) return;
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/quizzes/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? t("import.createError", lang));
      return;
    }
    await res.json();
    router.push(`/admin`);
  }

  if (stage === "input") {
    return (
      <div className="col" style={{ gap: 28 }}>
        <BackLink href="/admin" label={t("common.backDashboard", lang)} style={{ marginBottom: 0 }} />
        {/* Accent-tinted "give the template to an AI" block */}
        <div
          className="card"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 22,
            padding: "24px 26px",
            background:
              "linear-gradient(135deg, rgba(255,204,0,0.10), rgba(255,204,0,0.03))",
            borderColor: "var(--border-accent)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(255,204,0,0.18)",
              color: "var(--accent)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "start",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
              <path d="M19 14l.8 2.4L22 17l-2.2.6L19 20l-.8-2.4L16 17l2.2-.6L19 14z" />
              <path d="M5 16l.6 1.8L7 18l-1.4.4L5 20l-.6-1.8L3 18l1.4-.4L5 16z" />
            </svg>
          </div>
          <div>
            <h3 className="h3" style={{ marginBottom: 4 }}>
              {t("import.aiPromoTitle", lang)}
            </h3>
            <p className="muted" style={{ marginBottom: 16, maxWidth: 640, fontSize: 14 }}>
              {t("import.aiPromoDesc", lang)}
            </p>
            <div className="row" style={{ flexWrap: "wrap", gap: 14 }}>
              <a className="btn btn--primary btn--sm" href="/quiz-template.md" download>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t("import.downloadTemplateBtn", lang)}
              </a>
              <span className="dim" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                {t("import.templateNote", lang)}
              </span>
            </div>
            <div
              className="grid grid--3"
              style={{ gap: 10, marginTop: 18 }}
            >
              {[
                lang === "fr" ? (
                  <>
                    <b>Télécharge</b> le modèle ci-dessus.
                  </>
                ) : (
                  <>
                    <b>Download</b> the template file above.
                  </>
                ),
                lang === "fr" ? (
                  <>
                    <b>Attache-le</b> dans un nouveau chat ChatGPT / Claude / Gemini et réponds à ses questions.
                  </>
                ) : (
                  <>
                    <b>Attach it</b> to a new chat with ChatGPT, Claude or Gemini and answer its questions.
                  </>
                ),
                lang === "fr" ? (
                  <>
                    <b>Enregistre</b> la réponse de l'IA en .json et dépose-la ci-dessous.
                  </>
                ) : (
                  <>
                    <b>Save</b> the AI's reply as a .json file and drop it below.
                  </>
                ),
              ].map((body, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    padding: "10px 12px",
                    background: "rgba(0,0,0,0.18)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    fontSize: 12.5,
                    lineHeight: 1.45,
                  }}
                  className="muted"
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: "rgba(255,204,0,0.15)",
                      color: "var(--accent)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 11.5,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span>{body}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* File drop / choose */}
        <label
          style={{
            display: "block",
            cursor: "pointer",
            border: "1px dashed var(--border-strong)",
            background: "rgba(255,255,255,0.025)",
            borderRadius: "var(--radius-lg)",
            padding: 36,
            textAlign: "center",
          }}
        >
          <input type="file" accept=".json,application/json" onChange={onFile} style={{ display: "none" }} />
          <span
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(255,204,0,0.12)",
              color: "var(--accent)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4M12 4l-5 5M12 4l5 5M4 20h16" />
            </svg>
          </span>
          <h3 className="h3" style={{ marginBottom: 8 }}>
            {t("import.dropTitle", lang)}
          </h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            {t("import.dropSubtitle", lang)}
          </p>
        </label>

        <div className="divider" style={{ margin: 0 }} />

        {/* Paste JSON */}
        <div>
          <h3 className="h4" style={{ marginBottom: 12 }}>
            {t("import.pasteSectionTitle", lang)}
          </h3>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={'{\n  "slug": "...",\n  "titleFr": "...",\n  "subjectSlug": "...",\n  ...\n}'}
            className="textarea"
            style={{ minHeight: 220, fontFamily: "var(--font-mono)", fontSize: 13 }}
            spellCheck={false}
          />
          {err && (
            <pre
              className="mono"
              style={{
                marginTop: 14,
                whiteSpace: "pre-wrap",
                padding: "12px 14px",
                background: "var(--danger-bg)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10,
                fontSize: 12.5,
                color: "#fca5a5",
              }}
            >
              {err}
            </pre>
          )}
          <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => validate()}
              disabled={!raw.trim()}
              style={!raw.trim() ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
            >
              {t("import.validateBtn", lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PREVIEW
  return (
    <div className="col" style={{ gap: 20 }}>
      {/* parse success banner */}
      {counts && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: 10,
            color: "#86efac",
            fontSize: 13,
          }}
        >
          <span style={{ fontWeight: 700 }}>✓</span>
          <span>
            {lang === "fr"
              ? `JSON valide · ${counts.parts} partie(s) · ${counts.questions} questions · ${counts.videos} vidéos`
              : `JSON parsed successfully · ${counts.parts} part(s) · ${counts.questions} questions · ${counts.videos} videos`}
          </span>
        </div>
      )}

      {/* view switch: preview · edit content · JSON — sticky so it stays
          reachable while scrolling a long quiz */}
      <div
        className="row"
        style={{
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 5,
          padding: "10px 12px",
          margin: "-4px 0",
          background: "rgba(10,25,54,0.85)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      >
        <span className="muted" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {t("import.viewLabel", lang)}
        </span>
        {(
          [
            ["preview", t("import.viewPreview", lang)],
            ["edit", t("import.viewEditManually", lang)],
            ["json", t("import.viewEditAI", lang)],
          ] as const
        ).map(([m, label]) => {
          const active = view === m;
          return (
            <button
              key={m}
              type="button"
              className={active ? "btn btn--sm" : "btn btn--ghost btn--sm"}
              style={active ? { background: "var(--accent)", color: "var(--accent-fg)", borderColor: "var(--accent)" } : undefined}
              onClick={() => (m === "json" ? openJson() : setView(m))}
            >
              {label}
            </button>
          );
        })}
      </div>

      {view === "json" ? (
        /* ── Raw JSON editing (the AI-generated format) ── */
        <div>
          <p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
            {t("import.jsonEditorDesc", lang)}
          </p>
          <textarea
            className="textarea"
            value={jsonDraft}
            onChange={(e) => setJsonDraft(e.target.value)}
            spellCheck={false}
            style={{ minHeight: 460, fontFamily: "var(--font-mono)", fontSize: 12.5 }}
          />
          {jsonErr && (
            <pre
              className="mono"
              style={{
                marginTop: 12,
                whiteSpace: "pre-wrap",
                padding: "12px 14px",
                background: "var(--danger-bg)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10,
                fontSize: 12.5,
                color: "#fca5a5",
              }}
            >
              {jsonErr}
            </pre>
          )}
          <div className="row" style={{ justifyContent: "flex-end", marginTop: 12, gap: 10 }}>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setJsonErr(null);
                setView("preview");
              }}
            >
              {t("import.cancelBtn", lang)}
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={applyJson}>
              {t("import.applyChangesBtn", lang)}
            </button>
          </div>
        </div>
      ) : view === "edit" ? (
        /* ── Inline manual editing (FR + EN) ── */
        <div className="col" style={{ gap: 20 }}>
          <div className="card col" style={{ gap: 16 }}>
            <TwoLang
              label={t("import.quizTitleLabel", lang)}
              fr={data!.titleFr}
              en={data!.titleEn}
              onFr={(v) => mutate((d) => { d.titleFr = v; })}
              onEn={(v) => mutate((d) => { d.titleEn = v; })}
            />
            <div className="grid grid--3" style={{ gap: 12 }}>
              <div>
                <FieldLabel>Slug</FieldLabel>
                <input className="input" style={{ fontSize: 13 }} value={data!.slug} onChange={(e) => mutate((d) => { d.slug = e.target.value; })} />
              </div>
              <div>
                <FieldLabel>{t("import.subjectLabel", lang)}</FieldLabel>
                <input className="input" style={{ fontSize: 13 }} value={data!.subjectSlug} onChange={(e) => mutate((d) => { d.subjectSlug = e.target.value; })} />
              </div>
              <div>
                <FieldLabel>{t("import.gradeLabel", lang)}</FieldLabel>
                <input className="input" style={{ fontSize: 13 }} value={data!.gradeSlug} onChange={(e) => mutate((d) => { d.gradeSlug = e.target.value; })} />
              </div>
            </div>
          </div>

          {data!.parts.map((part, pIdx) => (
            <div key={pIdx} className="card col" style={{ gap: 16 }}>
              <div className="eyebrow">{`${t("import.partLabel", lang)} ${pIdx + 1}`}</div>
              <TwoLang
                label={t("import.partTitleLabel", lang)}
                fr={part.titleFr}
                en={part.titleEn}
                onFr={(v) => mutate((d) => { d.parts[pIdx].titleFr = v; })}
                onEn={(v) => mutate((d) => { d.parts[pIdx].titleEn = v; })}
              />
              <TwoLang
                label={t("import.subtitleLabel", lang)}
                fr={part.subtitleFr ?? ""}
                en={part.subtitleEn ?? ""}
                onFr={(v) => mutate((d) => { d.parts[pIdx].subtitleFr = v; })}
                onEn={(v) => mutate((d) => { d.parts[pIdx].subtitleEn = v; })}
              />

              {part.questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="col"
                  style={{ gap: 14, padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 12 }}
                >
                  <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      Q{qIdx + 1}
                    </span>
                    <input
                      className="input"
                      style={{ maxWidth: 240, fontSize: 12 }}
                      value={q.skillTag}
                      placeholder="skillTag"
                      onChange={(e) => mutate((d) => { d.parts[pIdx].questions[qIdx].skillTag = e.target.value; })}
                    />
                  </div>
                  <TwoLang
                    label={t("import.questionTextLabel", lang)}
                    fr={q.textFr}
                    en={q.textEn}
                    multiline
                    onFr={(v) => mutate((d) => { d.parts[pIdx].questions[qIdx].textFr = v; })}
                    onEn={(v) => mutate((d) => { d.parts[pIdx].questions[qIdx].textEn = v; })}
                  />
                  <OptionsEditor
                    label={t("import.answersSelectLabel", lang)}
                    options={q.options}
                    correctIndex={q.correctIndex}
                    name={`opt-${pIdx}-${qIdx}`}
                    onText={(oi, w, v) => mutate((d) => { const o = d.parts[pIdx].questions[qIdx].options[oi]; if (w === "fr") o.textFr = v; else o.textEn = v; })}
                    onCorrect={(oi) => mutate((d) => { d.parts[pIdx].questions[qIdx].correctIndex = oi; })}
                  />
                  <TwoLang
                    label={t("import.explanationLabel", lang)}
                    fr={q.remediation.explanationFr}
                    en={q.remediation.explanationEn}
                    multiline
                    onFr={(v) => mutate((d) => { d.parts[pIdx].questions[qIdx].remediation.explanationFr = v; })}
                    onEn={(v) => mutate((d) => { d.parts[pIdx].questions[qIdx].remediation.explanationEn = v; })}
                  />

                  {q.remediation.videos.length > 0 && (
                    <div>
                      <FieldLabel>{t("import.helpVideosLabel", lang)}</FieldLabel>
                      <div className="col" style={{ gap: 10 }}>
                        {q.remediation.videos.map((v, vi) => (
                          <div key={vi} className="col" style={{ gap: 6 }}>
                            <LangInput
                              value={v.label}
                              placeholder={t("import.videoLabelPlaceholder", lang)}
                              onChange={(val) => mutate((d) => { d.parts[pIdx].questions[qIdx].remediation.videos[vi].label = val; })}
                            />
                            <LangInput
                              value={v.url}
                              placeholder="https://…"
                              onChange={(val) => mutate((d) => { d.parts[pIdx].questions[qIdx].remediation.videos[vi].url = val; })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {q.remediation.followups.map((f, fi) => (
                    <div key={fi} className="col" style={{ gap: 10, padding: 12, border: "1px solid var(--border)", borderRadius: 10 }}>
                      <TwoLang
                        label={`${t("import.followUpLabel", lang)} ${fi + 1}`}
                        fr={f.textFr}
                        en={f.textEn}
                        multiline
                        onFr={(v) => mutate((d) => { d.parts[pIdx].questions[qIdx].remediation.followups[fi].textFr = v; })}
                        onEn={(v) => mutate((d) => { d.parts[pIdx].questions[qIdx].remediation.followups[fi].textEn = v; })}
                      />
                      <OptionsEditor
                        label={t("import.answersLabel", lang)}
                        options={f.options}
                        correctIndex={f.correctIndex}
                        name={`fu-${pIdx}-${qIdx}-${fi}`}
                        onText={(oi, w, v) => mutate((d) => { const o = d.parts[pIdx].questions[qIdx].remediation.followups[fi].options[oi]; if (w === "fr") o.textFr = v; else o.textEn = v; })}
                        onCorrect={(oi) => mutate((d) => { d.parts[pIdx].questions[qIdx].remediation.followups[fi].correctIndex = oi; })}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        /* ── Read-only preview ── */
        <>
      {/* header card */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <span className="badge">
                {t("import.subjectLabel", lang)}: {data!.subjectSlug}
              </span>
              <span className="badge badge--grade">
                {t("import.gradeLabel", lang)}: {data!.gradeSlug}
              </span>
              <span className="badge badge--draft">
                {t("import.draftBadge", lang)}
              </span>
            </div>
            <div className="h2" style={{ marginBottom: 4 }}>{loc(isEn, data!.titleFr, data!.titleEn)}</div>
            <div className="muted">{isEn ? data!.titleFr : data!.titleEn}</div>
            <div className="mono dim" style={{ marginTop: 8, fontSize: 12 }}>{data!.slug}</div>
          </div>
          {counts && (
            <div className="stats" style={{ gap: 28 }}>
              <div className="stat">
                <div className="stat__num numeric">{counts.parts}</div>
                <div className="stat__label">{t("import.statParts", lang)}</div>
              </div>
              <div className="stat">
                <div className="stat__num numeric">{counts.questions}</div>
                <div className="stat__label">{t("import.statQuestions", lang)}</div>
              </div>
              <div className="stat">
                <div className="stat__num numeric">{counts.videos}</div>
                <div className="stat__label">{t("import.statVideos", lang)}</div>
              </div>
            </div>
          )}
        </div>
        {data!.prelim && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              borderRadius: 12,
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 8 }}>{loc(isEn, data!.prelim.badgeFr, data!.prelim.badgeEn)}</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{loc(isEn, data!.prelim.titleFr, data!.prelim.titleEn)}</div>
            <a href={data!.prelim.url} target="_blank" rel="noreferrer" className="accent-text" style={{ fontSize: 13, textDecoration: "underline" }}>
              {data!.prelim.url}
            </a>
          </div>
        )}
      </div>

      {data!.parts.map((part, pIdx) => (
        <div key={pIdx} className="card">
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 14, marginBottom: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              {`${t("import.partLabel", lang)} ${pIdx + 1}`}
            </div>
            <h3 className="h3">{loc(isEn, part.titleFr, part.titleEn)}</h3>
            {(part.subtitleFr || part.subtitleEn) && (
              <p className="muted" style={{ marginTop: 4 }}>{loc(isEn, part.subtitleFr ?? "", part.subtitleEn)}</p>
            )}
          </div>
          <div className="col" style={{ gap: 14 }}>
            {part.questions.map((q, qIdx) => (
              <div
                key={qIdx}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                  <span className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Q{qIdx + 1}
                  </span>
                  <span className="badge badge--accent">{q.skillTag}</span>
                </div>
                <p
                  style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 12 }}
                  dangerouslySetInnerHTML={{ __html: loc(isEn, q.textFr, q.textEn) }}
                />
                <div className="col" style={{ gap: 6 }}>
                  {q.options.map((opt, oi) => {
                    const correct = oi === q.correctIndex;
                    return (
                      <div
                        key={oi}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 12px",
                          background: correct ? "rgba(34,197,94,0.08)" : "transparent",
                          border: "1px solid " + (correct ? "rgba(34,197,94,0.3)" : "var(--border)"),
                          borderRadius: 8,
                          fontSize: 14,
                        }}
                      >
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            background: correct ? "var(--success)" : "var(--surface-2)",
                            color: correct ? "#03260f" : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 11,
                            flexShrink: 0,
                          }}
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span dangerouslySetInnerHTML={{ __html: loc(isEn, opt.textFr, opt.textEn) }} />
                        {correct && (
                          <span style={{ marginLeft: "auto", color: "var(--success)", fontWeight: 700, fontSize: 12 }}>
                            ✓ {isEn ? "correct" : "correct"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {q.remediation.videos.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
                      {t("import.helpVideosLabel", lang)}
                    </div>
                    <p className="dim" style={{ fontSize: 11.5, marginBottom: 8 }}>
                      {t("import.helpVideosInstructions", lang)}
                    </p>
                    <div className="col" style={{ gap: 6 }}>
                      {q.remediation.videos.map((v, vi) => {
                        const key = `${pIdx}-${qIdx}-${vi}`;
                        const checked = videoChecked.has(key);
                        return (
                          <div key={vi} className="row" style={{ gap: 8, fontSize: 12.5 }}>
                            <span
                              className="muted"
                              title={v.url}
                              style={{
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                padding: "6px 10px",
                                background: "rgba(0,0,0,0.2)",
                                border: "1px solid var(--border)",
                                borderRadius: 8,
                              }}
                            >
                              {v.label}
                            </span>
                            <a
                              href={v.url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn--ghost btn--sm"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                              {t("import.viewVideoBtn", lang)}
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setVideoChecked((s) => {
                                  const n = new Set(s);
                                  if (n.has(key)) n.delete(key);
                                  else n.add(key);
                                  return n;
                                });
                              }}
                              className={checked ? "btn btn--sm" : "btn btn--ghost btn--sm"}
                              style={
                                checked
                                  ? { background: "var(--success)", color: "#03260f", borderColor: "var(--success)" }
                                  : undefined
                              }
                              title={t("import.videoCheckTitle", lang)}
                            >
                              {checked ? t("import.videoCheckedBtn", lang) : t("import.videoMarkCheckedBtn", lang)}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Expandable remediation: explanation + 2 follow-ups */}
                {(() => {
                  const rkey = `${pIdx}-${qIdx}`;
                  const open = expanded.has(rkey);
                  const rem = q.remediation;
                  return (
                    <div style={{ marginTop: 12 }}>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => toggleExpanded(rkey)}
                        aria-expanded={open}
                      >
                        <span
                          aria-hidden
                          style={{ display: "inline-block", transition: "transform 120ms", transform: open ? "rotate(90deg)" : "none" }}
                        >
                          ▸
                        </span>
                        {open
                          ? t("import.hideExplanation", lang)
                          : t("import.showExplanation", lang)}
                      </button>

                      {open && (
                        <div
                          style={{
                            marginTop: 12,
                            padding: 14,
                            background: "rgba(0,0,0,0.18)",
                            border: "1px solid var(--border)",
                            borderRadius: 10,
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                          }}
                        >
                          {/* Explanation */}
                          <div>
                            <div className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                              {t("import.explanationLabel", lang)}
                            </div>
                            <div
                              style={{ fontSize: 13.5, lineHeight: 1.6 }}
                              dangerouslySetInnerHTML={{ __html: loc(isEn, rem.explanationFr, rem.explanationEn) }}
                            />
                          </div>

                          {/* Follow-ups */}
                          {rem.followups.map((f, fi) => (
                            <div key={fi}>
                              <div className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                                {`${t("import.followUpLabel", lang)} ${fi + 1}`}
                              </div>
                              <p
                                style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}
                                dangerouslySetInnerHTML={{ __html: loc(isEn, f.textFr, f.textEn) }}
                              />
                              <MiniChoices options={f.options} correctIndex={f.correctIndex} isEn={isEn} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      ))}
        </>
      )}

      {err && (
        <pre
          className="mono"
          style={{
            whiteSpace: "pre-wrap",
            padding: "12px 14px",
            background: "var(--danger-bg)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10,
            fontSize: 12.5,
            color: "#fca5a5",
          }}
        >
          {err}
        </pre>
      )}

      {/* action bar */}
      <div className="card card--row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 14, position: "sticky", bottom: 16 }}>
        <div className="muted" style={{ fontSize: 13, maxWidth: 520 }}>
          {t("import.actionBarHint", lang)}
        </div>
        <div className="row">
          <button type="button" className="btn btn--ghost" onClick={() => { setView("preview"); setStage("input"); }}>
            ← {t("import.startOverBtn", lang)}
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={submit}
            disabled={busy}
            style={busy ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
          >
            {busy ? t("import.creatingBtn", lang) : t("import.createQuizBtn", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
