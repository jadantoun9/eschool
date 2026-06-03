import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewQuizForm from "./NewQuizForm";
import ChooseMethod from "./ChooseMethod";
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

  if (step === "choose") {
    return (
      <div className="container container--narrow">
        <a
          href="/admin"
          className="muted"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 16 }}
        >
          ← {t("common.backDashboard", lang)}
        </a>
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          {t("quizNew.eyebrow", lang)}
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
          {t("quizNew.subtitle", lang)}
        </p>

        <ChooseMethod
          lang={lang}
          manualHref={manualHref}
          importHref="/admin/quizzes/import"
        />
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
        ← {t("quizNew.changeMethodBack", lang)}
      </a>
      <div className="eyebrow" style={{ marginBottom: 16 }}>
        {t("quizNew.eyebrowManual", lang)}
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
