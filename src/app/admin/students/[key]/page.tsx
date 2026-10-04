import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { BackLink } from "@/components/BackLink";
import { RowLink } from "@/components/RowLink";
import { scoreColor, scorePct, studentKey, submissionScope } from "@/lib/students";

export default async function StudentPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const lang = await getLang();

  const all = await prisma.submission.findMany({
    where: submissionScope(session.user),
    orderBy: { submittedAt: "desc" },
    include: {
      quiz: {
        select: {
          titleFr: true,
          titleEn: true,
          subject: { select: { nameFr: true, nameEn: true, icon: true } },
          grade: { select: { nameFr: true, nameEn: true } },
        },
      },
    },
  });
  const subs = all.filter((s) => studentKey(s.studentName, s.studentClass) === key);
  if (subs.length === 0) notFound();

  const name = subs[0].studentName;
  const cls = subs[0].studentClass;
  const avg = Math.round(subs.reduce((acc, s) => acc + scorePct(s.score, s.total), 0) / subs.length);
  const worksheetCount = new Set(subs.map((s) => s.quizId)).size;
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  return (
    <>
      <BackLink href="/admin/students" label={t("students.title", lang)} />
      <div className="section-head" style={{ marginBottom: 36 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            {t("students.eyebrowStudent", lang)}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(36px, 4vw, 56px)" }}>
            {name}
          </h1>
          {cls && (
            <p className="muted" style={{ marginTop: 8 }}>
              {t("students.col.class", lang)} · {cls}
            </p>
          )}
        </div>
        <div className="stats">
          <div className="stat">
            <div className="stat__num numeric">{worksheetCount}</div>
            <div className="stat__label">{t("students.completed", lang)}</div>
          </div>
          <div className="stat">
            <div className="stat__num numeric" style={{ color: scoreColor(avg) }}>
              {avg}%
            </div>
            <div className="stat__label">{t("students.col.avg", lang)}</div>
          </div>
        </div>
      </div>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>{t("students.col.worksheet", lang)}</th>
              <th style={{ width: 160 }}>{t("students.col.subject", lang)}</th>
              <th style={{ width: 90, textAlign: "right" }}>{t("students.col.score", lang)}</th>
              <th style={{ width: 70, textAlign: "right" }}>%</th>
              <th style={{ width: 170 }}>{t("students.col.date", lang)}</th>
              <th style={{ width: 160, textAlign: "right" }} />
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => {
              const pct = scorePct(s.score, s.total);
              const href = `/admin/students/${key}/${s.id}`;
              const title = lang === "en" && s.quiz.titleEn ? s.quiz.titleEn : s.quiz.titleFr;
              return (
                <RowLink key={s.id} href={href}>
                  <td style={{ fontWeight: 600 }}>
                    <Link href={href}>{title}</Link>
                    <span className="badge badge--grade" style={{ marginLeft: 8 }}>
                      {lang === "fr" ? s.quiz.grade.nameFr : s.quiz.grade.nameEn}
                    </span>
                  </td>
                  <td className="muted">
                    {s.quiz.subject.icon} {lang === "fr" ? s.quiz.subject.nameFr : s.quiz.subject.nameEn}
                  </td>
                  <td className="numeric" style={{ textAlign: "right" }}>
                    {s.score}/{s.total}
                  </td>
                  <td className="numeric" style={{ textAlign: "right", fontWeight: 700, color: scoreColor(pct) }}>
                    {pct}%
                  </td>
                  <td className="muted">{s.submittedAt.toLocaleString(locale)}</td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={href} className="btn btn--ghost btn--sm">
                      {t("students.viewAnswers", lang)}
                    </Link>
                  </td>
                </RowLink>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ height: 80 }} />
    </>
  );
}
