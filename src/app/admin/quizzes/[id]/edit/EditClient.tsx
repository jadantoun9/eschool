"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

// Stable client-side id generator (used to link questions to parts before save).
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
  parts: { id: string; order: number; titleFr: string; titleEn: string | null; subtitleFr: string | null; subtitleEn: string | null }[];
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

export default function EditClient({ quiz }: { quiz: QuizDto }) {
  const router = useRouter();

  // Metadata
  const [titleFr, setTitleFr] = useState(quiz.titleFr);
  const [titleEn, setTitleEn] = useState(quiz.titleEn ?? "");
  const [isPublished, setIsPublished] = useState(quiz.isPublished);

  // Prelim
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

  // Parts + questions (rehydrate DB ids → stable clientIds)
  const dbIdToClientId = new Map(quiz.parts.map((p) => [p.id, cid()]));
  const [parts, setParts] = useState<Part[]>(
    quiz.parts.length > 0
      ? quiz.parts.map((p) => ({
          clientId: dbIdToClientId.get(p.id)!,
          titleFr: p.titleFr,
          titleEn: p.titleEn,
          subtitleFr: p.subtitleFr,
          subtitleEn: p.subtitleEn,
        }))
      : []
  );
  const [questions, setQuestions] = useState<Question[]>(
    quiz.questions.length > 0
      ? quiz.questions.map((q) => ({
          clientId: cid(),
          partClientId: q.partId ? dbIdToClientId.get(q.partId) ?? null : null,
          skillTag: q.skillTag,
          textFr: q.textFr,
          textEn: q.textEn,
          hintFr: q.hintFr,
          hintEn: q.hintEn,
          explanationFr: q.explanationFr,
          explanationEn: q.explanationEn,
          options: q.options,
          remediation: q.remediation,
          followUps: q.followUps.map((fu) => ({ textFr: fu.textFr, textEn: fu.textEn, options: fu.options })),
        }))
      : [emptyQuestion(null)]
  );

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function updateQ(i: number, patch: Partial<Question>) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function updateOpt(i: number, j: number, patch: Partial<Option>) {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx !== i ? q : { ...q, options: q.options.map((o, oi) => (oi === j ? { ...o, ...patch } : o)) }
      )
    );
  }
  function setCorrect(i: number, j: number) {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx !== i ? q : { ...q, options: q.options.map((o, oi) => ({ ...o, isCorrect: oi === j })) }
      )
    );
  }
  function moveQ(i: number, delta: number) {
    setQuestions((qs) => {
      const j = i + delta;
      if (j < 0 || j >= qs.length) return qs;
      const next = qs.slice();
      [next[i], next[j]] = [next[j], next[i]];
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
    if (!r1.ok) { setBusy(false); setMsg({ kind: "err", text: "Erreur sur les métadonnées" }); return; }

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
          remediation: q.remediation ? { ...q.remediation, videoUrl: q.remediation.videoUrl || null } : null,
          followUps: q.followUps,
        })),
      }),
    });
    setBusy(false);
    if (!r2.ok) {
      const j = await r2.json().catch(() => ({}));
      setMsg({ kind: "err", text: j.error ?? "Erreur lors de l'enregistrement" });
      return;
    }
    setMsg({ kind: "ok", text: "Enregistré." });
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 880 }}>
      <h1 style={{ fontFamily: "Crimson Pro, serif", fontSize: 26, marginBottom: 12 }}>Éditer la fiche</h1>

      <div className="card">
        <div className="name-grid" style={{ marginBottom: 12 }}>
          <div className="field"><label>Titre (FR)</label><input value={titleFr} onChange={(e) => setTitleFr(e.target.value)} /></div>
          <div className="field"><label>Titre (EN)</label><input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} /></div>
        </div>
        <label style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          Publié (visible par les élèves via le lien)
        </label>
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--g500)" }}>
          Lien élève : <code>/q/{quiz.slug}</code>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Activité préliminaire (optionnel)</h2>
        <p style={{ fontSize: 13, color: "var(--g500)", marginBottom: 12 }}>
          Affichée en haut de la page élève. Par ex. une activité GeoGebra embarquée.
        </p>
        <div className="name-grid" style={{ marginBottom: 8 }}>
          <div className="field"><label>Badge (FR)</label><input value={prelim.badgeFr} onChange={(e) => setPrelim({ ...prelim, badgeFr: e.target.value })} placeholder="Activité préliminaire" /></div>
          <div className="field"><label>Badge (EN)</label><input value={prelim.badgeEn} onChange={(e) => setPrelim({ ...prelim, badgeEn: e.target.value })} /></div>
        </div>
        <div className="name-grid" style={{ marginBottom: 8 }}>
          <div className="field"><label>Titre (FR)</label><input value={prelim.titleFr} onChange={(e) => setPrelim({ ...prelim, titleFr: e.target.value })} /></div>
          <div className="field"><label>Titre (EN)</label><input value={prelim.titleEn} onChange={(e) => setPrelim({ ...prelim, titleEn: e.target.value })} /></div>
        </div>
        <div className="field" style={{ marginBottom: 8 }}>
          <label>Description (FR)</label>
          <textarea rows={2} value={prelim.descFr} onChange={(e) => setPrelim({ ...prelim, descFr: e.target.value })} />
        </div>
        <div className="field" style={{ marginBottom: 8 }}>
          <label>Description (EN)</label>
          <textarea rows={2} value={prelim.descEn} onChange={(e) => setPrelim({ ...prelim, descEn: e.target.value })} />
        </div>
        <div className="name-grid">
          <div className="field"><label>Lien plein écran (URL)</label><input value={prelim.url} onChange={(e) => setPrelim({ ...prelim, url: e.target.value })} placeholder="https://www.geogebra.org/m/..." /></div>
          <div className="field"><label>URL d&apos;intégration (iframe)</label><input value={prelim.embedUrl} onChange={(e) => setPrelim({ ...prelim, embedUrl: e.target.value })} placeholder="https://www.geogebra.org/classic/...?embed" /></div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Parties</h2>
        <p style={{ fontSize: 13, color: "var(--g500)", marginBottom: 10 }}>
          Regroupez vos questions par partie (ex. « Partie A — Prérequis »). Optionnel.
        </p>
        {parts.map((p, i) => (
          <div key={p.clientId} style={{ padding: 10, border: "1px solid var(--g200)", borderRadius: 8, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <strong style={{ flex: 1 }}>Partie {i + 1}</strong>
              <button className="btn-sm" onClick={() => moveP(i, -1)} disabled={i === 0}>↑</button>
              <button className="btn-sm" onClick={() => moveP(i, 1)} disabled={i === parts.length - 1}>↓</button>
              <button className="btn-sm" onClick={() => {
                // Detach any questions referencing this part before deletion.
                setQuestions((qs) => qs.map((q) => q.partClientId === p.clientId ? { ...q, partClientId: null } : q));
                setParts((ps) => ps.filter((_, idx) => idx !== i));
              }}>Supprimer</button>
            </div>
            <div className="name-grid" style={{ marginBottom: 6 }}>
              <div className="field"><label>Titre (FR)</label><input value={p.titleFr} onChange={(e) => setParts(parts.map((pp, idx) => idx === i ? { ...pp, titleFr: e.target.value } : pp))} /></div>
              <div className="field"><label>Titre (EN)</label><input value={p.titleEn ?? ""} onChange={(e) => setParts(parts.map((pp, idx) => idx === i ? { ...pp, titleEn: e.target.value } : pp))} /></div>
            </div>
            <div className="name-grid">
              <div className="field"><label>Sous-titre (FR)</label><input value={p.subtitleFr ?? ""} onChange={(e) => setParts(parts.map((pp, idx) => idx === i ? { ...pp, subtitleFr: e.target.value } : pp))} /></div>
              <div className="field"><label>Sous-titre (EN)</label><input value={p.subtitleEn ?? ""} onChange={(e) => setParts(parts.map((pp, idx) => idx === i ? { ...pp, subtitleEn: e.target.value } : pp))} /></div>
            </div>
          </div>
        ))}
        <button className="btn-sm" onClick={() => setParts([...parts, emptyPart()])}>+ Ajouter une partie</button>
      </div>

      {questions.map((q, i) => (
        <div className="card" key={q.clientId}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8 }}>
            <strong>Question {i + 1}</strong>
            <div style={{ display: "flex", gap: 6, flex: 1, justifyContent: "flex-end" }}>
              <select
                value={q.partClientId ?? ""}
                onChange={(e) => updateQ(i, { partClientId: e.target.value || null })}
                style={{ padding: "4px 8px", border: "1.5px solid var(--g200)", borderRadius: 8, fontSize: 13 }}
              >
                <option value="">— Sans partie —</option>
                {parts.map((p, idx) => <option key={p.clientId} value={p.clientId}>Partie {idx + 1} : {p.titleFr}</option>)}
              </select>
              <button className="btn-sm" onClick={() => moveQ(i, -1)} disabled={i === 0}>↑</button>
              <button className="btn-sm" onClick={() => moveQ(i, 1)} disabled={i === questions.length - 1}>↓</button>
              <button className="btn-sm" onClick={() => setQuestions((qs) => qs.filter((_, idx) => idx !== i))}>Supprimer</button>
            </div>
          </div>

          <div className="field" style={{ marginBottom: 8 }}>
            <label>Énoncé (FR) — HTML/LaTeX autorisé</label>
            <textarea rows={2} value={q.textFr} onChange={(e) => updateQ(i, { textFr: e.target.value })} />
          </div>
          <div className="field" style={{ marginBottom: 8 }}>
            <label>Énoncé (EN, optionnel)</label>
            <textarea rows={2} value={q.textEn ?? ""} onChange={(e) => updateQ(i, { textEn: e.target.value })} />
          </div>
          <div className="name-grid" style={{ marginBottom: 8 }}>
            <div className="field"><label>Indice (FR, optionnel)</label><input value={q.hintFr ?? ""} onChange={(e) => updateQ(i, { hintFr: e.target.value })} /></div>
            <div className="field"><label>Compétence (tag, optionnel)</label><input value={q.skillTag ?? ""} onChange={(e) => updateQ(i, { skillTag: e.target.value })} placeholder="ex: congruence_def" /></div>
          </div>

          <div style={{ margin: "12px 0 8px", fontSize: 12, fontWeight: 700, color: "var(--g500)", textTransform: "uppercase" }}>
            Options (cochez la bonne réponse)
          </div>
          {q.options.map((o, j) => (
            <div key={j} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr", gap: 8, marginBottom: 6, alignItems: "center" }}>
              <input type="radio" checked={o.isCorrect} onChange={() => setCorrect(i, j)} />
              <input placeholder={`${o.letter} (FR)`} value={o.textFr} onChange={(e) => updateOpt(i, j, { textFr: e.target.value })} />
              <input placeholder={`${o.letter} (EN)`} value={o.textEn ?? ""} onChange={(e) => updateOpt(i, j, { textEn: e.target.value })} />
            </div>
          ))}

          <div className="field" style={{ marginTop: 12 }}>
            <label>Explication (FR)</label>
            <textarea rows={2} value={q.explanationFr} onChange={(e) => updateQ(i, { explanationFr: e.target.value })} />
          </div>
          <div className="field">
            <label>Explication (EN, optionnel)</label>
            <textarea rows={2} value={q.explanationEn ?? ""} onChange={(e) => updateQ(i, { explanationEn: e.target.value })} />
          </div>

          <RemediationEditor value={q.remediation ?? null} onChange={(rm) => updateQ(i, { remediation: rm })} />

          {q.remediation && (
            <FollowUpsEditor followUps={q.followUps} onChange={(fus) => updateQ(i, { followUps: fus })} />
          )}
        </div>
      ))}

      <button className="btn-outline" onClick={() => setQuestions((qs) => [...qs, emptyQuestion(parts[parts.length - 1]?.clientId ?? null)])}>
        + Ajouter une question
      </button>

      {msg && (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 8, fontSize: 14, background: msg.kind === "ok" ? "var(--green-l)" : "var(--red-l)", color: msg.kind === "ok" ? "var(--green)" : "var(--red)" }}>
          {msg.text}
        </div>
      )}

      <div style={{ position: "sticky", bottom: 0, padding: "12px 0", background: "var(--g50)", marginTop: 12 }}>
        <button className="btn-primary" onClick={save} disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
      </div>
    </div>
  );
}

