"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { quizImportSchema, type QuizImport } from "@/lib/quiz-import-schema";
import type { Lang } from "@/lib/i18n";

type Stage = "input" | "preview";

export default function ImportClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("input");
  const [raw, setRaw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<QuizImport | null>(null);
  const [busy, setBusy] = useState(false);
  const [videoChecked, setVideoChecked] = useState<Set<string>>(new Set());

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
      setErr(lang === "fr" ? "Impossible de lire le fichier." : "Could not read the file.");
    }
  }

  function validate(input?: string) {
    const source = input ?? raw;
    setErr(null);
    let json: unknown;
    try {
      json = JSON.parse(source);
    } catch (e) {
      setErr(lang === "fr" ? "JSON invalide : " + (e as Error).message : "Invalid JSON: " + (e as Error).message);
      return;
    }
    const parsed = quizImportSchema.safeParse(json);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .slice(0, 8)
        .map((i) => `• ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      setErr((lang === "fr" ? "Schéma invalide :\n" : "Schema errors:\n") + issues);
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
      setErr(j.error ?? (lang === "fr" ? "Erreur lors de la création" : "Error during creation"));
      return;
    }
    const j = await res.json();
    router.push(`/admin/quizzes/${j.id}/edit`);
  }

  if (stage === "input") {
    return (
      <div className="col" style={{ gap: 28 }}>
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
              {lang === "fr"
                ? "Pas encore de JSON ? Laisse une IA le construire."
                : "Don't have a JSON yet? Let an AI build it for you."}
            </h3>
            <p className="muted" style={{ marginBottom: 16, maxWidth: 640, fontSize: 14 }}>
              {lang === "fr"
                ? "Télécharge ce modèle et donne-le à ton outil d'IA préféré — ChatGPT, Claude, Gemini, Copilot… Il lira les instructions à l'intérieur, te posera quelques questions sur le sujet, et te rendra un fichier .json prêt à importer."
                : "Download this template file and give it to your favourite AI tool — ChatGPT, Claude, Gemini, Copilot… It will read the instructions inside, ask you a few questions about the topic, and hand back a ready-to-import .json file."}
            </p>
            <div className="row" style={{ flexWrap: "wrap", gap: 14 }}>
              <a className="btn btn--primary btn--sm" href="/quiz-template.md" download>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {lang === "fr" ? "Télécharger le modèle" : "Download template file"}
              </a>
              <span className="dim" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                {lang === "fr" ? ".md · instructions + schéma · sans compte" : ".md · instructions + schema · no account needed"}
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
            {lang === "fr" ? "Dépose ton .json ici" : "Drop your .json here"}
          </h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            {lang === "fr"
              ? "ou clique pour choisir un fichier sur ton ordinateur"
              : "or click to choose a file from your computer"}
          </p>
        </label>

        <div className="divider" style={{ margin: 0 }} />

        {/* Paste JSON */}
        <div>
          <h3 className="h4" style={{ marginBottom: 12 }}>
            {lang === "fr" ? "Ou colle le JSON" : "Or paste JSON"}
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
              {lang === "fr" ? "Valider & afficher" : "Validate & preview"}
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

      {/* header card */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <span className="badge">
                {lang === "fr" ? "Matière" : "Subject"}: {data!.subjectSlug}
              </span>
              <span className="badge badge--grade">
                {lang === "fr" ? "Niveau" : "Grade"}: {data!.gradeSlug}
              </span>
              <span className="badge badge--draft">
                {lang === "fr" ? "Sera enregistré en brouillon" : "Will be saved as draft"}
              </span>
            </div>
            <div className="h2" style={{ marginBottom: 4 }}>{data!.titleFr}</div>
            <div className="muted">{data!.titleEn}</div>
            <div className="mono dim" style={{ marginTop: 8, fontSize: 12 }}>{data!.slug}</div>
          </div>
          {counts && (
            <div className="stats" style={{ gap: 28 }}>
              <div className="stat">
                <div className="stat__num numeric">{counts.parts}</div>
                <div className="stat__label">{lang === "fr" ? "Parties" : "Parts"}</div>
              </div>
              <div className="stat">
                <div className="stat__num numeric">{counts.questions}</div>
                <div className="stat__label">{lang === "fr" ? "Questions" : "Questions"}</div>
              </div>
              <div className="stat">
                <div className="stat__num numeric">{counts.videos}</div>
                <div className="stat__label">{lang === "fr" ? "Vidéos" : "Videos"}</div>
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
            <div className="eyebrow" style={{ marginBottom: 8 }}>{data!.prelim.badgeFr}</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{data!.prelim.titleFr}</div>
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
              {lang === "fr" ? `Partie ${pIdx + 1}` : `Part ${pIdx + 1}`}
            </div>
            <h3 className="h3">{part.titleFr}</h3>
            {part.subtitleFr && <p className="muted" style={{ marginTop: 4 }}>{part.subtitleFr}</p>}
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
                  dangerouslySetInnerHTML={{ __html: q.textFr }}
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
                        <span dangerouslySetInnerHTML={{ __html: opt.textFr }} />
                        {correct && (
                          <span style={{ marginLeft: "auto", color: "var(--success)", fontWeight: 700, fontSize: 12 }}>
                            {lang === "fr" ? "✓ correct" : "✓ correct"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {q.remediation.videos.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                      {lang === "fr" ? "Vidéos à vérifier" : "Videos to verify"}
                    </div>
                    <div className="col" style={{ gap: 6 }}>
                      {q.remediation.videos.map((v, vi) => {
                        const key = `${pIdx}-${qIdx}-${vi}`;
                        const checked = videoChecked.has(key);
                        return (
                          <div key={vi} className="row" style={{ gap: 8, fontSize: 12.5 }}>
                            <a
                              href={v.url}
                              target="_blank"
                              rel="noreferrer"
                              className="muted"
                              style={{
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                padding: "6px 10px",
                                background: "rgba(0,0,0,0.2)",
                                border: "1px solid var(--border)",
                                borderRadius: 8,
                                textDecoration: "underline",
                              }}
                            >
                              {v.label} — {v.url}
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
                            >
                              {checked ? (lang === "fr" ? "✓ Vérifié" : "✓ Verified") : lang === "fr" ? "Vérifier" : "Verify"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="dim" style={{ marginTop: 10, fontSize: 12 }}>
                  {lang === "fr" ? "→ 2 questions de suivi + 1 vérification incluses" : "→ 2 follow-ups + 1 retry included"}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

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
        <div className="muted" style={{ fontSize: 13 }}>
          {lang === "fr"
            ? "Le quiz sera créé en brouillon. Vous pourrez l'éditer puis le publier."
            : "The quiz will be created as a draft. You can edit it and then publish."}
        </div>
        <div className="row">
          <button type="button" className="btn btn--ghost" onClick={() => setStage("input")}>
            {lang === "fr" ? "Retour" : "Back"}
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={submit}
            disabled={busy}
            style={busy ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
          >
            {busy ? (lang === "fr" ? "Création…" : "Creating…") : lang === "fr" ? "Créer le quiz" : "Create the quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}
