import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { chipClass } from "@/lib/subject-style";

type Params = Promise<{ subjectSlug: string; gradeSlug: string }>;

export default async function GradePage({ params }: { params: Params }) {
  const { subjectSlug, gradeSlug } = await params;
  const [session, lang, subject, grade] = await Promise.all([
    auth(),
    getLang(),
    prisma.subject.findUnique({ where: { slug: subjectSlug } }),
    prisma.grade.findUnique({ where: { slug: gradeSlug } }),
  ]);
  if (!subject || !grade) notFound();

  const isStaff =
    session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "TEACHER";

  const quizzes = await prisma.quiz.findMany({
    where: {
      subjectId: subject.id,
      gradeId: grade.id,
      // Public viewers see published only; logged-in staff see drafts too.
      ...(isStaff ? {} : { isPublished: true }),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });

  const name = (x: { nameFr: string; nameEn: string }) =>
    lang === "fr" ? x.nameFr : x.nameEn;

  const worksheetCount = quizzes.length;
  const subtitleText =
    worksheetCount === 0
      ? t("browse.nothingHereYet", lang)
      : lang === "fr"
      ? `${worksheetCount} fiche${worksheetCount === 1 ? "" : "s"} — commence où tu veux`
      : `${worksheetCount} worksheet${worksheetCount === 1 ? "" : "s"} — start anywhere`;

  return (
    <div className="page">
      <div className="page-inner">
        <SiteNav mode="public" />

        <section className="section">
          <div className="container">

            {/* Back link */}
            <Link
              href={`/subjects/${subject.slug}`}
              className="muted"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 24 }}
            >
              ‹ {name(subject)}
            </Link>

            {/* Page header */}
            <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 12 }}>
              <span
                className={`icon-chip icon-chip--lg ${chipClass(subject.colorKey)}`}
                style={{ width: 56, height: 56, borderRadius: 16, fontSize: 26 }}
              >
                {subject.icon}
              </span>
              <div>
                <div className="muted" style={{ fontSize: 13, letterSpacing: "0.02em" }}>
                  {name(subject)} ·{" "}
                  <span className="badge badge--grade" style={{ marginLeft: 4 }}>
                    {name(grade)}
                  </span>
                </div>
                <h1 className="display" style={{ fontSize: "clamp(48px, 5vw, 76px)", marginTop: 6 }}>
                  {name(grade)}
                </h1>
              </div>
            </div>

            {/* Section head */}
            <div className="section-head" style={{ marginTop: 48 }}>
              <div>
                <h2 className="h2">{t("browse.worksheets", lang)}</h2>
                <p className="muted" style={{ marginTop: 6 }}>{subtitleText}</p>
              </div>
              {worksheetCount > 0 && (
                <div className="muted" style={{ fontSize: 13 }}>
                  {t("browse.sortedByRecommended", lang)}
                </div>
              )}
            </div>

            {/* Empty state */}
            {worksheetCount === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">📝</div>
                <h3 className="h3" style={{ marginBottom: 8 }}>
                  {t("browse.noWorksheetsYet", lang)}
                </h3>
                <p className="muted" style={{ maxWidth: 420, margin: "0 auto" }}>
                  {t("browse.emptyGradeHint", lang)}
                </p>
                <Link
                  href={`/subjects/${subject.slug}`}
                  className="btn btn--ghost"
                  style={{ marginTop: 24 }}
                >
                  ‹ {t("browse.otherGrades", lang)}
                </Link>
              </div>
            ) : (
              /* Worksheet grid */
              <div className="grid grid--2">
                {quizzes.map((q, i) => {
                  const title = lang === "fr" ? q.titleFr : q.titleEn || q.titleFr;
                  const href = q.isPublished
                    ? `/q/${q.slug}`
                    : `/admin/quizzes/${q.id}/edit`;
                  return (
                    <Link key={q.id} href={href} className="card card--link">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div className="row" style={{ gap: 8, marginBottom: 12 }}>
                            <span className="badge">{String(i + 1).padStart(2, "0")}</span>
                            <span className={`badge badge--grade`}>
                              {name(subject)}
                            </span>
                            {!q.isPublished && (
                              <span className="badge badge--draft">
                                {t("browse.draft", lang)}
                              </span>
                            )}
                          </div>
                          <div className="h3" style={{ marginBottom: 16, lineHeight: 1.2 }}>
                            {title}
                          </div>
                          <div className="row" style={{ gap: 18, fontSize: 13, color: "var(--text-muted)" }}>
                            <span>
                              <b className="numeric" style={{ color: "#fff" }}>{q._count.questions}</b>{" "}
                              {t("browse.questionsLabel", lang)}
                            </span>
                          </div>
                        </div>
                        <div className="arrow">›</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            <div style={{ height: 80 }} />
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}
