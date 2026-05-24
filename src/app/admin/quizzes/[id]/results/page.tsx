import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const lang = await getLang();

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        where: { parentId: null },
        select: { id: true, order: true, skillTag: true, textFr: true },
      },
      submissions: { orderBy: { submittedAt: "desc" }, include: { answers: true } },
    },
  });
  if (!quiz) notFound();
  if (session.user.role !== "SUPER_ADMIN" && quiz.teacherId !== session.user.id) notFound();

  const total = quiz.questions.length;

  const skillStats = new Map<string, { correct: number; total: number }>();
  for (const sub of quiz.submissions) {
    for (const ans of sub.answers) {
      const q = quiz.questions.find((qq) => qq.id === ans.questionId);
      if (!q || !q.skillTag) continue;
      const st = skillStats.get(q.skillTag) ?? { correct: 0, total: 0 };
      st.total++;
      if (ans.isCorrect) st.correct++;
      skillStats.set(q.skillTag, st);
    }
  }

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {t("results.title", lang)}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {quiz.titleFr} · {quiz.submissions.length} {t("results.summary", lang)} {total}{" "}
          {t("results.questions", lang)}
        </p>
      </div>

      {skillStats.size > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 text-base font-semibold text-slate-900">
            {t("results.bySkill", lang)}
          </div>
          <div className="flex flex-col gap-4">
            {[...skillStats.entries()].map(([skill, st]) => {
              const pct = Math.round((st.correct / Math.max(1, st.total)) * 100);
              const barColor =
                pct >= 75
                  ? "bg-emerald-500"
                  : pct >= 50
                  ? "bg-amber-500"
                  : "bg-rose-500";
              return (
                <div key={skill}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{skill}</span>
                    <span className="text-xs text-slate-500">
                      {pct}% · {st.correct}/{st.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4 text-base font-semibold text-slate-900">
          {t("results.submissions", lang)}
        </div>
        {quiz.submissions.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            {t("results.empty", lang)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("results.col.student", lang)}
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("results.col.class", lang)}
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("results.col.score", lang)}
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("results.col.pct", lang)}
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("results.col.lang", lang)}
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("results.col.date", lang)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quiz.submissions.map((sub) => {
                const pct = Math.round((sub.score / Math.max(1, sub.total)) * 100);
                return (
                  <tr key={sub.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {sub.studentName}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {sub.studentClass ?? "—"}
                    </td>
                    <td className="px-6 py-4 tabular-nums text-slate-700">
                      {sub.score}/{sub.total}
                    </td>
                    <td className="px-6 py-4 tabular-nums text-slate-700">{pct}%</td>
                    <td className="px-6 py-4 text-slate-500">
                      {sub.language.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(sub.submittedAt).toLocaleString(
                        lang === "fr" ? "fr-FR" : "en-US"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
