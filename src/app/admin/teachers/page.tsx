import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeachersClient from "./TeachersClient";
import { getLang } from "@/lib/lang";
import { dict, t } from "@/lib/i18n";
import { BackLink } from "@/components/BackLink";

export default async function TeachersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/admin");
  const lang = await getLang();

  const teachers = await prisma.teacher.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, passwordHash: true, inviteToken: true, createdAt: true },
  });

  return (
    <>
      <BackLink href="/admin" label={t("common.backDashboard", lang)} />
      <TeachersClient
        lang={lang}
        strings={dict[lang]}
        teachers={teachers.map((teacher) => ({
          id: teacher.id,
          email: teacher.email,
          name: teacher.name,
          role: teacher.role,
          status: teacher.passwordHash ? "active" : "pending",
          inviteToken: teacher.inviteToken,
          createdAt: teacher.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
