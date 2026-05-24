"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inputCls =
  "h-11 border-slate-200 text-sm focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/10";

export default function ShareClient({
  slug,
  title,
  isPublished,
  strings,
}: {
  slug: string;
  title: string;
  isPublished: boolean;
  strings: Record<string, string>;
}) {
  const s = strings;
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/q/${slug}`);
  }, [slug]);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {s["share.title"]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{title}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 text-base font-semibold text-slate-900">
          {s["share.linkTitle"]}
        </div>
        <div className="flex flex-col gap-4">
          {!isPublished && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {s["share.warning"]}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="share-url" className="text-sm font-medium text-slate-700">
              {s["share.linkLabel"]}
            </Label>
            <Input
              id="share-url"
              value={url}
              readOnly
              onFocus={(e) => e.currentTarget.select()}
              className={inputCls}
            />
          </div>
          <div>
            <Button
              onClick={copy}
              className="h-11 bg-slate-900 px-6 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              {copied ? s["share.copied"] : s["share.copy"]}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