function RemediationEditor({ value, onChange }: { value: Remediation | null; onChange: (v: Remediation | null) => void }) {
  if (!value) {
    return (
      <button className="btn-sm" style={{ marginTop: 12 }} onClick={() => onChange({ explanationFr: "" })}>
        + Ajouter un bloc de remédiation
      </button>
    );
  }
  return (
    <div style={{ marginTop: 12, padding: 12, background: "var(--amber-l)", borderRadius: 8, border: "1px solid var(--amber-m)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <strong style={{ color: "#7C2D12", fontSize: 13 }}>Bloc de remédiation (affiché si l&apos;élève se trompe)</strong>
        <button className="btn-sm" onClick={() => onChange(null)}>Supprimer</button>
      </div>
      <div className="field" style={{ marginBottom: 8 }}>
        <label>Explication détaillée (FR)</label>
        <textarea rows={2} value={value.explanationFr} onChange={(e) => onChange({ ...value, explanationFr: e.target.value })} />
      </div>
      <div className="field" style={{ marginBottom: 8 }}>
        <label>Explication (EN, optionnel)</label>
        <textarea rows={2} value={value.explanationEn ?? ""} onChange={(e) => onChange({ ...value, explanationEn: e.target.value })} />
      </div>
      <div className="name-grid">
        <div className="field"><label>Vidéo (URL)</label><input value={value.videoUrl ?? ""} onChange={(e) => onChange({ ...value, videoUrl: e.target.value })} placeholder="https://youtube.com/..." /></div>
        <div className="field"><label>Titre de la vidéo</label><input value={value.videoTitle ?? ""} onChange={(e) => onChange({ ...value, videoTitle: e.target.value })} /></div>
      </div>
    </div>
  );
}

function FollowUpsEditor({ followUps, onChange }: { followUps: FollowUp[]; onChange: (v: FollowUp[]) => void }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--g500)", textTransform: "uppercase", marginBottom: 6 }}>
        Questions de suivi (affichées dans le bloc de remédiation)
      </div>
      {followUps.map((fu, k) => (
        <div key={k} style={{ padding: 12, border: "1px solid var(--amber-m)", borderRadius: 8, marginBottom: 8, background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <strong style={{ fontSize: 13 }}>Suivi {k + 1}</strong>
            <button className="btn-sm" onClick={() => onChange(followUps.filter((_, x) => x !== k))}>Supprimer</button>
          </div>
          <div className="field" style={{ marginBottom: 8 }}>
            <label>Énoncé (FR)</label>
            <textarea rows={2} value={fu.textFr} onChange={(e) => onChange(followUps.map((f, x) => x === k ? { ...f, textFr: e.target.value } : f))} />
          </div>
          <div className="field" style={{ marginBottom: 8 }}>
            <label>Énoncé (EN, optionnel)</label>
            <textarea rows={2} value={fu.textEn ?? ""} onChange={(e) => onChange(followUps.map((f, x) => x === k ? { ...f, textEn: e.target.value } : f))} />
          </div>
          {fu.options.map((o, j) => (
            <div key={j} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr", gap: 8, marginBottom: 6, alignItems: "center" }}>
              <input
                type="radio"
                checked={o.isCorrect}
                onChange={() => onChange(followUps.map((f, x) => x === k ? { ...f, options: f.options.map((oo, oi) => ({ ...oo, isCorrect: oi === j })) } : f))}
              />
              <input
                placeholder={`${o.letter} (FR)`}
                value={o.textFr}
                onChange={(e) => onChange(followUps.map((f, x) => x === k ? { ...f, options: f.options.map((oo, oi) => oi === j ? { ...oo, textFr: e.target.value } : oo) } : f))}
              />
              <input
                placeholder={`${o.letter} (EN)`}
                value={o.textEn ?? ""}
                onChange={(e) => onChange(followUps.map((f, x) => x === k ? { ...f, options: f.options.map((oo, oi) => oi === j ? { ...oo, textEn: e.target.value } : oo) } : f))}
              />
            </div>
          ))}
        </div>
      ))}
      <button className="btn-sm" onClick={() => onChange([...followUps, emptyFollowUp()])}>+ Ajouter un suivi</button>
    </div>
  );
}
