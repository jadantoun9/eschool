import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { challengeOffered } from "@/lib/students";

// Follow-up and challenge questions are answered on the results screen,
// after the submission exists, so each answer is saved here as the student
// picks it. Only questions the student was actually offered are accepted:
// a follow-up of a main question they got wrong (with a remediation), or a
// challenge question when their score unlocked them. The first answer is
// final, as on screen.

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
    select: {
      quizId: true,
      score: true,
      total: true,
      answers: { select: { questionId: true, isCorrect: true } },
    },
  });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      quizId: true,
      parentId: true,
      isChallenge: true,
      options: { select: { letter: true, isCorrect: true } },
      parent: { select: { remediation: { select: { id: true } } } },
    },
  });
  if (!question || question.quizId !== submission.quizId) {
    return NextResponse.json({ error: "Question not in this worksheet" }, { status: 400 });
  }

  const parentAnswer = submission.answers.find((a) => a.questionId === question.parentId);
  const offered = question.isChallenge
    ? challengeOffered(submission.score, submission.total)
    : !!question.parentId && !!question.parent?.remediation && !!parentAnswer && !parentAnswer.isCorrect;
  if (!offered) {
    return NextResponse.json({ error: "Question not offered to this submission" }, { status: 400 });
  }

  const existing = submission.answers.find((a) => a.questionId === questionId);
  if (existing) return NextResponse.json({ isCorrect: existing.isCorrect });

  const isCorrect = question.options.some((o) => o.isCorrect && o.letter === chosenLetter);
  await prisma.answer.create({ data: { submissionId, questionId, chosenLetter, isCorrect } });
  return NextResponse.json({ isCorrect });
}
