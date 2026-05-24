import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
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
      _count: { select: { questions: true, submissions: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {t("dash.title", lang)}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t("dash.subtitle", lang)}</p>
        </div>
        <Button
          asChild
          className="h-11 bg-slate-900 px-6 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
        >
          <Link href="/admin/quizzes/new">{t("dash.newQuiz", lang)}</Link>
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-sm text-slate-500">{t("dash.empty", lang)}</p>
          <Button
            asChild
            variant="outline"
            className="mt-4 h-10 border-slate-300 px-5"
          >
            <Link href="/admin/quizzes/new">{t("dash.createFirst", lang)}</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("dash.col.title", lang)}
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("dash.col.subjectGrade", lang)}
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("dash.col.questions", lang)}
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("dash.col.submissions", lang)}
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("dash.col.status", lang)}
                </th>
                <th
                  className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                  style={{ width: 200 }}
                >
                  {t("dash.col.actions", lang)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quizzes.map((q) => (
                <QuizTableRow
                  key={q.id}
                  id={q.id}
                  slug={q.slug}
                  titleFr={q.titleFr}
                  subjectName={q.subject.name}
                  gradeName={q.grade.name}
                  questionsCount={q._count.questions}
                  submissionsCount={q._count.submissions}
                  isPublished={q.isPublished}
                  publishedLabel={t("dash.published", lang)}
                  draftLabel={t("dash.draft", lang)}
                  editLabel={t("dash.edit", lang)}
                  resultsLabel={t("dash.results", lang)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
