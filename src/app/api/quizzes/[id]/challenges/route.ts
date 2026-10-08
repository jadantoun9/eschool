import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateChallenges } from "@/lib/ai-worksheet";

// Writing a few questions takes up to a minute or two.
export const maxDuration = 300;

const LETTERS = ["A", "B", "C", "D"];

// Drafts challenge questions for an existing worksheet. Nothing is saved: the
// editor adds them to the form and the teacher saves after reviewing.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    select: {
      teacherId: true,
      titleFr: true,
      titleEn: true,
      subject: { select: { nameEn: true } },
      grade: { select: { nameEn: true, nameFr: true } },
      questions: {
        where: { parentId: null, isChallenge: false },
        orderBy: { order: "asc" },
        select: {
          skillTag: true,
          textFr: true,
          textEn: true,
          options: { select: { textFr: true, textEn: true, isCorrect: true } },
        },
      },
    },
  });
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.user.role !== "SUPER_ADMIN" && quiz.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (quiz.questions.length === 0) {
    return NextResponse.json({ error: "Add questions to the worksheet first" }, { status: 400 });
  }

  try {
    const { challenges } = await generateChallenges({
      title: quiz.titleEn || quiz.titleFr,
      subject: quiz.subject.nameEn,
      grade: `${quiz.grade.nameEn} (FR: ${quiz.grade.nameFr})`,
      questions: quiz.questions.map((q) => {
        const correct = q.options.find((o) => o.isCorrect);
        return {
          skillTag: q.skillTag,
          text: q.textEn || q.textFr,
          correctAnswer: correct ? correct.textEn || correct.textFr : "",
        };
      }),
    });
    return NextResponse.json({
      challenges: challenges.map((c) => ({
        textFr: c.textFr,
        textEn: c.textEn,
        hintFr: c.hintFr ?? null,
        hintEn: c.hintEn ?? null,
        diagramSvg: c.diagramSvg ?? null,
        explanationFr: c.explanationFr,
        explanationEn: c.explanationEn,
        options: c.options.map((o, i) => ({
          letter: LETTERS[i],
          textFr: o.textFr,
          textEn: o.textEn,
          isCorrect: i === c.correctIndex,
        })),
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
}
