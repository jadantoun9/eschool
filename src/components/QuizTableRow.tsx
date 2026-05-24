"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type Props = {
  id: string;
  slug: string;
  titleFr: string;
  subjectName: string;
  gradeName: string;
  questionsCount: number;
  submissionsCount: number;
  isPublished: boolean;
  publishedLabel: string;
  draftLabel: string;
  editLabel: string;
  resultsLabel: string;
};

const actionBtn =
  "inline-flex h-8 items-center whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900";

export function QuizTableRow(p: Props) {
  const router = useRouter();

  function openStudentView() {
    router.push(`/q/${p.slug}`);
  }

  function stop(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <tr
      onClick={openStudentView}
      className="cursor-pointer transition-colors hover:bg-slate-50/60"
    >
      <td className="px-6 py-4 font-medium text-slate-900">{p.titleFr}</td>
      <td className="px-6 py-4 text-slate-500">
        {p.subjectName} · {p.gradeName}
      </td>
      <td className="px-6 py-4 text-right text-slate-700 tabular-nums">
        {p.questionsCount}
      </td>
      <td className="px-6 py-4 text-right text-slate-700 tabular-nums">
        {p.submissionsCount}
      </td>
      <td className="px-6 py-4">
        {p.isPublished ? (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
            {p.publishedLabel}
          </Badge>
        ) : (
          <Badge className="border-slate-200 bg-slate-100 text-slate-600">
            {p.draftLabel}
          </Badge>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap justify-end gap-2" onClick={stop}>
          <Link
            href={`/admin/quizzes/${p.id}/edit`}
            className={actionBtn}
            onClick={stop}
          >
            {p.editLabel}
          </Link>
          <Link
            href={`/admin/quizzes/${p.id}/results`}
            className={actionBtn}
            onClick={stop}
          >
            {p.resultsLabel}
          </Link>
        </div>
      </td>
    </tr>
  );
}
