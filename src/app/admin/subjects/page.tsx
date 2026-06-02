import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/lang";
import { dict } from "@/lib/i18n";
import SubjectsClient from "./SubjectsClient";

export default async function SubjectsAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/admin");
  const lang = await getLang();

  const subjects = await prisma.subject.findMany({ orderBy: { order: "asc" } });

  return (
    <>
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
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            📚 {lang === "fr" ? "Catalogue" : "Catalogue"}
          </div>
          <h1 className="h1" style={{ marginBottom: 6 }}>
            {lang === "fr" ? "Matières" : "Subjects"}
          </h1>
          <p className="muted">
            {lang === "fr"
              ? "Les catégories sous lesquelles les fiches sont organisées."
              : "The top-level categories worksheets are organized under."}
          </p>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="stat__num numeric">{subjects.length}</div>
            <div className="stat__label">
              {lang === "fr" ? "Matières" : "Subjects"}
            </div>
          </div>
        </div>
      </div>

      <SubjectsClient strings={dict[lang]} lang={lang} subjects={subjects} />
    </>
  );
}
