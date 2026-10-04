import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { BackLink } from "@/components/BackLink";
import { AnswerList, type AnswerListAnswer } from "@/components/AnswerList";
import { scoreColor, scorePct, studentKey } from "@/lib/students";

const optionSelect = {
  orderBy: { letter: "asc" as const },
  select: { letter: true, textFr: true, textEn: true, isCorrect: true },
};

export default async function StudentSubmissionPage({
  params,
}: {
  params: Promise<{ key: string; submissionId: string }>;
}) {
  const { key, submissionId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const lang = await getLang();

  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      answers: true,
      quiz: {
        select: {
          teacherId: true,
          titleFr: true,
          titleEn: true,
          questions: {
            where: { parentId: null },
            orderBy: { order: "asc" },
            select: {
              id: true,
              skillTag: true,
              textFr: true,
              textEn: true,
              options: optionSelect,
              followUps: {
                orderBy: { order: "asc" },
                select: { id: true, skillTag: true, textFr: true, textEn: true, options: optionSelect },
              },
            },
          },
        },
      },
    },
  });
  if (!sub) notFound();
  if (session.user.role !== "SUPER_ADMIN" && sub.quiz.teacherId !== session.user.id) notFound();
  if (studentKey(sub.studentName, sub.studentClass) !== key) notFound();

  const answers: Record<string, AnswerListAnswer> = {};
  for (const a of sub.answers) answers[a.questionId] = { chosenLetter: a.chosenLetter, isCorrect: a.isCorrect };

  const pct = scorePct(sub.score, sub.total);
  const title = lang === "en" && sub.quiz.titleEn ? sub.quiz.titleEn : sub.quiz.titleFr;
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  return (
    <>
      <BackLink href={`/admin/students/${key}`} label={sub.studentName} />
      <div className="section-head" style={{ marginBottom: 28 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            {sub.studentName}
            {sub.studentClass ? ` · ${sub.studentClass}` : ""}
          </div>
          <h1 className="h1" style={{ marginBottom: 6 }}>
            {title}
          </h1>
          <p className="muted">
            {sub.submittedAt.toLocaleString(locale)} · {sub.language.toUpperCase()}
          </p>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="stat__num numeric">
              {sub.score}/{sub.total}
            </div>
            <div className="stat__label">{t("students.col.score", lang)}</div>
          </div>
          <div className="stat">
            <div className="stat__num numeric" style={{ color: scoreColor(pct) }}>
              {pct}%
            </div>
            <div className="stat__label">%</div>
          </div>
        </div>
      </div>

      <AnswerList questions={sub.quiz.questions} answers={answers} lang={lang} />

      <div style={{ height: 80 }} />
    </>
  );
}
