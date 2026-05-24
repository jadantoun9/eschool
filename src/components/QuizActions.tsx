"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function QuizActions({
  id,
  slug,
  labels,
}: {
  id: string;
  slug: string;
  labels: {
    edit: string;
    results: string;
    viewAsStudent: string;
    copyLink: string;
    copied: string;
    moreActions: string;
  };
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/q/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex justify-end gap-2">
      <Link
        href={`/admin/quizzes/${id}/edit`}
        className="inline-flex h-8 items-center whitespace-nowrap rounded-md bg-slate-900 px-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
      >
        {labels.edit}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={labels.moreActions}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          <span className="text-base leading-none">⋯</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/admin/quizzes/${id}/results`}>{labels.results}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/q/${slug}`} target="_blank" rel="noopener noreferrer">
              {labels.viewAsStudent}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              copy();
            }}
          >
            {copied ? labels.copied : labels.copyLink}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
