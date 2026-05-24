"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inputCls =
  "h-11 border-slate-200 text-sm focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/10";

const primaryBtnCls =
  "h-11 bg-slate-900 px-5 text-sm font-medium text-white shadow-sm hover:bg-slate-800";

export default function SubjectsClient({
  subjects,
  grades,
  strings,
}: {
  subjects: { id: string; name: string; quizCount: number }[];
  grades: { id: string; name: string }[];
  strings: Record<string, string>;
}) {
  const s = strings;
  const router = useRouter();
  const [subj, setSubj] = useState("");
  const [grade, setGrade] = useState("");

  async function addSubj() {
    if (!subj.trim()) return;
    await fetch("/api/subjects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: subj.trim() }),
    });
    setSubj("");
    router.refresh();
  }
  async function addGrade() {
    if (!grade.trim()) return;
    await fetch("/api/grades", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: grade.trim() }),
    });
    setGrade("");
    router.refresh();
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 text-base font-semibold text-slate-900">
          {s["subjects.mySubjects"]}
        </div>
        <div className="mb-5 text-sm text-slate-500">{s["subjects.mySubjectsDesc"]}</div>
        <ul className="mb-4 flex flex-col">
          {subjects.length === 0 && (
            <li className="py-4 text-sm text-slate-400">{s["subjects.noSubjects"]}</li>
          )}
          {subjects.map((sub) => (
            <li
              key={sub.id}
              className="flex items-center justify-between border-b border-slate-100 py-3 text-sm last:border-b-0"
            >
              <span className="font-medium text-slate-800">{sub.name}</span>
              <span className="text-xs text-slate-500">
                {sub.quizCount} {s["subjects.count"]}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Input
            value={subj}
            onChange={(e) => setSubj(e.target.value)}
            placeholder={s["subjects.newSubject"]}
            className={inputCls}
          />
          <Button onClick={addSubj} disabled={!subj.trim()} className={primaryBtnCls}>
            {s["subjects.add"]}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 text-base font-semibold text-slate-900">
          {s["subjects.grades"]}
        </div>
        <div className="mb-5 text-sm text-slate-500">{s["subjects.gradesDesc"]}</div>
        <ul className="mb-4 flex flex-col">
          {grades.length === 0 && (
            <li className="py-4 text-sm text-slate-400">{s["subjects.noGrades"]}</li>
          )}
          {grades.map((g) => (
            <li
              key={g.id}
              className="border-b border-slate-100 py-3 text-sm font-medium text-slate-800 last:border-b-0"
            >
              {g.name}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder={s["subjects.newGradePlaceholder"]}
            className={inputCls}
          />
          <Button onClick={addGrade} disabled={!grade.trim()} className={primaryBtnCls}>
            {s["subjects.add"]}
          </Button>
        </div>
      </div>
    </div>
  );
}
