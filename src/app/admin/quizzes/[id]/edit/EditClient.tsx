"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [titleFr, setTitleFr] = useState(quiz.titleFr);
  const [titleEn, setTitleEn] = useState(quiz.titleEn ?? "");
  const [isPublished, setIsPublished] = useState(quiz.isPublished);

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
          followUps: q.followUps.map((fu) => ({
            textFr: fu.textFr,
            textEn: fu.textEn,
            options: fu.options,
          })),
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
    <div className="flex max-w-4xl flex-col gap-6 pb-24">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{s["edit.title"]}</h1>
        <p className="mt-1 text-sm text-slate-500">{s["edit.subtitle"]}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{s["edit.metadata"]}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="titleFr">{s["quiz.titleFr"]}</Label>
              <Input id="titleFr" value={titleFr} onChange={(e) => setTitleFr(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="titleEn">{s["quiz.titleEn"]}</Label>
              <Input id="titleEn" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="pub"
              checked={isPublished}
              onCheckedChange={(v) => setIsPublished(!!v)}
            />
            <Label htmlFor="pub" className="cursor-pointer text-sm font-normal">
              {s["edit.published"]}
            </Label>
          </div>
          <div className="text-xs text-slate-500">
            {s["edit.studentLink"]} <code className="rounded bg-slate-100 px-1 py-0.5">/q/{quiz.slug}</code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{s["edit.prelim.title"]}</CardTitle>
          <CardDescription>{s["edit.prelim.desc"]}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Badge (FR)</Label>
              <Input
                value={prelim.badgeFr}
                onChange={(e) => setPrelim({ ...prelim, badgeFr: e.target.value })}
                placeholder="Activité préliminaire"
              />
            </div>
            <div className="grid gap-2">
              <Label>Badge (EN)</Label>
              <Input
                value={prelim.badgeEn}
                onChange={(e) => setPrelim({ ...prelim, badgeEn: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Titre (FR)</Label>
              <Input
                value={prelim.titleFr}
                onChange={(e) => setPrelim({ ...prelim, titleFr: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Titre (EN)</Label>
              <Input
                value={prelim.titleEn}
                onChange={(e) => setPrelim({ ...prelim, titleEn: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Description (FR)</Label>
            <Textarea
              rows={2}
              value={prelim.descFr}
              onChange={(e) => setPrelim({ ...prelim, descFr: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Description (EN)</Label>
            <Textarea
              rows={2}
              value={prelim.descEn}
              onChange={(e) => setPrelim({ ...prelim, descEn: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Lien plein écran (URL)</Label>
              <Input
                value={prelim.url}
                onChange={(e) => setPrelim({ ...prelim, url: e.target.value })}
                placeholder="https://www.geogebra.org/m/..."
              />
            </div>
            <div className="grid gap-2">
              <Label>URL d&apos;intégration (iframe)</Label>
              <Input
                value={prelim.embedUrl}
                onChange={(e) => setPrelim({ ...prelim, embedUrl: e.target.value })}
                placeholder="https://www.geogebra.org/classic/...?embed"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{s["edit.parts.title"]}</CardTitle>
          <CardDescription>{s["edit.parts.desc"]}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {parts.map((p, i) => (
            <div key={p.clientId} className="rounded-md border p-3">
              <div className="mb-3 flex items-center gap-2">
                <strong className="flex-1 text-sm">{s["edit.part"]} {i + 1}</strong>
                <Button size="sm" variant="outline" onClick={() => moveP(i, -1)} disabled={i === 0}>↑</Button>
                <Button size="sm" variant="outline" onClick={() => moveP(i, 1)} disabled={i === parts.length - 1}>↓</Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuestions((qs) =>
                      qs.map((q) => (q.partClientId === p.clientId ? { ...q, partClientId: null } : q))
                    );
                    setParts((ps) => ps.filter((_, idx) => idx !== i));
                  }}
                >
                  {s["edit.delete"]}
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Titre (FR)</Label>
                  <Input
                    value={p.titleFr}
                    onChange={(e) =>
                      setParts(parts.map((pp, idx) => (idx === i ? { ...pp, titleFr: e.target.value } : pp)))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Titre (EN)</Label>
                  <Input
                    value={p.titleEn ?? ""}
                    onChange={(e) =>
                      setParts(parts.map((pp, idx) => (idx === i ? { ...pp, titleEn: e.target.value } : pp)))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Sous-titre (FR)</Label>
                  <Input
                    value={p.subtitleFr ?? ""}
                    onChange={(e) =>
                      setParts(
                        parts.map((pp, idx) => (idx === i ? { ...pp, subtitleFr: e.target.value } : pp))
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Sous-titre (EN)</Label>
                  <Input
                    value={p.subtitleEn ?? ""}
                    onChange={(e) =>
                      setParts(
                        parts.map((pp, idx) => (idx === i ? { ...pp, subtitleEn: e.target.value } : pp))
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}
          <div>
            <Button variant="outline" onClick={() => setParts([...parts, emptyPart()])}>
              {s["edit.addPart"]}
            </Button>
          </div>
        </CardContent>
      </Card>

      {questions.map((q, i) => (
        <Card key={q.clientId}>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="flex-1">{s["edit.question"]} {i + 1}</CardTitle>
              <div className="w-56">
                <Select
                  value={q.partClientId ?? "__none__"}
                  onValueChange={(v) => updateQ(i, { partClientId: v === "__none__" ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{s["edit.noPart"]}</SelectItem>
                    {parts.map((p, idx) => (
                      <SelectItem key={p.clientId} value={p.clientId}>
                        {s["edit.part"]} {idx + 1} : {p.titleFr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" variant="outline" onClick={() => moveQ(i, -1)} disabled={i === 0}>↑</Button>
              <Button size="sm" variant="outline" onClick={() => moveQ(i, 1)} disabled={i === questions.length - 1}>↓</Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuestions((qs) => qs.filter((_, idx) => idx !== i))}
              >
                Supprimer
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label>{s["edit.statement.fr"]}</Label>
              <Textarea
                rows={2}
                value={q.textFr}
                onChange={(e) => updateQ(i, { textFr: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{s["edit.statement.en"]}</Label>
              <Textarea
                rows={2}
                value={q.textEn ?? ""}
                onChange={(e) => updateQ(i, { textEn: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>{s["edit.hint"]}</Label>
                <Input value={q.hintFr ?? ""} onChange={(e) => updateQ(i, { hintFr: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>{s["edit.skill"]}</Label>
                <Input
                  value={q.skillTag ?? ""}
                  onChange={(e) => updateQ(i, { skillTag: e.target.value })}
                  placeholder="ex: congruence_def"
                />
              </div>
            </div>

            <Separator />
            <div className="text-xs font-semibold uppercase text-slate-500">
              {s["edit.options"]}
            </div>
            {q.options.map((o, j) => (
              <div key={j} className="grid grid-cols-[24px_1fr_1fr] items-center gap-2">
                <input
                  type="radio"
                  checked={o.isCorrect}
                  onChange={() => setCorrect(i, j)}
                  className="h-4 w-4"
                />
                <Input
                  placeholder={`${o.letter} (FR)`}
                  value={o.textFr}
                  onChange={(e) => updateOpt(i, j, { textFr: e.target.value })}
                />
                <Input
                  placeholder={`${o.letter} (EN)`}
                  value={o.textEn ?? ""}
                  onChange={(e) => updateOpt(i, j, { textEn: e.target.value })}
                />
              </div>
            ))}

            <div className="grid gap-2">
              <Label>{s["edit.explanation.fr"]}</Label>
              <Textarea
                rows={2}
                value={q.explanationFr}
                onChange={(e) => updateQ(i, { explanationFr: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{s["edit.explanation.en"]}</Label>
              <Textarea
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
          </CardContent>
        </Card>
      ))}

      <div>
        <Button
          variant="outline"
          onClick={() =>
            setQuestions((qs) => [
              ...qs,
              emptyQuestion(parts[parts.length - 1]?.clientId ?? null),
            ])
          }
        >
          {s["edit.addQuestion"]}
        </Button>
      </div>

      {msg && (
        <Alert variant={msg.kind === "ok" ? "default" : "destructive"}>
          <AlertDescription>{msg.text}</AlertDescription>
        </Alert>
      )}

      <div className="sticky bottom-0 -mx-8 border-t bg-background/90 px-8 py-3 backdrop-blur">
        <Button onClick={save} disabled={busy} className="h-11 bg-slate-900 px-6 text-sm font-medium text-white shadow-sm hover:bg-slate-800">
          {busy ? s["edit.saving"] : s["edit.save"]}
        </Button>
      </div>
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
      <div>
        <Button variant="outline" onClick={() => onChange({ explanationFr: "" })}>
          {s["edit.addRemed"]}
        </Button>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <strong className="text-sm text-amber-900">{s["edit.remed.title"]}</strong>
        <Button size="sm" variant="outline" onClick={() => onChange(null)}>
          {s["edit.delete"]}
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid gap-2">
          <Label>{s["edit.remed.detailFr"]}</Label>
          <Textarea
            rows={2}
            value={value.explanationFr}
            onChange={(e) => onChange({ ...value, explanationFr: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>{s["edit.remed.detailEn"]}</Label>
          <Textarea
            rows={2}
            value={value.explanationEn ?? ""}
            onChange={(e) => onChange({ ...value, explanationEn: e.target.value })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>{s["edit.remed.videoUrl"]}</Label>
            <Input
              value={value.videoUrl ?? ""}
              onChange={(e) => onChange({ ...value, videoUrl: e.target.value })}
              placeholder="https://youtube.com/..."
            />
          </div>
          <div className="grid gap-2">
            <Label>{s["edit.remed.videoTitle"]}</Label>
            <Input
              value={value.videoTitle ?? ""}
              onChange={(e) => onChange({ ...value, videoTitle: e.target.value })}
            />
          </div>
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
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold uppercase text-slate-500">
        {s["edit.followups"]}
      </div>
      {followUps.map((fu, k) => (
        <div key={k} className="rounded-md border bg-card p-3">
          <div className="mb-3 flex items-center justify-between">
            <strong className="text-sm">{s["edit.followup"]} {k + 1}</strong>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onChange(followUps.filter((_, x) => x !== k))}
            >
              {s["edit.delete"]}
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="grid gap-2">
              <Label>{s["edit.statement.fr"]}</Label>
              <Textarea
                rows={2}
                value={fu.textFr}
                onChange={(e) =>
                  onChange(followUps.map((f, x) => (x === k ? { ...f, textFr: e.target.value } : f)))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>{s["edit.statement.en"]}</Label>
              <Textarea
                rows={2}
                value={fu.textEn ?? ""}
                onChange={(e) =>
                  onChange(followUps.map((f, x) => (x === k ? { ...f, textEn: e.target.value } : f)))
                }
              />
            </div>
            {fu.options.map((o, j) => (
              <div key={j} className="grid grid-cols-[24px_1fr_1fr] items-center gap-2">
                <input
                  type="radio"
                  checked={o.isCorrect}
                  onChange={() =>
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
                  className="h-4 w-4"
                />
                <Input
                  placeholder={`${o.letter} (FR)`}
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
                <Input
                  placeholder={`${o.letter} (EN)`}
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
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div>
        <Button variant="outline" onClick={() => onChange([...followUps, emptyFollowUp()])}>
          {s["edit.addFollowup"]}
        </Button>
      </div>
    </div>
  );
}
