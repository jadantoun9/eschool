import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { newSlug } from "@/lib/slug";

const CreateQuiz = z.object({
  titleFr: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().max(200).optional().nullable(),
  subjectId: z.string().trim().min(1),
  gradeId: z.string().trim().min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = CreateQuiz.safeParse(json);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );

  const { titleFr, titleEn, subjectId, gradeId } = parsed.data;

  const [subject, grade] = await Promise.all([
    prisma.subject.findUnique({ where: { id: subjectId } }),
    prisma.grade.findUnique({ where: { id: gradeId } }),
  ]);
  if (!subject || !grade)
    return NextResponse.json({ error: "Invalid subject or grade" }, { status: 400 });

  const quiz = await prisma.quiz.create({
    data: {
      slug: newSlug(),
      titleFr,
      titleEn: titleEn || null,
      subjectId: subject.id,
      gradeId: grade.id,
      teacherId: session.user.id,
    },
  });
  return NextResponse.json({ id: quiz.id, slug: quiz.slug });
}
