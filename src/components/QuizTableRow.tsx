"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Spinner } from "@/components/Spinner";
import { chipClass } from "@/lib/subject-style";

type Props = {
  id: string;
  slug: string;
  titleFr: string;
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
};

export function QuizTableRow(p: Props) {
  const router = useRouter();
  const [published, setPublished] = useState(p.isPublished);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  function openWorksheet() {
    // Drafts go to the editor (no public student view). Published opens student page.
    if (published) {
      router.push(`/q/${p.slug}`);
    } else {
      router.push(`/admin/quizzes/${p.id}/edit`);
    }
  }

  async function togglePublished(e: React.MouseEvent) {
    e.stopPropagation();
    if (toggling) return;
    const next = !published;
    setToggling(true);
    setPublished(next); // optimistic
    const res = await fetch(`/api/quizzes/${p.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isPublished: next }),
    });
    setToggling(false);
    if (!res.ok) {
      setPublished(!next); // revert
      return;
    }
    startTransition(() => router.refresh());
  }

  async function copyLink(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/q/${p.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function stop(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <tr onClick={openWorksheet} style={{ cursor: "pointer" }}>
      <td>
        <div className="table__title">
          <span className={`icon-chip icon-chip--sm ${chipClass(p.subjectColorKey)}`}>
            {p.subjectIcon}
          </span>
          <span>{p.titleFr}</span>
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
        <span
          className={`badge ${published ? "badge--published" : "badge--draft"}`}
        >
          <span className="dot" />
          {published ? p.publishedLabel : p.draftLabel}
        </span>
      </td>
      <td>
        <div className="table__actions" onClick={stop}>
          <Link
            href={`/admin/quizzes/${p.id}/edit`}
            className="icon-btn"
            title={p.editLabel}
            onClick={stop}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M11 2l3 3-8 8H3v-3z" />
            </svg>
          </Link>
          <Link
            href={`/admin/quizzes/${p.id}/results`}
            className="icon-btn"
            title={p.resultsLabel}
            onClick={stop}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M2 13h12M4 11V8M8 11V4M12 11V6" />
            </svg>
          </Link>
          <button
            type="button"
            className="icon-btn"
            title={copied ? "Copied!" : "Share"}
            onClick={copyLink}
          >
            {copied ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8.5L6.5 12 13 4" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="4" cy="8" r="2" />
                <circle cx="12" cy="3" r="2" />
                <circle cx="12" cy="13" r="2" />
                <path d="M6 7l4-3M6 9l4 3" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--accent"
            onClick={togglePublished}
            disabled={toggling}
            aria-pressed={published}
            title={published ? p.draftLabel : p.publishedLabel}
          >
            {toggling ? (
              <Spinner size={14} />
            ) : published ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 8l1.5-3h9L14 8M3 8h10v6H3z" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 2v9M4 7l4-5 4 5M3 14h10" />
              </svg>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}
