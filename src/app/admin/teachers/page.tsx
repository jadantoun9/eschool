import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeachersClient from "./TeachersClient";
import { getLang } from "@/lib/lang";
import { dict, t } from "@/lib/i18n";

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
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {t("teachers.title", lang)}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("teachers.subtitle", lang)}</p>
      </div>
      <TeachersClient
        strings={dict[lang]}
        teachers={teachers.map((t) => ({
          id: t.id,
          email: t.email,
          name: t.name,
          role: t.role,
          status: t.passwordHash ? "active" : "pending",
          inviteToken: t.inviteToken,
        }))}
      />
    </div>
  );
}
