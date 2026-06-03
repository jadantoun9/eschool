import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuizTableRow } from "@/components/QuizTableRow";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const lang = await getLang();

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  const quizzes = await prisma.quiz.findMany({
    where: isSuperAdmin ? {} : { teacherId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      subject: true,
      grade: true,
      teacher: { select: { name: true } },
      _count: { select: { questions: true, submissions: true } },
    },
  });

  const totalSubs = quizzes.reduce((s, q) => s + q._count.submissions, 0);
  const publishedCount = quizzes.filter((q) => q.isPublished).length;

  return (
    <>
      <div className="section-head" style={{ marginBottom: 36 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            {isSuperAdmin
              ? t("adminDash.superAdminView", lang)
              : t("adminDash.welcome", lang)}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(40px, 4.5vw, 64px)" }}>
            {lang === "fr" ? (
              isSuperAdmin ? (
                <>
                  Toutes les <span className="accent">fiches</span>
                </>
              ) : (
                <>
                  Vos <span className="accent">fiches</span>
                </>
              )
            ) : isSuperAdmin ? (
              <>
                All <span className="accent">quizzes</span>
              </>
            ) : (
              <>
                Your <span className="accent">quizzes</span>
              </>
            )}
          </h1>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="stat__num numeric">{quizzes.length}</div>
            <div className="stat__label">{t("adminDash.total", lang)}</div>
          </div>
          <div className="stat">
            <div className="stat__num numeric">{publishedCount}</div>
            <div className="stat__label">{t("dash.published", lang)}</div>
          </div>
          <div className="stat">
            <div className="stat__num numeric">{totalSubs}</div>
            <div className="stat__label">{t("dash.col.submissions", lang)}</div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div className="spacer" style={{ flex: 1 }} />
        <Link href="/admin/quizzes/import" className="btn btn--ghost btn--sm">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 12V3M8 3L4 7M8 3l4 4M3 14h10" />
          </svg>
          {t("adminDash.importJson", lang)}
        </Link>
        <Link href="/admin/quizzes/new" className="btn btn--primary btn--sm">
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          {t("adminDash.newQuiz", lang)}
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📝</div>
          <h3 className="h4" style={{ marginBottom: 6 }}>
            {t("dash.empty", lang)}
          </h3>
          <p className="muted" style={{ marginBottom: 20 }}>
            {t("dash.subtitle", lang)}
          </p>
          <Link href="/admin/quizzes/new" className="btn btn--primary btn--sm">
            {t("dash.createFirst", lang)}
          </Link>
        </div>
      ) : (
        <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>{t("dash.col.title", lang)}</th>
              <th style={{ width: 130 }}>{t("adminDash.subject", lang)}</th>
              <th style={{ width: 90 }}>{t("adminDash.grade", lang)}</th>
              {isSuperAdmin && (
                <th style={{ width: 160 }}>{t("adminDash.author", lang)}</th>
              )}
              <th style={{ width: 70, textAlign: "right" }}>
                {t("dash.col.questions", lang)}
              </th>
              <th style={{ width: 120, textAlign: "right" }}>
                {t("dash.col.submissions", lang)}
              </th>
              <th style={{ width: 150 }}>{t("dash.col.status", lang)}</th>
              <th style={{ width: 290, textAlign: "right" }}>
                {t("dash.col.actions", lang)}
              </th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q) => (
              <QuizTableRow
                key={q.id}
                id={q.id}
                slug={q.slug}
                title={lang === "fr" ? q.titleFr : q.titleEn || q.titleFr}
                subjectName={lang === "fr" ? q.subject.nameFr : q.subject.nameEn}
                subjectIcon={q.subject.icon}
                subjectColorKey={q.subject.colorKey}
                gradeName={lang === "fr" ? q.grade.nameFr : q.grade.nameEn}
                authorName={isSuperAdmin ? q.teacher.name : null}
                questionsCount={q._count.questions}
                submissionsCount={q._count.submissions}
                isPublished={q.isPublished}
                publishedLabel={t("dash.published", lang)}
                draftLabel={t("dash.draft", lang)}
                editLabel={t("dash.edit", lang)}
                resultsLabel={t("dash.results", lang)}
                viewAsStudentLabel={t("dash.viewAsStudent", lang)}
                confirmPublishTitle={t("dash.confirmPublish.title", lang)}
                confirmPublishDesc={t("dash.confirmPublish.desc", lang)}
                confirmUnpublishTitle={t("dash.confirmUnpublish.title", lang)}
                confirmUnpublishDesc={t("dash.confirmUnpublish.desc", lang)}
                confirmPublishText={t("dash.confirmPublish.confirm", lang)}
                confirmUnpublishText={t("dash.confirmUnpublish.confirm", lang)}
                cancelLabel={t("dash.cancel", lang)}
              />
            ))}
          </tbody>
        </table>
        </div>
      )}

      <div style={{ height: 80 }} />
    </>
  );
}
