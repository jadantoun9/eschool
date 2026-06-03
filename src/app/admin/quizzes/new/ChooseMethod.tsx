"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

const check = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, marginTop: 3, color: "var(--accent)" }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

type Method = "ai" | "manual";

export default function ChooseMethod({
  lang,
  manualHref,
  importHref,
}: {
  lang: "fr" | "en";
  manualHref: string;
  importHref: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Method>("ai");

  const cards: Array<{
    id: Method;
    badge?: string;
    icon: React.ReactNode;
    title: string;
    body: string;
    bullets: string[];
  }> = [
    {
      id: "ai",
      badge: t("quizNew.badgeFastest", lang),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
          <path d="M19 14l.8 2.4L22 17l-2.2.6L19 20l-.8-2.4L16 17l2.2-.6L19 14z" />
          <path d="M5 16l.6 1.8L7 18l-1.4.4L5 20l-.6-1.8L3 18l1.4-.4L5 16z" />
        </svg>
      ),
      title: t("quizNew.aiTitle", lang),
      body: t("quizNew.aiBody", lang),
      bullets:
        lang === "fr"
          ? [
              "Idéal pour 8 à 12 questions d'un coup",
              "L'IA pose les questions, tu réponds simplement",
              "Tu relis et modifies tout avant publication",
            ]
          : [
              "Best for 8–12 questions in one go",
              "The AI asks the questions, you answer in plain words",
              "You review & edit everything before publishing",
            ],
    },
    {
      id: "manual",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      ),
      title: t("quizNew.manualTitle", lang),
      body: t("quizNew.manualBody", lang),
      bullets:
        lang === "fr"
          ? [
              "Contrôle total sur chaque question",
              "Idéal pour 1 à 5 questions déjà en tête",
              "Choisis tes propres vidéos YouTube",
            ]
          : [
              "Full control over every question",
              "Best for 1–5 questions you already have in mind",
              "Pick your own YouTube help videos",
            ],
    },
  ];

  const handleContinue = () => {
    router.push(selected === "ai" ? importHref : manualHref);
  };

  return (
    <>
      <div className="grid grid--2">
        {cards.map((card) => {
          const isSelected = selected === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelected(card.id)}
              aria-pressed={isSelected}
              className="card card--link"
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                textAlign: "left",
                width: "100%",
                padding: 28,
                cursor: "pointer",
                color: "inherit",
                font: "inherit",
                background: isSelected ? "var(--surface-2)" : "var(--surface)",
                borderColor: isSelected ? "var(--accent)" : "var(--border)",
                boxShadow: isSelected ? "0 0 0 1px var(--accent)" : "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {card.badge ? (
                  <span className="badge badge--accent">{card.badge}</span>
                ) : null}
                <span
                  aria-hidden
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    border: `2px solid ${isSelected ? "var(--accent)" : "var(--border-strong)"}`,
                    background: isSelected ? "var(--accent)" : "transparent",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {isSelected ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fg)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : null}
                </span>
              </div>

              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,204,0,0.12)",
                  color: "var(--accent)",
                  marginBottom: 18,
                }}
              >
                {card.icon}
              </div>
              <div className="h3" style={{ marginBottom: 8 }}>
                {card.title}
              </div>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 18 }}>
                {card.body}
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {card.bullets.map((b) => (
                  <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 8 }} className="muted">
                    {check}
                    {b}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn--primary btn--lg" onClick={handleContinue}>
          {t("quizNew.continue", lang)}
          <span aria-hidden>→</span>
        </button>
      </div>
    </>
  );
}
