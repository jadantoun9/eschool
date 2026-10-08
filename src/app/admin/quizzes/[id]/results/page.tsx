import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { answerWithQuestion, challengeStats, followUpLabel, followUpStats, studentKey } from "@/lib/students";
import {
  SkillBreakdownRow,
  type BreakdownQuestion,
  type BreakdownStudent,
} from "@/components/SkillBreakdownRow";

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const lang = await getLang();

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        where: { parentId: null, isChallenge: false },
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          skillTag: true,
          textFr: true,
          textEn: true,
          options: { select: { letter: true, textFr: true, textEn: true, isCorrect: true } },
          remediation: { select: { id: true } },
          followUps: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              textFr: true,
              textEn: true,
              options: { select: { letter: true, textFr: true, textEn: true, isCorrect: true } },
            },
          },
        },
      },
      submissions: { orderBy: { submittedAt: "desc" }, include: { answers: { include: answerWithQuestion } } },
    },
  });
  if (!quiz) notFound();
  if (session.user.role !== "SUPER_ADMIN" && quiz.teacherId !== session.user.id) notFound();

  const total = quiz.questions.length;
  const loc = (fr: string, en: string | null) => (lang === "en" && en ? en : fr);

  // Per-skill stats, in question order. Each skill lists its questions and,
  // for the click-to-expand breakdown, every student who answered them.
  const skillStats = new Map<
    string,
    { correct: number; total: number; questions: BreakdownQuestion[]; students: BreakdownStudent[] }
  >();
  quiz.questions.forEach((q, idx) => {
    if (!q.skillTag) return;
    const st = skillStats.get(q.skillTag) ?? { correct: 0, total: 0, questions: [], students: [] };
    st.questions.push({
      id: q.id,
      number: idx + 1,
      text: loc(q.textFr, q.textEn),
      options: Object.fromEntries(q.options.map((o) => [o.letter, loc(o.textFr, o.textEn)])),
      correctLetter: q.options.find((o) => o.isCorrect)?.letter ?? null,
      // Students only see follow-ups under a wrong answer with a remediation.
      followUps: q.remediation
        ? q.followUps.map((fu) => ({
            id: fu.id,
            text: loc(fu.textFr, fu.textEn),
            options: Object.fromEntries(fu.options.map((o) => [o.letter, loc(o.textFr, o.textEn)])),
            correctLetter: fu.options.find((o) => o.isCorrect)?.letter ?? null,
          }))
        : [],
    });
    skillStats.set(q.skillTag, st);
  });
  for (const st of skillStats.values()) {
    const ids = new Set(st.questions.map((q) => q.id));
    const followUpIds = new Set(st.questions.flatMap((q) => q.followUps.map((fu) => fu.id)));
    for (const sub of quiz.submissions) {
      const main = sub.answers.filter((a) => ids.has(a.questionId));
      if (main.length === 0) continue;
      st.total += main.length;
      st.correct += main.filter((a) => a.isCorrect).length;
      const relevant = sub.answers.filter((a) => ids.has(a.questionId) || followUpIds.has(a.questionId));
      st.students.push({
        submissionId: sub.id,
        studentKey: studentKey(sub.studentName, sub.studentClass),
        name: sub.studentName,
        cls: sub.studentClass,
        score: sub.score,
        total: sub.total,
        answers: Object.fromEntries(
          relevant.map((a) => [a.questionId, { chosenLetter: a.chosenLetter, isCorrect: a.isCorrect }])
        ),
      });
    }
  }
  for (const [skill, st] of skillStats) if (st.total === 0) skillStats.delete(skill);

  // KPI: average score
  const submissionCount = quiz.submissions.length;
  const avgScore =
    submissionCount === 0
      ? 0
      : Math.round(
          quiz.submissions.reduce((acc, sub) => {
            const pct = Math.round((sub.score / Math.max(1, sub.total)) * 100);
            return acc + pct;
          }, 0) / submissionCount
        );

  // KPI: completion rate (submissions that answered all main questions)
  const completedCount = quiz.submissions.filter(
    (sub) => sub.answers.filter((a) => !a.question.parentId && !a.question.isChallenge).length >= total
  ).length;

  // KPI: follow-up score, over the submissions where follow-ups were tried.
  const fuStats = new Map(quiz.submissions.map((sub) => [sub.id, followUpStats(sub.answers)]));
  const fuTried = [...fuStats.values()].filter((s) => s.total > 0 && s.answered > 0);
  const fuCorrect = fuTried.reduce((n, s) => n + s.correct, 0);
  const fuTotal = fuTried.reduce((n, s) => n + s.total, 0);
  const fuPct = fuTotal === 0 ? null : Math.round((fuCorrect / fuTotal) * 100);

  // Challenge questions, offered to high scorers.
  const challengeCount = await prisma.question.count({ where: { quizId: quiz.id, isChallenge: true } });
  const chStats = new Map(quiz.submissions.map((sub) => [sub.id, challengeStats(sub, challengeCount)]));
  const completionPct =
    submissionCount === 0 ? 0 : Math.round((completedCount / submissionCount) * 100);

  // Score distribution buckets: 0-30, 30-50, 50-60, 60-70, 70-80, 80-90, 90-100
  const bucketLabels = ["0–30", "30–50", "50–60", "60–70", "70–80", "80–90", "90–100"];
  const buckets = [0, 0, 0, 0, 0, 0, 0];
  for (const sub of quiz.submissions) {
    const pct = Math.round((sub.score / Math.max(1, sub.total)) * 100);
    if (pct < 30) buckets[0]++;
    else if (pct < 50) buckets[1]++;
    else if (pct < 60) buckets[2]++;
    else if (pct < 70) buckets[3]++;
    else if (pct < 80) buckets[4]++;
    else if (pct < 90) buckets[5]++;
    else buckets[6]++;
  }
  const maxBucket = Math.max(...buckets, 1);

  // Recent submissions (top 5)
  const recentSubs = quiz.submissions.slice(0, 5);

  return (
    <>
      {/* Back link */}
      <a
        href="/admin"
        className="muted"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 18 }}
      >
        ← {t("common.backDashboard", lang)}
      </a>

      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
          marginBottom: 32,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="h1" style={{ marginBottom: 6 }}>
            {lang === "fr" ? quiz.titleFr : quiz.titleFr}
          </h1>
          <p className="muted">
            {t("results.periodSubtitle", lang)}
          </p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <a href={`/admin/quizzes/${id}/edit`} className="btn btn--ghost btn--sm">
            {t("results.editQuiz", lang)}
          </a>
        </div>
      </div>

      {/* KPI grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {/* Submissions */}
        <div className="card" style={{ padding: "20px 22px" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 14,
            }}
          >
            {t("results.submissions", lang)}
          </div>
          <div
            className="numeric"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 46,
              lineHeight: 1,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            {submissionCount}
          </div>
        </div>

        {/* Average score */}
        <div className="card" style={{ padding: "20px 22px" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 14,
            }}
          >
            {t("results.avgScore", lang)}
          </div>
          <div
            className="numeric"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 46,
              lineHeight: 1,
              color: "var(--accent)",
              letterSpacing: "-0.02em",
            }}
          >
            {avgScore}
            <span style={{ fontSize: 28, color: "var(--text-muted)" }}>%</span>
          </div>
        </div>

        {/* Completion */}
        <div className="card" style={{ padding: "20px 22px" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 14,
            }}
          >
            {t("results.completion", lang)}
          </div>
          <div
            className="numeric"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 46,
              lineHeight: 1,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            {completionPct}
            <span style={{ fontSize: 28, color: "var(--text-muted)" }}>%</span>
          </div>
        </div>

        {/* Follow-up score */}
        <div className="card" style={{ padding: "20px 22px" }} title={t("students.followUpScoreHint", lang)}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 14,
            }}
          >
            {t("results.followUpScore", lang)}
          </div>
          <div
            className="numeric"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 46,
              lineHeight: 1,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            {fuPct == null ? "—" : fuPct}
            {fuPct != null && <span style={{ fontSize: 28, color: "var(--text-muted)" }}>%</span>}
          </div>
          {fuPct != null && (
            <div className="muted numeric" style={{ fontSize: 12, marginTop: 8 }}>
              {fuCorrect}/{fuTotal}
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="card" style={{ padding: "20px 22px" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 14,
            }}
          >
            {t("results.questionsLabel", lang)}
          </div>
          <div
            className="numeric"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 46,
              lineHeight: 1,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            {total}
          </div>
        </div>
      </div>

      {/* Two-panel row: score distribution + recent submissions */}
      <div className="two-col" style={{ marginBottom: 24 }}>
        {/* Score distribution */}
        <div className="card" style={{ padding: 24 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 18,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{t("results.scoreDistribution", lang)}</span>
            <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
              {submissionCount} {t("results.submissionsLower", lang)}
            </span>
          </div>
          {submissionCount === 0 ? (
            <div className="muted" style={{ textAlign: "center", padding: "32px 0", fontSize: 13 }}>
              {t("results.empty", lang)}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                height: 180,
                padding: "8px 4px 0",
              }}
            >
              {buckets.map((v, i) => {
                const isPeak = v === maxBucket && v > 0;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                      }}
                    >
                      {v}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        background: isPeak
                          ? "linear-gradient(180deg, var(--accent), rgba(255,204,0,0.35))"
                          : "var(--surface-2)",
                        borderRadius: "6px 6px 0 0",
                        minHeight: 6,
                        height: `${(v / maxBucket) * 130 + 6}px`,
                        transition: "background 120ms",
                      }}
                    />
                    <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
                      {bucketLabels[i]}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent submissions */}
        <div className="card" style={{ padding: 24 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 18,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{t("results.recentSubmissions", lang)}</span>
          </div>
          {recentSubs.length === 0 ? (
            <div className="muted" style={{ textAlign: "center", padding: "32px 0", fontSize: 13 }}>
              {t("results.empty", lang)}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {recentSubs.map((sub, i) => {
                const pct = Math.round((sub.score / Math.max(1, sub.total)) * 100);
                const scoreColor =
                  pct >= 80 ? "#86efac" : pct >= 60 ? "var(--accent)" : "#fca5a5";
                return (
                  <div
                    key={sub.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom:
                        i < recentSubs.length - 1 ? "1px solid var(--border)" : undefined,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {sub.studentName}
                        {sub.studentClass && (
                          <span className="muted" style={{ fontWeight: 400, marginLeft: 6 }}>
                            · {sub.studentClass}
                          </span>
                        )}
                      </div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {new Date(sub.submittedAt).toLocaleDateString(
                          lang === "fr" ? "fr-FR" : "en-US"
                        )}
                        {" · "}
                        {sub.language.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        className="numeric"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: 22,
                          color: scoreColor,
                        }}
                      >
                        {pct}
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>%</span>
                      </div>
                      <div className="muted" style={{ fontSize: 11 }}>
                        {sub.score}/{sub.total}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Per-skill performance table */}
      {skillStats.size > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 18,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span>{t("results.perSkillPerformance", lang)}</span>
            <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
              {t("results.perSkillHint", lang)} · {t("results.breakdownHint", lang)}
            </span>
          </div>

          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 64px 80px",
              gap: 12,
              padding: "6px 0 10px",
              borderBottom: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <span>{t("results.skillCol", lang)}</span>
            <span style={{ textAlign: "right" }}>{t("results.correctCol", lang)}</span>
            <span style={{ textAlign: "right" }}>{t("results.rateCol", lang)}</span>
          </div>

          {[...skillStats.entries()].map(([skill, st], idx, arr) => (
            <SkillBreakdownRow
              key={skill}
              skill={skill}
              correct={st.correct}
              total={st.total}
              questions={st.questions}
              students={st.students}
              isLast={idx === arr.length - 1}
              labels={{
                correctAnswer: t("results.breakdown.correctAnswer", lang),
                noAnswer: t("results.breakdown.noAnswer", lang),
                overall: t("results.breakdown.overall", lang),
                correct: t("results.breakdown.correct", lang),
                chose: t("results.breakdown.chose", lang),
                followUp: t("results.breakdown.followUp", lang),
                followUpTried: t("results.breakdown.followUpTried", lang),
                notAttempted: t("results.breakdown.notAttempted", lang),
                hint: t("results.breakdownHint", lang),
              }}
            />
          ))}
        </div>
      )}

      {/* All submissions table */}
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 40 }}>
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{t("results.submissions", lang)}</span>
          <span className="badge badge--draft" style={{ textTransform: "none", letterSpacing: 0 }}>
            {submissionCount}
          </span>
        </div>
        {quiz.submissions.length === 0 ? (
          <div className="empty-state" style={{ padding: "48px 24px" }}>
            <div className="empty-state__icon">📭</div>
            <p>{t("results.empty", lang)}</p>
          </div>
        ) : (
          <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>{t("results.col.student", lang)}</th>
                <th>{t("results.col.class", lang)}</th>
                <th>{t("results.col.score", lang)}</th>
                <th>{t("results.col.pct", lang)}</th>
                <th title={t("students.followUpScoreHint", lang)}>{t("results.col.followUps", lang)}</th>
                {challengeCount > 0 && <th title={t("students.challengeHint", lang)}>★ {t("results.col.challenge", lang)}</th>}
                <th>{t("results.col.lang", lang)}</th>
                <th>{t("results.col.date", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {quiz.submissions.map((sub) => {
                const pct = Math.round((sub.score / Math.max(1, sub.total)) * 100);
                const scoreColor =
                  pct >= 80 ? "#86efac" : pct >= 60 ? "var(--accent)" : "#fca5a5";
                return (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 600 }}>{sub.studentName}</td>
                    <td className="muted">{sub.studentClass ?? "—"}</td>
                    <td className="numeric">{sub.score}/{sub.total}</td>
                    <td
                      className="numeric"
                      style={{ fontWeight: 700, color: scoreColor }}
                    >
                      {pct}%
                    </td>
                    <td className="numeric muted">{followUpLabel(fuStats.get(sub.id)!)}</td>
                    {challengeCount > 0 && (
                      <td className="numeric" style={{ color: "var(--accent)" }}>
                        {(() => {
                          const ch = chStats.get(sub.id);
                          return ch && ch.answered > 0 ? `${ch.correct}/${ch.total}` : <span className="muted">—</span>;
                        })()}
                      </td>
                    )}
                    <td>
                      <span className="badge badge--draft">
                        {sub.language.toUpperCase()}
                      </span>
                    </td>
                    <td className="muted">
                      {new Date(sub.submittedAt).toLocaleString(
                        lang === "fr" ? "fr-FR" : "en-US"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </>
  );
}
