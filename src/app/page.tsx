import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/lang";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { chipClass } from "@/lib/subject-style";

export default async function HomePage() {
  const [lang, subjects, grades, bySubject, totalWorksheets] = await Promise.all([
    getLang(),
    prisma.subject.findMany({ orderBy: { order: "asc" } }),
    prisma.grade.findMany({ orderBy: { order: "asc" } }),
    prisma.quiz.groupBy({
      by: ["subjectId"],
      where: { isPublished: true },
      _count: { _all: true },
    }),
    prisma.quiz.count({ where: { isPublished: true } }),
  ]);

  const name = (x: { nameFr: string; nameEn: string }) => (lang === "fr" ? x.nameFr : x.nameEn);
  const countFor = (id: string) => bySubject.find((b) => b.subjectId === id)?._count._all ?? 0;
  const en = lang === "en";

  return (
    <div className="page">
      <div className="page-inner">
        <SiteNav mode="public" />

        {/* HERO */}
        <section className="section" style={{ paddingTop: 40, paddingBottom: 24 }}>
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.05fr) minmax(0,1fr)",
                gap: 80,
                alignItems: "center",
              }}
              className="hero-grid"
            >
              <div>
                <div className="eyebrow" style={{ marginBottom: 28 }}>
                  <span className="ico">📚</span>
                  {en ? "Adaptive learning platform" : "Plateforme d'apprentissage adaptatif"}
                </div>
                <h1 className="display" style={{ marginBottom: 28 }}>
                  {en ? (
                    <>
                      Learn at your <span className="accent">own pace</span>
                    </>
                  ) : (
                    <>
                      Apprends à <span className="accent">ton rythme</span>
                    </>
                  )}
                </h1>
                <p className="muted" style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 520, marginBottom: 36 }}>
                  {en
                    ? "Interactive adaptive worksheets for science and math, from middle school to high school. Every mistake becomes a learning opportunity."
                    : "Des fiches interactives et adaptatives en sciences et maths, du collège au lycée. Chaque erreur devient une occasion d'apprendre."}
                </p>
                <div className="row wrap-tight" style={{ gap: 12, marginBottom: 56 }}>
                  <a href="#subjects" className="btn btn--primary">
                    <span className="ico">🚀</span>
                    {en ? "Explore subjects" : "Découvrir les matières"}
                  </a>
                  <a href="#how" className="btn btn--ghost">
                    ▶ {en ? "How it works" : "Comment ça marche"}
                  </a>
                </div>
                <div className="stats">
                  <div className="stat">
                    <div className="stat__num numeric">{subjects.length}</div>
                    <div className="stat__label">{en ? "Subjects" : "Matières"}</div>
                  </div>
                  <div className="stat stat--accent">
                    <div className="stat__num numeric">{grades.length}</div>
                    <div className="stat__label">{en ? "Grade levels" : "Niveaux"}</div>
                  </div>
                  <div className="stat">
                    <div className="stat__num numeric">{totalWorksheets}</div>
                    <div className="stat__label">{en ? "Active worksheets" : "Fiches actives"}</div>
                  </div>
                </div>
              </div>

              <div className="col" id="subjects" style={{ gap: 14 }}>
                {subjects.map((s) => (
                  <Link key={s.id} href={`/subjects/${s.slug}`} className="card card--row card--link">
                    <span className={`icon-chip ${chipClass(s.colorKey)}`}>{s.icon}</span>
                    <div>
                      <div className="h3" style={{ color: "#fff" }}>{name(s)}</div>
                      <div className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
                        {grades.length} {en ? "grade levels" : "niveaux"} · {countFor(s.id)}{" "}
                        {en ? "worksheets" : "fiches"}
                      </div>
                    </div>
                    <span className="arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section" id="how" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="container">
            <div className="section-head wrap-tight">
              <h2 className="h1" style={{ margin: 0 }}>
                {en ? (
                  <>
                    How <span className="accent">it works</span>
                  </>
                ) : (
                  <>
                    Comment <span className="accent">ça marche</span>
                  </>
                )}
              </h2>
              <p className="muted" style={{ maxWidth: 420, margin: 0, fontSize: 15 }}>
                {en
                  ? "No account needed to start. Pick a worksheet, learn from your mistakes, master the concept."
                  : "Aucun compte requis. Choisis une fiche, apprends de tes erreurs, maîtrise le concept."}
              </p>
            </div>
            <div className="grid grid--3">
              {[
                {
                  step: "01",
                  h: en ? "Pick a worksheet" : "Choisis une fiche",
                  p: en
                    ? "Browse by subject and grade. Each worksheet is 8–12 questions, designed around one concept."
                    : "Parcours par matière et niveau. Chaque fiche compte 8 à 12 questions sur un même concept.",
                },
                {
                  step: "02",
                  h: en ? "Learn from mistakes" : "Apprends de tes erreurs",
                  p: en
                    ? "Wrong answer? You get a short video explaining the concept and a follow-up question to try."
                    : "Mauvaise réponse ? Une courte vidéo t'explique le concept et une question de suivi te remet en piste.",
                },
                {
                  step: "03",
                  h: en ? "Master the concept" : "Maîtrise le concept",
                  p: en
                    ? "Finish with a retry question and a clear score. Your teacher sees what worked and what didn't."
                    : "Termine par une question de reprise et un score clair. Ton enseignant voit ce qui a marché.",
                },
              ].map((c) => (
                <div key={c.step} className="card">
                  <div
                    className="icon-chip icon-chip--accent icon-chip--sm"
                    style={{ borderRadius: 999, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 18 }}
                  >
                    {c.step}
                  </div>
                  <h3 className="h3" style={{ color: "#fff", marginBottom: 10 }}>{c.h}</h3>
                  <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{c.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}
