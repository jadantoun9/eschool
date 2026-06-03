import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import ImportClient from "./ImportClient";

export default async function ImportQuizPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const lang = await getLang();

  return (
    <>
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            {t("import.eyebrow", lang)}
          </div>
          <h1 className="h1" style={{ marginBottom: 8 }}>
            {lang === "fr" ? (
              <>
                Dépose ta <span className="accent-text">fiche</span>
              </>
            ) : (
              <>
                Drop in your <span className="accent-text">worksheet</span>
              </>
            )}
          </h1>
          <p className="muted" style={{ maxWidth: 620 }}>
            {t("import.desc", lang)}
          </p>
        </div>
      </div>
      <ImportClient lang={lang} />
    </>
  );
}
