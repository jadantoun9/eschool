import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SubjectsClient from "./SubjectsClient";
import { getLang } from "@/lib/lang";
import { dict, t } from "@/lib/i18n";

export default async function SubjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const lang = await getLang();
  const isSA = session.user.role === "SUPER_ADMIN";
  const subjects = await prisma.subject.findMany({
    where: isSA ? {} : { teacherId: session.user.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { quizzes: true } } },
  });
  const grades = await prisma.grade.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {t("subjects.title", lang)}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("subjects.subtitle", lang)}</p>
      </div>
      <SubjectsClient
        strings={dict[lang]}
        subjects={subjects.map((s) => ({ id: s.id, name: s.name, quizCount: s._count.quizzes }))}
        grades={grades}
      />
    </div>
  );
}
