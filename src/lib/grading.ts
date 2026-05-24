import type { Prisma } from "@prisma/client";
import type { Lang, QuestionCorrection } from "@/types/quiz";

export type QuestionWithAll = Prisma.QuestionGetPayload<{
  include: {
    options: true;
    remediation: true;
    followUps: { include: { options: true } };
  };
}>;

const t = (fr: string | null | undefined, en: string | null | undefined, lang: Lang) =>
  (lang === "en" && en) ? en : fr ?? "";

/**
 * Pure grading function. Given the full question tree and the student's answers,
 * produce per-question corrections and the overall score. Main-question answers
 * count toward the score; follow-up answers are tracked but don't affect score
 * (they're remediation, not assessment).
 */
export function grade(args: {
  questions: QuestionWithAll[]; // main questions only (parentId = null)
  answers: { questionId: string; chosenLetter: string | null }[];
  lang: Lang;
}): { score: number; total: number; corrections: QuestionCorrection[] } {
  const { questions, answers, lang } = args;
  const chosenByQ = new Map(answers.map((a) => [a.questionId, a.chosenLetter]));

  let score = 0;
  const corrections: QuestionCorrection[] = [];

  for (const q of questions) {
    const correct = q.options.find((o) => o.isCorrect);
    const correctLetter = correct?.letter ?? "";
    const chosen = chosenByQ.get(q.id) ?? null;
    const isCorrect = chosen != null && chosen === correctLetter;
    if (isCorrect) score++;

    corrections.push({
      questionId: q.id,
      order: q.order,
      text: t(q.textFr, q.textEn, lang),
      chosenLetter: chosen,
      correctLetter,
      isCorrect,
      explanation: t(q.explanationFr, q.explanationEn, lang),
      options: q.options.map((o) => ({
        letter: o.letter,
        text: t(o.textFr, o.textEn, lang),
        isCorrect: o.isCorrect,
      })),
      remediation:
        !isCorrect && q.remediation
          ? {
              explanation: t(q.remediation.explanationFr, q.remediation.explanationEn, lang),
              videoUrl: q.remediation.videoUrl ?? null,
              videoTitle: q.remediation.videoTitle ?? null,
              followUps: q.followUps.map((fu) => {
                const fuCorrect = fu.options.find((o) => o.isCorrect);
                return {
                  id: fu.id,
                  text: t(fu.textFr, fu.textEn, lang),
                  correctLetter: fuCorrect?.letter ?? "",
                  options: fu.options.map((o) => ({
                    letter: o.letter,
                    text: t(o.textFr, o.textEn, lang),
                    isCorrect: o.isCorrect,
                  })),
                };
              }),
            }
          : null,
    });
  }

  return { score, total: questions.length, corrections };
}
