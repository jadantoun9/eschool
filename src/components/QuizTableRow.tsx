"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useConfirm } from "@/components/ConfirmDialog";
import { chipClass } from "@/lib/subject-style";

type Props = {
  id: string;
  slug: string;
  title: string;
  subjectName: string;
  subjectIcon: string;
  subjectColorKey: string;
  gradeName: string;
  authorName: string | null;
  questionsCount: number;
  submissionsCount: number;
  isPublished: boolean;
  publishedLabel: string;
  draftLabel: string;
  editLabel: string;
  resultsLabel: string;
  viewAsStudentLabel: string;
  confirmPublishTitle: string;
  confirmPublishDesc: string;
  confirmUnpublishTitle: string;
  confirmUnpublishDesc: string;
  confirmPublishText: string;
  confirmUnpublishText: string;
  cancelLabel: string;
};

export function QuizTableRow(p: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const [published, setPublished] = useState(p.isPublished);
  const [toggling, setToggling] = useState(false);
  const [, startTransition] = useTransition();

  async function requestToggle() {
    if (toggling) return;
    const next = !published;
    await confirm({
      title: next ? p.confirmPublishTitle : p.confirmUnpublishTitle,
      description: next ? p.confirmPublishDesc : p.confirmUnpublishDesc,
      confirmText: next ? p.confirmPublishText : p.confirmUnpublishText,
      cancelText: p.cancelLabel,
      tone: next ? "default" : "danger",
      onConfirm: async () => {
        setToggling(true);
        const res = await fetch(`/api/quizzes/${p.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ isPublished: next }),
        });
        setToggling(false);
        if (!res.ok) throw new Error("Failed to update status");
        setPublished(next);
        startTransition(() => router.refresh());
      },
    });
  }

  return (
    <tr>
      <td>
        <div className="table__title">
          <span className={`icon-chip icon-chip--sm ${chipClass(p.subjectColorKey)}`}>
            {p.subjectIcon}
          </span>
          <span>{p.title}</span>
        </div>
      </td>
      <td className="muted">{p.subjectName}</td>
      <td>
        <span className="badge badge--grade">{p.gradeName}</span>
      </td>
      {p.authorName !== null && <td className="muted">{p.authorName}</td>}
      <td className="numeric" style={{ textAlign: "right" }}>
        {p.questionsCount}
      </td>
      <td className="numeric" style={{ textAlign: "right" }}>
        {p.submissionsCount.toLocaleString()}
      </td>
      <td>
        <div className="switch__row">
          <button
            type="button"
            role="switch"
            className="switch"
            aria-checked={published}
            disabled={toggling}
            onClick={requestToggle}
            title={published ? p.publishedLabel : p.draftLabel}
          >
            <span className="switch__thumb" />
          </button>
          <span className="switch__label">
            {published ? p.publishedLabel : p.draftLabel}
          </span>
        </div>
      </td>
      <td>
        <div className="table__actions">
          <Link
            href={`/admin/quizzes/${p.id}/edit`}
            className="btn btn--ghost btn--sm"
          >
            {p.editLabel}
          </Link>
          <Link
            href={`/admin/quizzes/${p.id}/results`}
            className="btn btn--ghost btn--sm"
          >
            {p.resultsLabel}
          </Link>
          <Link href={`/q/${p.slug}`} className="btn btn--ghost btn--sm">
            {p.viewAsStudentLabel}
          </Link>
        </div>
      </td>
    </tr>
  );
}
