import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewQuizForm from "./NewQuizForm";
import { getLang } from "@/lib/lang";
import { dict, t } from "@/lib/i18n";

type SearchParams = Promise<{ subject?: string; grade?: string; step?: string }>;

export default async function NewQuizPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const lang = await getLang();
  const sp = await searchParams;

  const [subjects, grades] = await Promise.all([
    prisma.subject.findMany({ orderBy: { order: "asc" } }),
    prisma.grade.findMany({ orderBy: { order: "asc" } }),
  ]);

  const preSubjectId = sp.subject
    ? subjects.find((s) => s.slug === sp.subject)?.id ?? ""
    : "";
  const preGradeId = sp.grade
    ? grades.find((g) => g.slug === sp.grade)?.id ?? ""
    : "";

  const step = sp.step === "manual" ? "manual" : "choose";

  // Preserve any pre-selected subject/grade when moving into the manual step.
  const manualHref = (() => {
    const params = new URLSearchParams({ step: "manual" });
    if (sp.subject) params.set("subject", sp.subject);
    if (sp.grade) params.set("grade", sp.grade);
    return `/admin/quizzes/new?${params.toString()}`;
  })();

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

  const arrow = <span aria-hidden>→</span>;

  if (step === "choose") {
    return (
      <div className="container container--narrow">
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          {lang === "fr" ? "Nouvelle fiche" : "New worksheet"}
        </div>
        <h1 className="display" style={{ fontSize: "clamp(36px, 4vw, 52px)" }}>
          {lang === "fr" ? (
            <>
              Comment veux-tu la <span className="accent">construire</span> ?
            </>
          ) : (
            <>
              How would you like to <span className="accent">build it</span>?
            </>
          )}
        </h1>
        <p className="muted" style={{ marginTop: 16, marginBottom: 36, maxWidth: 560 }}>
          {lang === "fr"
            ? "Choisis un point de départ. Tu peux changer plus tard — les deux chemins mènent au même éditeur."
            : "Pick a starting point. You can always switch later — both paths land in the same editor."}
        </p>

        <div className="grid grid--2">
          <a
            className="card card--link"
            href={manualHref}
            style={{ display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit", padding: 28 }}
          >
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </div>
            <div className="h3" style={{ marginBottom: 8 }}>
              {lang === "fr" ? "Créer à la main" : "Create manually"}
            </div>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 18 }}>
              {lang === "fr"
                ? "Commence avec une fiche vide et ajoute les questions une à une dans l'éditeur."
                : "Start with a blank worksheet and add questions one by one in the editor."}
            </p>
            <ul style={{ margin: "0 0 22px 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 8 }} className="muted">
                {check}
                {lang === "fr" ? "Contrôle total sur chaque question" : "Full control over every question"}
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 8 }} className="muted">
                {check}
                {lang === "fr" ? "Idéal pour 1 à 5 questions déjà en tête" : "Best for 1–5 questions you already have in mind"}
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 8 }} className="muted">
                {check}
                {lang === "fr" ? "Choisis tes propres vidéos YouTube" : "Pick your own YouTube help videos"}
              </li>
            </ul>
            <span className="accent-text" style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
              {lang === "fr" ? "Commencer une fiche vide" : "Start a blank worksheet"} {arrow}
            </span>
          </a>

          <a
            className="card card--link"
            href="/admin/quizzes/import"
            style={{ position: "relative", display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit", padding: 28 }}
          >
            <span className="badge badge--accent" style={{ position: "absolute", top: 18, right: 18 }}>
              {lang === "fr" ? "Le + rapide" : "Fastest"}
            </span>
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
                <path d="M19 14l.8 2.4L22 17l-2.2.6L19 20l-.8-2.4L16 17l2.2-.6L19 14z" />
                <path d="M5 16l.6 1.8L7 18l-1.4.4L5 20l-.6-1.8L3 18l1.4-.4L5 16z" />
              </svg>
            </div>
            <div className="h3" style={{ marginBottom: 8 }}>
              {lang === "fr" ? "Construire avec l'IA" : "Build it with AI"}
            </div>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 18 }}>
              {lang === "fr"
                ? "Télécharge un modèle, donne-le à ChatGPT / Claude / Gemini, puis dépose le résultat ici."
                : "Download a template, give it to ChatGPT / Claude / Gemini, then drop the result back here."}
            </p>
            <ul style={{ margin: "0 0 22px 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 8 }} className="muted">
                {check}
                {lang === "fr" ? "Idéal pour 8 à 12 questions d'un coup" : "Best for 8–12 questions in one go"}
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 8 }} className="muted">
                {check}
                {lang === "fr" ? "L'IA pose les questions, tu réponds simplement" : "The AI asks the questions, you answer in plain words"}
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 8 }} className="muted">
                {check}
                {lang === "fr" ? "Tu relis et modifies tout avant publication" : "You review & edit everything before publishing"}
              </li>
            </ul>
            <span className="accent-text" style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
              {lang === "fr" ? "Obtenir le modèle & déposer le JSON" : "Get the template & drop JSON"} {arrow}
            </span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container container--form">
      <a
        href="/admin/quizzes/new"
        className="muted"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 12 }}
      >
        ← {lang === "fr" ? "Changer de méthode" : "Change build method"}
      </a>
      <div className="eyebrow" style={{ marginBottom: 16 }}>
        {lang === "fr" ? "Nouvelle fiche · manuel" : "New worksheet · manual"}
      </div>
      <h1 className="display" style={{ fontSize: "clamp(36px, 4vw, 52px)" }}>
        {lang === "fr" ? (
          <>
            Commençons par <span className="accent">l'essentiel</span>
          </>
        ) : (
          <>
            Start with the <span className="accent">basics</span>
          </>
        )}
      </h1>
      <p className="muted" style={{ marginTop: 16, marginBottom: 36, maxWidth: 540 }}>
        {t("quiz.new.subtitle", lang)}
      </p>

      <NewQuizForm
        strings={dict[lang]}
        lang={lang}
        subjects={subjects}
        grades={grades}
        preSubjectId={preSubjectId}
        preGradeId={preGradeId}
      />
    </div>
  );
}
