import Link from "next/link";
import { getLang } from "@/lib/lang";
import { prisma } from "@/lib/prisma";

export async function SiteFooter() {
  const [lang, subjects] = await Promise.all([
    getLang(),
    prisma.subject.findMany({ orderBy: { order: "asc" } }),
  ]);
  const name = (x: { nameFr: string; nameEn: string }) =>
    lang === "fr" ? x.nameFr : x.nameEn;

  return (
    <footer style={{ borderTop: "1px solid var(--border)", marginTop: 24, padding: "48px 0 56px" }}>
      <div className="container">
        <div
          style={{
            display: "grid",
            gap: 48,
            gridTemplateColumns: "2fr 1fr 1fr",
            alignItems: "start",
          }}
        >
          <div>
            <h3 className="h3" style={{ color: "#fff" }}>ICE Learning</h3>
            <p className="muted" style={{ marginTop: 8, maxWidth: 420, fontSize: 14 }}>
              {lang === "fr"
                ? "Plateforme d'apprentissage adaptative pour les sciences et les mathématiques."
                : "Adaptive learning platform for science and mathematics."}
            </p>
          </div>
          <div>
            <div className="eyebrow" style={{ border: 0, background: "transparent", padding: 0, marginBottom: 12 }}>
              {lang === "fr" ? "Matières" : "Subjects"}
            </div>
            <div className="col" style={{ gap: 8 }}>
              {subjects.map((s) => (
                <Link key={s.id} href={`/subjects/${s.slug}`} className="muted" style={{ fontSize: 14 }}>
                  {name(s)}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ border: 0, background: "transparent", padding: 0, marginBottom: 12 }}>
              {lang === "fr" ? "Informations" : "Information"}
            </div>
            <div className="col" style={{ gap: 8 }}>
              <Link href="/#how" className="muted" style={{ fontSize: 14 }}>
                {lang === "fr" ? "Comment ça marche" : "How it works"}
              </Link>
              <Link href="/admin/login" className="muted" style={{ fontSize: 14 }}>
                {lang === "fr" ? "Espace enseignant" : "Teacher area"}
              </Link>
            </div>
          </div>
        </div>
        <div
          className="muted"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid var(--border)",
            fontSize: 12,
          }}
        >
          <span>© 2026 ICE Learning</span>
          <span>{lang === "fr" ? "Fait avec ❤" : "Made with ❤"}</span>
        </div>
      </div>
    </footer>
  );
}
