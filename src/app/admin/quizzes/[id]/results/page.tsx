import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: { where: { parentId: null }, select: { id: true, order: true, skillTag: true, textFr: true } },
      submissions: { orderBy: { submittedAt: "desc" }, include: { answers: true } },
    },
  });
  if (!quiz) notFound();
  if (session.user.role !== "SUPER_ADMIN" && quiz.teacherId !== session.user.id) notFound();

  const total = quiz.questions.length;

  // Per-skill aggregation: % correct across submissions, grouped by skillTag.
  const skillStats = new Map<string, { correct: number; total: number }>();
  for (const sub of quiz.submissions) {
    for (const ans of sub.answers) {
      const q = quiz.questions.find((qq) => qq.id === ans.questionId);
      if (!q || !q.skillTag) continue;
      const s = skillStats.get(q.skillTag) ?? { correct: 0, total: 0 };
      s.total++;
      if (ans.isCorrect) s.correct++;
      skillStats.set(q.skillTag, s);
    }
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <h1 style={{ fontFamily: "Crimson Pro, serif", fontSize: 26, marginBottom: 4 }}>Résultats : {quiz.titleFr}</h1>
      <p style={{ color: "var(--g500)", fontSize: 14, marginBottom: 20 }}>
        {quiz.submissions.length} soumission(s) · {total} question(s)
      </p>

      {skillStats.size > 0 && (
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Par compétence</h2>
          {[...skillStats.entries()].map(([skill, s]) => {
            const pct = Math.round((s.correct / Math.max(1, s.total)) * 100);
            const color = pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)";
            return (
              <div key={skill} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, color: "var(--g600)" }}>{skill}</div>
                <div style={{ background: "var(--g100)", borderRadius: 20, height: 11, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 20 }} />
                </div>
                <div style={{ fontSize: 11.5, color: "var(--g400)", marginTop: 2 }}>{pct}% · {s.correct}/{s.total}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, padding: "16px 20px 0" }}>Soumissions</h2>
        {quiz.submissions.length === 0 ? (
          <p style={{ color: "var(--g500)", padding: 20 }}>Aucune soumission pour l&apos;instant.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginTop: 12 }}>
            <thead>
              <tr style={{ background: "var(--g50)", textAlign: "left" }}>
                <th style={th}>Élève</th>
                <th style={th}>Classe</th>
                <th style={th}>Score</th>
                <th style={th}>%</th>
                <th style={th}>Langue</th>
                <th style={th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {quiz.submissions.map((s) => {
                const pct = Math.round((s.score / Math.max(1, s.total)) * 100);
                return (
                  <tr key={s.id} style={{ borderTop: "1px solid var(--g100)" }}>
                    <td style={td}>{s.studentName}</td>
                    <td style={td}>{s.studentClass ?? "—"}</td>
                    <td style={td}>{s.score}/{s.total}</td>
                    <td style={td}>{pct}%</td>
                    <td style={td}>{s.language.toUpperCase()}</td>
                    <td style={td}>{new Date(s.submittedAt).toLocaleString("fr-FR")}</td>
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

const th: React.CSSProperties = { padding: "12px 16px", fontSize: 11, color: "var(--g500)", textTransform: "uppercase", fontWeight: 700, letterSpacing: ".05em" };
const td: React.CSSProperties = { padding: "12px 16px", color: "var(--g600)" };
