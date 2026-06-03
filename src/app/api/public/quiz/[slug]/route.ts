import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { LANG, type Lang } from "@/types/quiz";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const url = new URL(req.url);
  const langParsed = LANG.safeParse(url.searchParams.get("lang") ?? "en");
  const lang: Lang = langParsed.success ? langParsed.data : "en";

  const quiz = await prisma.quiz.findUnique({
    where: { slug },
    include: {
      subject: true,
      grade: true,
      parts: { orderBy: { order: "asc" } },
      questions: {
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: { options: true, remediation: { select: { id: true } } },
      },
    },
  });

  // Students only get published worksheets. Staff can preview drafts.
  if (!quiz || !quiz.isPublished) {
    const session = await auth();
    if (!quiz || !session?.user) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
  }

  const t = (fr: string | null, en: string | null) =>
    lang === "en" && en ? en : fr ?? "";

  const questions = quiz.questions.map((q) => ({
    id: q.id,
    partId: q.partId,
    order: q.order,
    text: t(q.textFr, q.textEn),
    hint: q.hintFr ? t(q.hintFr, q.hintEn) : null,
    hasRemediation: !!q.remediation,
    options: q.options.map((o) => ({
      id: o.id,
      letter: o.letter,
      text: t(o.textFr, o.textEn),
    })),
  }));

  return NextResponse.json({
    slug: quiz.slug,
    title: t(quiz.titleFr, quiz.titleEn),
    subject: t(quiz.subject.nameFr, quiz.subject.nameEn),
    grade: t(quiz.grade.nameFr, quiz.grade.nameEn),
    parts: quiz.parts.map((p) => ({
      id: p.id,
      order: p.order,
      title: t(p.titleFr, p.titleEn),
      subtitle: p.subtitleFr ? t(p.subtitleFr, p.subtitleEn) : null,
    })),
    prelim:
      quiz.prelimTitleFr || quiz.prelimEmbedUrl || quiz.prelimUrl
        ? {
            badge: t(quiz.prelimBadgeFr, quiz.prelimBadgeEn),
            title: t(quiz.prelimTitleFr, quiz.prelimTitleEn),
            description: t(quiz.prelimDescFr, quiz.prelimDescEn),
            url: quiz.prelimUrl ?? null,
            embedUrl: quiz.prelimEmbedUrl ?? null,
          }
        : null,
    questions,
  });
}
