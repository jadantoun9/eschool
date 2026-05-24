import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { newSlug } from "@/lib/slug";

const CreateQuiz = z.object({
  titleFr: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().max(200).optional().nullable(),
  subjectId: z.string().min(1),
  gradeId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = CreateQuiz.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });

  const { titleFr, titleEn, subjectId, gradeId } = parsed.data;

  // Subject must belong to this teacher (or super-admin can use any).
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
  if (session.user.role !== "SUPER_ADMIN" && subject.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const quiz = await prisma.quiz.create({
    data: {
      slug: newSlug(),
      titleFr,
      titleEn: titleEn || null,
      subjectId,
      gradeId,
      teacherId: session.user.id,
    },
  });
  return NextResponse.json({ id: quiz.id, slug: quiz.slug });
}
