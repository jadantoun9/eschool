import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { RefreshOnMount } from "@/components/RefreshOnMount";
import { RowLink } from "@/components/RowLink";
import { scoreColor, scorePct, studentKey, submissionScope } from "@/lib/students";

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const lang = await getLang();
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  const subs = await prisma.submission.findMany({
    where: submissionScope(session.user),
    orderBy: { submittedAt: "desc" },
    select: {
      studentName: true,
      studentClass: true,
      score: true,
      total: true,
      quizId: true,
      submittedAt: true,
    },
  });

  // Group submissions into students. Subs are newest-first, so the first one
  // seen supplies the displayed spelling of the name/class.
  const students = new Map<
    string,
    { key: string; name: string; cls: string | null; quizIds: Set<string>; pctSum: number; count: number; last: Date }
  >();
  for (const sub of subs) {
    const key = studentKey(sub.studentName, sub.studentClass);
    const st = students.get(key) ?? {
      key,
      name: sub.studentName,
      cls: sub.studentClass,
      quizIds: new Set<string>(),
      pctSum: 0,
      count: 0,
      last: sub.submittedAt,
    };
    st.quizIds.add(sub.quizId);
    st.pctSum += scorePct(sub.score, sub.total);
    st.count++;
    students.set(key, st);
  }
  const rows = [...students.values()].sort((a, b) =>
    a.name.localeCompare(b.name, lang, { sensitivity: "base" })
  );
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  return (
    <>
      <RefreshOnMount />
      <div className="section-head" style={{ marginBottom: 36 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            {isSuperAdmin ? t("students.eyebrowAdmin", lang) : t("students.eyebrowTeacher", lang)}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(40px, 4.5vw, 64px)" }}>
            {t("students.title", lang)}
          </h1>
          <p className="muted" style={{ marginTop: 10 }}>
            {t("students.subtitle", lang)}
          </p>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="stat__num numeric">{rows.length}</div>
            <div className="stat__label">{t("students.title", lang)}</div>
          </div>
          <div className="stat">
            <div className="stat__num numeric">{subs.length}</div>
            <div className="stat__label">{t("students.submissions", lang)}</div>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🎓</div>
          <p className="muted">{t("students.empty", lang)}</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>{t("students.col.name", lang)}</th>
                <th style={{ width: 140 }}>{t("students.col.class", lang)}</th>
                <th style={{ width: 110, textAlign: "right" }}>{t("students.col.worksheets", lang)}</th>
                <th style={{ width: 110, textAlign: "right" }}>{t("students.col.avg", lang)}</th>
                <th style={{ width: 160 }}>{t("students.col.last", lang)}</th>
                <th style={{ width: 100, textAlign: "right" }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((st) => {
                const avg = Math.round(st.pctSum / st.count);
                return (
                  <RowLink key={st.key} href={`/admin/students/${st.key}`}>
                    <td style={{ fontWeight: 600 }}>
                      <Link href={`/admin/students/${st.key}`}>{st.name}</Link>
                    </td>
                    <td className="muted">{st.cls ?? "—"}</td>
                    <td className="numeric" style={{ textAlign: "right" }}>
                      {st.quizIds.size}
                    </td>
                    <td className="numeric" style={{ textAlign: "right", fontWeight: 700, color: scoreColor(avg) }}>
                      {avg}%
                    </td>
                    <td className="muted">{st.last.toLocaleDateString(locale)}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/admin/students/${st.key}`} className="btn btn--ghost btn--sm">
                        {t("students.view", lang)}
                      </Link>
                    </td>
                  </RowLink>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ height: 80 }} />
    </>
  );
}
