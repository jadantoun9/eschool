import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { BackLink } from "@/components/BackLink";
import GradesClient from "./GradesClient";

export default async function GradesAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/admin");
  const lang = await getLang();

  const grades = await prisma.grade.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <BackLink href="/admin" label={t("common.backDashboard", lang)} />
      <GradesClient lang={lang} grades={grades} />
    </>
  );
}
