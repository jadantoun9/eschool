import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Follow-up questions are answered on the results screen, after the
// submission exists, so each answer is saved here as the student picks it.
// Only follow-ups the student was actually offered are accepted (the main
// question was answered wrong and has a remediation), and the first answer
// is final, as on screen.

const bodySchema = z.object({
  submissionId: z.string().min(1),
  questionId: z.string().min(1),
  chosenLetter: z.string().min(1).max(4),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { submissionId, questionId, chosenLetter } = parsed.data;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { quizId: true, answers: { select: { questionId: true, isCorrect: true } } },
  });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  const followUp = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      quizId: true,
      parentId: true,
      options: { select: { letter: true, isCorrect: true } },
      parent: { select: { remediation: { select: { id: true } } } },
    },
  });
  const parentAnswer = submission.answers.find((a) => a.questionId === followUp?.parentId);
  if (
    !followUp ||
    followUp.quizId !== submission.quizId ||
    !followUp.parentId ||
    !followUp.parent?.remediation ||
    !parentAnswer ||
    parentAnswer.isCorrect
  ) {
    return NextResponse.json({ error: "Not a follow-up of this submission" }, { status: 400 });
  }

  const existing = submission.answers.find((a) => a.questionId === questionId);
  if (existing) return NextResponse.json({ isCorrect: existing.isCorrect });

  const isCorrect = followUp.options.some((o) => o.isCorrect && o.letter === chosenLetter);
  await prisma.answer.create({ data: { submissionId, questionId, chosenLetter, isCorrect } });
  return NextResponse.json({ isCorrect });
}
