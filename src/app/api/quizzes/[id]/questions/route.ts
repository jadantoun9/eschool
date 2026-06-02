import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FollowUpInput = z.object({
  textFr: z.string().trim().min(1),
  textEn: z.string().trim().optional().nullable(),
  options: z
    .array(z.object({
      letter: z.string().min(1).max(2),
      textFr: z.string().trim().min(1),
      textEn: z.string().trim().optional().nullable(),
      isCorrect: z.boolean(),
    }))
    .min(2)
    .max(6),
});

const PartInput = z.object({
  // Stable client-side id so questions can reference the part by index.
  clientId: z.string().min(1),
  order: z.number().int().min(0),
  titleFr: z.string().trim().min(1),
  titleEn: z.string().trim().optional().nullable(),
  subtitleFr: z.string().trim().optional().nullable(),
  subtitleEn: z.string().trim().optional().nullable(),
});

const QuestionInput = z.object({
  order: z.number().int().min(0),
  partClientId: z.string().optional().nullable(),
  skillTag: z.string().trim().optional().nullable(),
  textFr: z.string().trim().min(1),
  textEn: z.string().trim().optional().nullable(),
  hintFr: z.string().trim().optional().nullable(),
  hintEn: z.string().trim().optional().nullable(),
  explanationFr: z.string().trim().default(""),
  explanationEn: z.string().trim().optional().nullable(),
  options: z
    .array(z.object({
      letter: z.string().min(1).max(2),
      textFr: z.string().trim().min(1),
      textEn: z.string().trim().optional().nullable(),
      isCorrect: z.boolean(),
    }))
    .min(2)
    .max(6),
  remediation: z
    .object({
      explanationFr: z.string().trim().min(1),
      explanationEn: z.string().trim().optional().nullable(),
      videoUrl: z.string().url().optional().nullable().or(z.literal("")),
      videoTitle: z.string().trim().optional().nullable(),
    })
    .optional()
    .nullable(),
  followUps: z.array(FollowUpInput).optional().default([]),
});

const Body = z.object({
  parts: z.array(PartInput).optional().default([]),
  questions: z.array(QuestionInput),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const quiz = await prisma.quiz.findUnique({ where: { id }, select: { teacherId: true } });
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.user.role !== "SUPER_ADMIN" && quiz.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  // Validate: each question must have exactly one correct option.
  for (const q of parsed.data.questions) {
    const c = q.options.filter((o) => o.isCorrect).length;
    if (c !== 1) return NextResponse.json({ error: "Each question must have exactly one correct option" }, { status: 400 });
    for (const fu of q.followUps ?? []) {
      const fc = fu.options.filter((o) => o.isCorrect).length;
      if (fc !== 1) return NextResponse.json({ error: "Each follow-up must have exactly one correct option" }, { status: 400 });
    }
  }

  const { parts, questions } = parsed.data;

  // Build every row up front with pre-generated ids, then bulk-insert each
  // table with a single `createMany`. Prisma nested/per-row writes issue one
  // INSERT per row, which over a high-latency (Neon) connection blew past the
  // transaction timeout; this collapses the save to ~6 statements total. Rows
  // are ordered so parents precede children (FK checks pass within each
  // multi-row INSERT). A child's `partId` stays null — it's read via the
  // `followUps` relation, never by part.
  const partIdByClientId = new Map<string, string>();
  for (const p of parts) partIdByClientId.set(p.clientId, randomUUID());

  const partRows: Prisma.PartCreateManyInput[] = parts.map((p) => ({
    id: partIdByClientId.get(p.clientId)!,
    quizId: id,
    order: p.order,
    titleFr: p.titleFr,
    titleEn: p.titleEn || null,
    subtitleFr: p.subtitleFr || null,
    subtitleEn: p.subtitleEn || null,
  }));

  const questionRows: Prisma.QuestionCreateManyInput[] = [];
  const optionRows: Prisma.OptionCreateManyInput[] = [];
  const remediationRows: Prisma.RemediationCreateManyInput[] = [];

  for (const q of questions) {
    const mainId = randomUUID();
    questionRows.push({
      id: mainId,
      quizId: id,
      partId: q.partClientId ? partIdByClientId.get(q.partClientId) ?? null : null,
      order: q.order,
      skillTag: q.skillTag || null,
      textFr: q.textFr,
      textEn: q.textEn || null,
      hintFr: q.hintFr || null,
      hintEn: q.hintEn || null,
      explanationFr: q.explanationFr ?? "",
      explanationEn: q.explanationEn || null,
    });
    for (const o of q.options) {
      optionRows.push({ id: randomUUID(), questionId: mainId, letter: o.letter, textFr: o.textFr, textEn: o.textEn || null, isCorrect: o.isCorrect });
    }
    if (q.remediation) {
      remediationRows.push({
        id: randomUUID(),
        questionId: mainId,
        explanationFr: q.remediation.explanationFr,
        explanationEn: q.remediation.explanationEn || null,
        videoUrl: q.remediation.videoUrl || null,
        videoTitle: q.remediation.videoTitle || null,
      });
    }
    for (const fu of q.followUps ?? []) {
      const fuId = randomUUID();
      questionRows.push({
        id: fuId,
        quizId: id,
        parentId: mainId,
        order: 0,
        textFr: fu.textFr,
        textEn: fu.textEn || null,
        explanationFr: "",
      });
      for (const o of fu.options) {
        optionRows.push({ id: randomUUID(), questionId: fuId, letter: o.letter, textFr: o.textFr, textEn: o.textEn || null, isCorrect: o.isCorrect });
      }
    }
  }

  // Atomic replace: wipe parts + questions for this quiz then recreate.
  await prisma.$transaction(
    async (tx) => {
      await tx.question.deleteMany({ where: { quizId: id } });
      await tx.part.deleteMany({ where: { quizId: id } });
      if (partRows.length) await tx.part.createMany({ data: partRows });
      if (questionRows.length) await tx.question.createMany({ data: questionRows });
      if (optionRows.length) await tx.option.createMany({ data: optionRows });
      if (remediationRows.length) await tx.remediation.createMany({ data: remediationRows });
    },
    { timeout: 120_000, maxWait: 15_000 }
  );

  return NextResponse.json({ ok: true });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      parts: { orderBy: { order: "asc" } },
      questions: {
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: {
          options: true,
          remediation: true,
          followUps: { include: { options: true } },
        },
      },
    },
  });
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.user.role !== "SUPER_ADMIN" && quiz.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(quiz);
}
