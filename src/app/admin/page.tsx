import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

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
    <div className="wrap" style={{ padding: 0, maxWidth: "none" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "Crimson Pro, serif", fontSize: 26 }}>Mes fiches</h1>
        <Link href="/admin/quizzes/new" className="btn-primary" style={{ width: "auto", padding: "10px 18px", textDecoration: "none" }}>
          + Nouvelle fiche
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="card">
          <p style={{ color: "var(--g500)" }}>Aucune fiche pour l&apos;instant. Créez-en une avec le bouton ci-dessus.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--g50)", textAlign: "left" }}>
                <th style={th}>Titre</th>
                <th style={th}>Matière / Niveau</th>
                <th style={th}>Questions</th>
                <th style={th}>Soumissions</th>
                <th style={th}>Statut</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((q) => (
                <tr key={q.id} style={{ borderTop: "1px solid var(--g100)" }}>
                  <td style={td}>{q.titleFr}</td>
                  <td style={td}>{q.subject.name} · {q.grade.name}</td>
                  <td style={td}>{q._count.questions}</td>
                  <td style={td}>{q._count.submissions}</td>
                  <td style={td}>
                    <span className={`tag ${q.isPublished ? "tag-c" : "tag-o"}`} style={{ display: "inline-block", padding: "2px 9px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: q.isPublished ? "var(--green-l)" : "var(--g100)", color: q.isPublished ? "var(--green)" : "var(--g500)" }}>
                      {q.isPublished ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td style={td}>
                    <Link href={`/admin/quizzes/${q.id}/edit`} style={linkStyle}>Éditer</Link>
                    {" · "}
                    <Link href={`/admin/quizzes/${q.id}/results`} style={linkStyle}>Résultats</Link>
                    {" · "}
                    <Link href={`/admin/quizzes/${q.id}/share`} style={linkStyle}>Partager</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: "12px 16px", fontSize: 11, color: "var(--g500)", textTransform: "uppercase", fontWeight: 700, letterSpacing: ".05em" };
const td: React.CSSProperties = { padding: "12px 16px", color: "var(--g600)" };
const linkStyle: React.CSSProperties = { color: "var(--blue)", textDecoration: "none", fontWeight: 600 };
