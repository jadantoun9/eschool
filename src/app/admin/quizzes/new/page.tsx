import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewQuizForm from "./NewQuizForm";
import { getLang } from "@/lib/lang";
import { dict, t } from "@/lib/i18n";

export default async function NewQuizPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const lang = await getLang();

  const isSA = session.user.role === "SUPER_ADMIN";
  const [subjects, grades] = await Promise.all([
    prisma.subject.findMany({
      where: isSA ? {} : { teacherId: session.user.id },
      orderBy: { name: "asc" },
    }),
    prisma.grade.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {t("quiz.new.title", lang)}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("quiz.new.subtitle", lang)}</p>
      </div>
      <div className="max-w-2xl">
        <NewQuizForm strings={dict[lang]} subjects={subjects} grades={grades} />
      </div>
    </div>
  );
}
