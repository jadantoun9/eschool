import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLang } from "@/lib/lang";
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
            {lang === "fr" ? "Importer une fiche" : "Import worksheet"}
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
            {lang === "fr"
              ? "Téléchargez le modèle, donnez-le à ChatGPT ou Claude avec votre sujet, puis déposez ici le fichier obtenu. Nous l'affichons avant l'enregistrement."
              : "Download the template, give it to ChatGPT or Claude with your topic, then drop the file it gives you back here. We'll preview it before saving."}
          </p>
        </div>
      </div>
      <ImportClient lang={lang} />
    </>
  );
}
