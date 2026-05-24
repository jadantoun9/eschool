import { NextResponse } from "next/server";
import { z } from "zod";
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

  // Atomic replace: wipe parts + questions for this quiz then recreate.
  await prisma.$transaction(async (tx) => {
    await tx.question.deleteMany({ where: { quizId: id } });
    await tx.part.deleteMany({ where: { quizId: id } });

    // Create parts first; map clientId → DB id for question linking.
    const partIdByClientId = new Map<string, string>();
    for (const p of parsed.data.parts) {
      const dbPart = await tx.part.create({
        data: {
          quizId: id,
          order: p.order,
          titleFr: p.titleFr,
          titleEn: p.titleEn || null,
          subtitleFr: p.subtitleFr || null,
          subtitleEn: p.subtitleEn || null,
        },
      });
      partIdByClientId.set(p.clientId, dbPart.id);
    }

    for (const q of parsed.data.questions) {
      const main = await tx.question.create({
        data: {
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
          options: { create: q.options.map((o) => ({ ...o, textEn: o.textEn || null })) },
          remediation: q.remediation
            ? {
                create: {
                  explanationFr: q.remediation.explanationFr,
                  explanationEn: q.remediation.explanationEn || null,
                  videoUrl: q.remediation.videoUrl || null,
                  videoTitle: q.remediation.videoTitle || null,
                },
              }
            : undefined,
        },
      });
      for (const fu of q.followUps ?? []) {
        await tx.question.create({
          data: {
            quizId: id,
            parentId: main.id,
            order: 0,
            textFr: fu.textFr,
            textEn: fu.textEn || null,
            explanationFr: "",
            options: { create: fu.options.map((o) => ({ ...o, textEn: o.textEn || null })) },
          },
        });
      }
    }
  });

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
