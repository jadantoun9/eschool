import { z } from "zod";

export const LANG = z.enum(["fr", "en"]);
export type Lang = z.infer<typeof LANG>;

// Public-facing question (no isCorrect leaked).
export const PublicOption = z.object({
  id: z.string(),
  letter: z.string(),
  text: z.string(),
});

export const PublicQuestion: z.ZodType<{
  id: string;
  order: number;
  text: string;
  hint: string | null;
  options: z.infer<typeof PublicOption>[];
  hasRemediation: boolean;
}> = z.object({
  id: z.string(),
  order: z.number(),
  text: z.string(),
  hint: z.string().nullable(),
  options: z.array(PublicOption),
  hasRemediation: z.boolean(),
});

export const PublicQuiz = z.object({
  slug: z.string(),
  title: z.string(),
  subject: z.string(),
  grade: z.string(),
  questions: z.array(PublicQuestion),
});
export type PublicQuiz = z.infer<typeof PublicQuiz>;
export type PublicQuestion = z.infer<typeof PublicQuestion>;

// Submission payload from student.
export const SubmitPayload = z.object({
  slug: z.string().min(1),
  studentName: z.string().trim().min(1).max(120),
  studentClass: z.string().trim().max(60).optional().or(z.literal("")),
  language: LANG,
  answers: z.array(
    z.object({
      questionId: z.string(),
      chosenLetter: z.string().nullable(),
    })
  ),
  followUpAnswers: z
    .array(
      z.object({
        questionId: z.string(),
        chosenLetter: z.string().nullable(),
      })
    )
    .optional(),
});
export type SubmitPayload = z.infer<typeof SubmitPayload>;

// Correction returned after submit.
export const QuestionCorrection = z.object({
  questionId: z.string(),
  order: z.number(),
  text: z.string(),
  chosenLetter: z.string().nullable(),
  correctLetter: z.string(),
  isCorrect: z.boolean(),
  explanation: z.string(),
  options: z.array(z.object({ letter: z.string(), text: z.string(), isCorrect: z.boolean() })),
  remediation: z
    .object({
      explanation: z.string(),
      videoUrl: z.string().nullable(),
      videoTitle: z.string().nullable(),
      followUps: z.array(
        z.object({
          id: z.string(),
          text: z.string(),
          options: z.array(z.object({ letter: z.string(), text: z.string(), isCorrect: z.boolean() })),
          correctLetter: z.string(),
        })
      ),
    })
    .nullable(),
});

export const SubmitResponse = z.object({
  submissionId: z.string(),
  score: z.number(),
  total: z.number(),
  corrections: z.array(QuestionCorrection),
});
export type SubmitResponse = z.infer<typeof SubmitResponse>;
export type QuestionCorrection = z.infer<typeof QuestionCorrection>;

// Helper: pick localized field with fallback to French.
export function pickLang<T extends { fr: string | null; en?: string | null }>(
  obj: T,
  lang: Lang
): string {
  if (lang === "en" && obj.en) return obj.en;
  return obj.fr ?? "";
}
