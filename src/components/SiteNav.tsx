import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { signOut } from "@/lib/auth";

function BrandMark() {
  return (
    <Link href="/" className="brand" aria-label="ICE Learning home">
      <span className="brand__mark">
        <Image src="/ice-logo.png" alt="ICE" width={44} height={44} priority />
      </span>
      <span className="brand__word">
        <b>ICE</b> Learning
      </span>
    </Link>
  );
}

function AflecMark() {
  return (
    <span className="aflec" aria-label="AFLEC">
      <Image src="/aflec-logo.png" alt="AFLEC" width={44} height={44} priority />
    </span>
  );
}

export async function SiteNav({ mode = "public" }: { mode?: "public" | "admin" }) {
  const [session, lang, subjects] = await Promise.all([
    auth(),
    getLang(),
    prisma.subject.findMany({ orderBy: { order: "asc" } }),
  ]);

  const name = (x: { nameFr: string; nameEn: string }) =>
    lang === "fr" ? x.nameFr : x.nameEn;
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const adminItems = [
    { href: "/admin", en: "Quizzes", fr: "Fiches" },
    ...(isSuperAdmin
      ? [
          { href: "/admin/subjects", en: "Subjects", fr: "Matières" },
          { href: "/admin/grades", en: "Grades", fr: "Niveaux" },
          { href: "/admin/teachers", en: "Teachers", fr: "Enseignants" },
        ]
      : []),
  ];

  return (
    <nav className="topnav">
      <div className="topnav__left">
        <BrandMark />
      </div>

      <div className="topnav__center">
        {mode === "public" && (
          <div className="subjects-nav">
            {subjects.map((s) => (
              <Link key={s.id} href={`/subjects/${s.slug}`} className="pill">
                <span className="ico">{s.icon}</span>
                {name(s)}
                <span className="caret">▾</span>
              </Link>
            ))}
          </div>
        )}
        {mode === "admin" && (
          <div className="subjects-nav">
            {adminItems.map((it) => (
              <Link key={it.href} href={it.href} className="pill">
                {lang === "fr" ? it.fr : it.en}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="topnav__right">
        <LanguageSwitcher current={lang} />
        {mode === "admin" ? (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="signout" type="submit">
              {t("sidebar.logout", lang)}
            </button>
          </form>
        ) : (
          <Link href={session?.user ? "/admin" : "/admin/login"} className="signout">
            {lang === "fr" ? "Connexion" : "Sign in"}
          </Link>
        )}
        <AflecMark />
      </div>
    </nav>
  );
}
