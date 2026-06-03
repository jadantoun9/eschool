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

  // Per-skill stats (used for per-question performance section)
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

  // KPI: completion rate (submissions that answered all questions)
  const completedCount = quiz.submissions.filter(
    (sub) => sub.answers.length >= total
  ).length;
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
              {t("results.perSkillHint", lang)}
            </span>
          </div>

          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 50px 80px",
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

          {[...skillStats.entries()].map(([skill, st], idx, arr) => {
            const pct = Math.round((st.correct / Math.max(1, st.total)) * 100);
            const tier = pct >= 70 ? "good" : pct >= 50 ? "mid" : "bad";
            const barColor =
              tier === "good"
                ? "var(--success)"
                : tier === "mid"
                ? "var(--accent)"
                : "var(--danger)";
            const textColor = tier === "bad" ? "#fca5a5" : "#fff";
            return (
              <div
                key={skill}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 50px 80px",
                  gap: 12,
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: idx < arr.length - 1 ? "1px solid var(--border)" : undefined,
                  fontSize: 13,
                }}
              >
                {/* Skill name + bar */}
                <div>
                  <div style={{ marginBottom: 6, fontWeight: 500 }}>{skill}</div>
                  <div
                    style={{
                      height: 6,
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        height: "100%",
                        borderRadius: 999,
                        width: `${pct}%`,
                        background: barColor,
                      }}
                    />
                  </div>
                </div>
                <div
                  className="numeric muted"
                  style={{ textAlign: "right" }}
                >
                  {st.correct}/{st.total}
                </div>
                <div
                  className="numeric"
                  style={{ textAlign: "right", fontWeight: 600, color: textColor }}
                >
                  {pct}%
                </div>
              </div>
            );
          })}
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
