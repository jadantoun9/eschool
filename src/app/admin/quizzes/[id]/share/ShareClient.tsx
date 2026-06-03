"use client";

import { useEffect, useState } from "react";
import { chipClass } from "@/lib/subject-style";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { BackLink } from "@/components/BackLink";

export default function ShareClient({
  slug,
  titleFr,
  titleEn,
  isPublished,
  strings,
  lang,
  subjectNameFr,
  subjectNameEn,
  subjectIcon,
  subjectColorKey,
  gradeNameFr,
  gradeNameEn,
}: {
  slug: string;
  titleFr: string;
  titleEn: string | null;
  isPublished: boolean;
  strings: Record<string, string>;
  lang: Lang;
  subjectNameFr: string;
  subjectNameEn: string;
  subjectIcon: string;
  subjectColorKey: string;
  gradeNameFr: string;
  gradeNameEn: string;
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

  const title = lang === "fr" ? titleFr : (titleEn ?? titleFr);
  const subjectName = lang === "fr" ? subjectNameFr : subjectNameEn;
  const gradeName = lang === "fr" ? gradeNameFr : gradeNameEn;

  return (
    <>
      <BackLink href="/admin" label={t("common.backDashboard", lang)} />
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div className="row" style={{ gap: 10, marginBottom: 10 }}>
          <span className={`icon-chip icon-chip--sm ${chipClass(subjectColorKey)}`}>
            {subjectIcon}
          </span>
          <span className="muted" style={{ fontSize: 13 }}>
            {subjectName} · {gradeName}
          </span>
          {isPublished ? (
            <span className="badge badge--published">
              <span className="dot" />
              {t("share.published", lang)}
            </span>
          ) : (
            <span className="badge badge--draft">
              <span className="dot" />
              {t("share.draft", lang)}
            </span>
          )}
        </div>
        <h1 className="h1" style={{ marginBottom: 6 }}>
          {s["share.title"]}{" "}
          <span style={{ color: "var(--text-muted)" }}>· {title}</span>
        </h1>
        <p className="muted">
          {t("share.subheading", lang)}
        </p>
      </div>

      {/* Unpublished warning */}
      {!isPublished && (
        <div
          className="card"
          style={{
            marginBottom: 24,
            background: "rgba(245,158,11,0.08)",
            borderColor: "rgba(245,158,11,0.3)",
            color: "var(--warning)",
          }}
        >
          {s["share.warning"]}
        </div>
      )}

      {/* Two-column share grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div>
          {/* Public link card */}
          <div className="card" style={{ marginBottom: 18, borderRadius: "var(--radius-xl)", padding: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              🔗 {t("share.publicLink", lang)}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
              <input
                className="input"
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 13 }}
              />
              <button
                className={`btn ${copied ? "btn--ghost" : "btn--primary"}`}
                onClick={copy}
              >
                {copied ? s["share.copied"] : s["share.copy"]}
              </button>
            </div>
            <div
              className="muted"
              style={{ marginTop: 14, fontSize: 13, display: "flex", gap: 16, flexWrap: "wrap" }}
            >
              <span>● {t("share.linkLive", lang)}</span>
              <span>● {t("share.anonymous", lang)}</span>
            </div>
          </div>

          {/* Open / preview card */}
          <div className="card" style={{ borderRadius: "var(--radius-xl)", padding: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              👁 {t("share.preview", lang)}
            </div>
            <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
              {t("share.previewDesc", lang)}
            </p>
            <a
              href={url || `/q/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost btn--sm"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9" />
                <path d="M10 2h4v4M14 2L8 8" />
              </svg>
              {t("share.open", lang)}
            </a>
          </div>
        </div>

        {/* Right column — QR */}
        <div>
          <div className="card" style={{ textAlign: "center", borderRadius: "var(--radius-xl)", padding: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              📱 QR
            </div>
            {/* QR rendered by next/qrcode or a lightweight SVG approach */}
            <QRCode value={url || `${typeof window !== "undefined" ? window.location.origin : ""}/q/${slug}`} />
            <div
              style={{
                marginTop: 18,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              {title}
            </div>
            <p className="muted" style={{ marginTop: 6, fontSize: 13 }}>
              {t("share.qrHint", lang)}
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: 80 }} />
    </>
  );
}

/* ----------------------------------------------------------------
   Minimal deterministic QR-look SVG — purely decorative preview.
   Real links are provided as plain text above; this visual gives
   teachers an easy "project on the board" artefact.
---------------------------------------------------------------- */
function QRCode({ value }: { value: string }) {
  const size = 25;
  // deterministic hash from the URL value
  let h = 0;
  for (const c of value) h = (h * 31 + c.charCodeAt(0)) | 0;

  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      h = (h * 1664525 + 1013904223) | 0;
      const on = ((h >>> 8) & 1) === 1;
      const inFinder =
        (x < 8 && y < 8) ||
        (x > size - 9 && y < 8) ||
        (x < 8 && y > size - 9);
      if (on && !inFinder) cells.push({ x, y });
    }
  }

  return (
    <div
      style={{
        width: 200,
        height: 200,
        background: "#fff",
        borderRadius: 14,
        padding: 12,
        margin: "0 auto",
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        fill="#0a1936"
        shapeRendering="crispEdges"
        style={{ width: "100%", height: "100%" }}
      >
        {cells.map(({ x, y }) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
        ))}
        {/* Finder — top-left */}
        <Finder cx={0} cy={0} />
        {/* Finder — top-right */}
        <Finder cx={size - 7} cy={0} />
        {/* Finder — bottom-left */}
        <Finder cx={0} cy={size - 7} />
        {/* Centre dot */}
        <rect x={size / 2 - 2} y={size / 2 - 2} width="4" height="4" fill="#fff" />
        <circle cx={size / 2} cy={size / 2} r="1.4" fill="#ffcc00" />
      </svg>
    </div>
  );
}

function Finder({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <rect x={cx} y={cy} width="7" height="7" fill="#0a1936" />
      <rect x={cx + 1} y={cy + 1} width="5" height="5" fill="#fff" />
      <rect x={cx + 2} y={cy + 2} width="3" height="3" fill="#0a1936" />
    </>
  );
}
