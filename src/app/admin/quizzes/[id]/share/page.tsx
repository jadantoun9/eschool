import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ShareClient from "./ShareClient";
import { getLang } from "@/lib/lang";
import { dict } from "@/lib/i18n";

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const lang = await getLang();
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    select: {
      slug: true,
      titleFr: true,
      titleEn: true,
      isPublished: true,
      teacherId: true,
      subject: { select: { nameFr: true, nameEn: true, icon: true, colorKey: true } },
      grade: { select: { nameFr: true, nameEn: true } },
    },
  });
  if (!quiz) notFound();
  if (session.user.role !== "SUPER_ADMIN" && quiz.teacherId !== session.user.id) notFound();
  return (
    <ShareClient
      strings={dict[lang]}
      lang={lang}
      slug={quiz.slug}
      titleFr={quiz.titleFr}
      titleEn={quiz.titleEn ?? null}
      isPublished={quiz.isPublished}
      subjectNameFr={quiz.subject.nameFr}
      subjectNameEn={quiz.subject.nameEn}
      subjectIcon={quiz.subject.icon}
      subjectColorKey={quiz.subject.colorKey}
      gradeNameFr={quiz.grade.nameFr}
      gradeNameEn={quiz.grade.nameEn}
    />
  );
}
