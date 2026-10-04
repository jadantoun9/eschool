import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/lang";
import GenerateClient from "./GenerateClient";

type SearchParams = Promise<{ subject?: string; grade?: string }>;

export default async function GenerateQuizPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const lang = await getLang();
  const sp = await searchParams;

  const [subjects, grades] = await Promise.all([
    prisma.subject.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, nameFr: true, nameEn: true } }),
    prisma.grade.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, nameFr: true, nameEn: true } }),
  ]);

  return (
    <GenerateClient
      lang={lang}
      subjects={subjects}
      grades={grades}
      preSubjectId={subjects.find((s) => s.slug === sp.subject)?.id ?? ""}
      preGradeId={grades.find((g) => g.slug === sp.grade)?.id ?? ""}
    />
  );
}
