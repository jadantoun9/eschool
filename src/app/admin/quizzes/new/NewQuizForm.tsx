"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/Spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const inputCls =
  "h-11 border-slate-200 text-sm focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/10";

type Item = { id: string; name: string };

export default function NewQuizForm({
  subjects,
  grades,
  strings,
}: {
  subjects: Item[];
  grades: Item[];
  strings: Record<string, string>;
}) {
  const s = strings;
  const router = useRouter();
  const [subjectList, setSubjectList] = useState(subjects);
  const [gradeList, setGradeList] = useState(grades);
  const [titleFr, setTitleFr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [gradeId, setGradeId] = useState(grades[0]?.id ?? "");
  const [newSubject, setNewSubject] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function addSubject() {
    if (!newSubject.trim()) return;
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: newSubject.trim() }),
    });
    if (res.ok) {
      const sub = await res.json();
      setSubjectList((prev) => [...prev, sub]);
      setSubjectId(sub.id);
      setNewSubject("");
    }
  }
  async function addGrade() {
    if (!newGrade.trim()) return;
    const res = await fetch("/api/grades", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: newGrade.trim() }),
    });
    if (res.ok) {
      const g = await res.json();
      setGradeList((prev) => [...prev, g]);
      setGradeId(g.id);
      setNewGrade("");
    }
  }

  async function create() {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ titleFr, titleEn: titleEn || null, subjectId, gradeId }),
    });
    setBusy(false);
    if (!res.ok) {
      setErr((await res.json()).error ?? "Error");
      return;
    }
    const { id } = await res.json();
    router.push(`/admin/quizzes/${id}/edit`);
  }

  const selectCls =
    "h-11 border-slate-200 text-sm focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/10";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="grid gap-2">
          <Label htmlFor="titleFr" className="text-sm font-medium text-slate-700">
            {s["quiz.titleFr"]}
          </Label>
          <Input
            id="titleFr"
            value={titleFr}
            onChange={(e) => setTitleFr(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="titleEn" className="text-sm font-medium text-slate-700">
            {s["quiz.titleEn"]}
          </Label>
          <Input
            id="titleEn"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-slate-700">{s["quiz.subject"]}</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className={selectCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjectList.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                placeholder={s["quiz.newSubject"]}
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className={inputCls}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSubject}
                className="h-11 border-slate-200 px-4"
              >
                +
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium text-slate-700">{s["quiz.grade"]}</Label>
            <Select value={gradeId} onValueChange={setGradeId}>
              <SelectTrigger className={selectCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gradeList.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                placeholder={s["quiz.newGrade"]}
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                className={inputCls}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addGrade}
                className="h-11 border-slate-200 px-4"
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {err && (
          <Alert variant="destructive">
            <AlertDescription>{err}</AlertDescription>
          </Alert>
        )}

        <div className="pt-2">
          <Button
            disabled={busy || !titleFr.trim() || !subjectId || !gradeId}
            onClick={create}
            className="h-11 bg-slate-900 px-6 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size={16} /> {s["quiz.creating"]}
              </span>
            ) : (
              s["quiz.create"]
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
