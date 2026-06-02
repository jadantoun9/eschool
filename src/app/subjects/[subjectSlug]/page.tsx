import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { chipClass } from "@/lib/subject-style";

type Params = Promise<{ subjectSlug: string }>;

export default async function SubjectPage({ params }: { params: Params }) {
  const { subjectSlug } = await params;
  const [, lang, subject, grades] = await Promise.all([
    auth(),
    getLang(),
    prisma.subject.findUnique({ where: { slug: subjectSlug } }),
    prisma.grade.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!subject) notFound();

  // Count published quizzes per grade for this subject.
  const counts = await prisma.quiz.groupBy({
    by: ["gradeId"],
    where: { subjectId: subject.id, isPublished: true },
    _count: { _all: true },
  });
  const countByGrade = new Map(counts.map((c) => [c.gradeId, c._count._all]));

  const name = (x: { nameFr: string; nameEn: string }) =>
    lang === "fr" ? x.nameFr : x.nameEn;

  const totalWorksheets = Array.from(countByGrade.values()).reduce((s, v) => s + v, 0);

  return (
    <div className="page">
      <div className="page-inner">
        <SiteNav mode="public" />

        <section className="section">
          <div className="container">
            {/* Back link */}
            <Link
              href="/"
              className="muted"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 24 }}
            >
              ← {t("browse.backHome", lang)}
            </Link>

            {/* Subject header */}
            <div style={{ display: "flex", gap: 28, alignItems: "center", marginBottom: 48 }}>
              <span className={`icon-chip icon-chip--lg ${chipClass(subject.colorKey)}`}>
                {subject.icon}
              </span>
              <div>
                <div className="eyebrow">
                  {lang === "fr" ? "Matière" : "Subject"}
                </div>
                <h1
                  className="display"
                  style={{ marginTop: 12, fontSize: "clamp(48px, 5vw, 76px)" }}
                >
                  {name(subject)}
                </h1>
              </div>
            </div>

            {/* Section header */}
            <div className="section-head">
              <div>
                <h2 className="h2">{t("browse.chooseGrade", lang)}</h2>
                <p className="muted" style={{ marginTop: 6 }}>
                  {lang === "fr"
                    ? `${totalWorksheets} fiche${totalWorksheets !== 1 ? "s" : ""} sur ${grades.length} niveaux`
                    : `${totalWorksheets} worksheet${totalWorksheets !== 1 ? "s" : ""} across ${grades.length} grades`}
                </p>
              </div>
            </div>

            {/* Grade cards grid */}
            <div
              className="grid"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
            >
              {grades.map((g) => {
                const n = countByGrade.get(g.id) ?? 0;
                return (
                  <Link
                    key={g.id}
                    href={`/subjects/${subject.slug}/${g.slug}`}
                    className="card card--link"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span className="badge badge--grade">
                        {name(g)}
                      </span>
                      <span className="arrow" />
                    </div>
                    <div style={{ marginTop: 28 }}>
                      <div
                        className="display"
                        style={{ fontSize: 56, lineHeight: 1, color: "#fff" }}
                      >
                        {g.slug}
                      </div>
                      <div
                        className="muted"
                        style={{ marginTop: 12, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <span className="numeric" style={{ color: "#fff", fontWeight: 700 }}>{n}</span>
                        {n === 1
                          ? (lang === "fr" ? "fiche" : "worksheet")
                          : (lang === "fr" ? "fiches" : "worksheets")}
                        {n === 0 && (
                          <span style={{ marginLeft: 6 }}>
                            · {lang === "fr" ? "à venir" : "coming soon"}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div style={{ height: 80 }} />
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}
