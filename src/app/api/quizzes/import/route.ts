import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { quizImportSchema } from "@/lib/quiz-import-schema";

const LETTERS = ["A", "B", "C", "D"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = quizImportSchema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid quiz JSON", details: parsed.error.flatten() },
      { status: 400 }
    );

  const data = parsed.data;

  const [subject, grade, existing] = await Promise.all([
    prisma.subject.findUnique({ where: { slug: data.subjectSlug } }),
    prisma.grade.findUnique({ where: { slug: data.gradeSlug } }),
    prisma.quiz.findUnique({ where: { slug: data.slug } }),
  ]);
  if (!subject)
    return NextResponse.json({ error: `Unknown subjectSlug: ${data.subjectSlug}` }, { status: 400 });
  if (!grade)
    return NextResponse.json({ error: `Unknown gradeSlug: ${data.gradeSlug}` }, { status: 400 });
  if (existing)
    return NextResponse.json(
      { error: `A quiz with slug "${data.slug}" already exists. Change the slug in the JSON.` },
      { status: 409 }
    );

  // Build every row up front with pre-generated ids, then insert each table in
  // a single bulk `createMany`. Prisma nested writes issue one INSERT per row,
  // which over a high-latency (Neon) connection meant ~150 round-trips and a
  // 60s+ import; this collapses it to ~5 statements total. Rows are ordered so
  // parents precede children (FK checks pass within each multi-row INSERT).
  // Children's `partId` is intentionally left null — they're always read via
  // the `followUps` relation, never by part.
  const quizId = randomUUID();
  const partRows: Prisma.PartCreateManyInput[] = [];
  const questionRows: Prisma.QuestionCreateManyInput[] = [];
  const optionRows: Prisma.OptionCreateManyInput[] = [];
  const remediationRows: Prisma.RemediationCreateManyInput[] = [];

  const addOptions = (questionId: string, opts: { textFr: string; textEn: string }[], correctIndex: number) => {
    opts.forEach((opt, i) => {
      optionRows.push({
        id: randomUUID(),
        questionId,
        letter: LETTERS[i],
        textFr: opt.textFr,
        textEn: opt.textEn,
        isCorrect: i === correctIndex,
      });
    });
  };

  let qOrder = 0;
  data.parts.forEach((part, pIdx) => {
    const partId = randomUUID();
    partRows.push({
      id: partId,
      quizId,
      order: pIdx,
      titleFr: part.titleFr,
      titleEn: part.titleEn,
      subtitleFr: part.subtitleFr ?? null,
      subtitleEn: part.subtitleEn ?? null,
    });

    for (const q of part.questions) {
      const mainId = randomUUID();
      const v0 = q.remediation.videos[0];
      const v1 = q.remediation.videos[1];
      questionRows.push({
        id: mainId,
        quizId,
        partId,
        order: qOrder++,
        skillTag: q.skillTag,
        textFr: q.textFr,
        textEn: q.textEn,
        hintFr: q.hintFr ?? null,
        hintEn: q.hintEn ?? null,
        diagramSvg: q.diagramSvg ?? null,
        explanationFr: q.remediation.explanationFr.replace(/<[^>]+>/g, ""),
        explanationEn: q.remediation.explanationEn.replace(/<[^>]+>/g, ""),
      });
      addOptions(mainId, q.options, q.correctIndex);
      remediationRows.push({
        id: randomUUID(),
        questionId: mainId,
        explanationFr: q.remediation.explanationFr,
        explanationEn: q.remediation.explanationEn,
        videoUrl: v0?.url ?? null,
        videoTitle: v0?.label ?? null,
        videoUrl2: v1?.url ?? null,
        videoTitle2: v1?.label ?? null,
      });

      const children = [...q.remediation.followups];
      children.forEach((child, ci) => {
        const childId = randomUUID();
        questionRows.push({
          id: childId,
          quizId,
          parentId: mainId,
          order: ci,
          skillTag: q.skillTag,
          textFr: child.textFr,
          textEn: child.textEn,
          explanationFr: "",
          explanationEn: "",
        });
        addOptions(childId, child.options, child.correctIndex);
      });
    }
  });

  await prisma.$transaction(
    async (tx) => {
      await tx.quiz.create({
        data: {
          id: quizId,
          slug: data.slug,
          titleFr: data.titleFr,
          titleEn: data.titleEn,
          subjectId: subject.id,
          gradeId: grade.id,
          teacherId: session.user!.id,
          isPublished: false,
          prelimBadgeFr: data.prelim?.badgeFr ?? null,
          prelimBadgeEn: data.prelim?.badgeEn ?? null,
          prelimTitleFr: data.prelim?.titleFr ?? null,
          prelimTitleEn: data.prelim?.titleEn ?? null,
          prelimDescFr: data.prelim?.descFr ?? null,
          prelimDescEn: data.prelim?.descEn ?? null,
          prelimUrl: data.prelim?.url ?? null,
        },
      });
      await tx.part.createMany({ data: partRows });
      await tx.question.createMany({ data: questionRows });
      await tx.option.createMany({ data: optionRows });
      await tx.remediation.createMany({ data: remediationRows });
    },
    { timeout: 120_000, maxWait: 15_000 }
  );

  return NextResponse.json({ id: quizId, slug: data.slug });
}
