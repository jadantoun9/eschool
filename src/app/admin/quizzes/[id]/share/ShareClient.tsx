"use client";

import { useEffect, useState } from "react";

export default function ShareClient({ slug, title, isPublished }: { slug: string; title: string; isPublished: boolean }) {
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
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontFamily: "Crimson Pro, serif", fontSize: 26, marginBottom: 12 }}>Partager : {title}</h1>

      <div className="card">
        {!isPublished && (
          <div style={{ background: "var(--amber-l)", color: "#7C2D12", padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
            ⚠ Cette fiche n&apos;est pas publiée. Les élèves verront une 404. Activez « Publié » dans l&apos;édition.
          </div>
        )}
        <div className="field">
          <label>Lien à envoyer aux élèves</label>
          <input value={url} readOnly onFocus={(e) => e.currentTarget.select()} />
        </div>
        <button className="btn-primary" onClick={copy} style={{ marginTop: 12 }}>
          {copied ? "Copié !" : "Copier le lien"}
        </button>
      </div>
    </div>
  );
}
