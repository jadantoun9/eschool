import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubmitPayload } from "@/types/quiz";
import { grade } from "@/lib/grading";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = SubmitPayload.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }
  const { slug, studentName, studentClass, language, answers, followUpAnswers } = parsed.data;

  const quiz = await prisma.quiz.findUnique({
    where: { slug },
    include: {
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

  if (!quiz || !quiz.isPublished) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const { score, total, corrections } = grade({
    questions: quiz.questions,
    answers,
    lang: language,
  });

  // Persist submission + answers (main + follow-ups).
  const followUpQuestionIds = new Set(
    quiz.questions.flatMap((q) => q.followUps.map((fu) => fu.id))
  );
  const followUpCorrectLetterById = new Map<string, string>();
  for (const q of quiz.questions) {
    for (const fu of q.followUps) {
      const c = fu.options.find((o) => o.isCorrect);
      if (c) followUpCorrectLetterById.set(fu.id, c.letter);
    }
  }

  const validFollowUpAnswers = (followUpAnswers ?? []).filter((a) =>
    followUpQuestionIds.has(a.questionId)
  );

  const submission = await prisma.submission.create({
    data: {
      quizId: quiz.id,
      studentName,
      studentClass: studentClass || null,
      score,
      total,
      language,
      answers: {
        create: [
          ...corrections.map((c) => ({
            questionId: c.questionId,
            chosenLetter: c.chosenLetter,
            isCorrect: c.isCorrect,
          })),
          ...validFollowUpAnswers.map((a) => ({
            questionId: a.questionId,
            chosenLetter: a.chosenLetter,
            isCorrect:
              a.chosenLetter != null &&
              a.chosenLetter === followUpCorrectLetterById.get(a.questionId),
          })),
        ],
      },
    },
  });

  return NextResponse.json({
    submissionId: submission.id,
    score,
    total,
    corrections,
  });
}
