import { z } from "zod";

const optionSchema = z.object({
  textFr: z.string().min(1),
  textEn: z.string().min(1),
});

const childQuestionSchema = z.object({
  textFr: z.string().min(1),
  textEn: z.string().min(1),
  correctIndex: z.number().int().min(0).max(3),
  options: z.array(optionSchema).length(4),
});

const videoSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

const remediationSchema = z.object({
  explanationFr: z.string().min(1),
  explanationEn: z.string().min(1),
  videos: z.array(videoSchema).max(2).optional().default([]),
  followups: z.array(childQuestionSchema).length(2),
});

const questionSchema = z.object({
  skillTag: z.string().min(1),
  textFr: z.string().min(1),
  textEn: z.string().min(1),
  hintFr: z.string().nullable().optional(),
  hintEn: z.string().nullable().optional(),
  diagramSvg: z.string().nullable().optional(),
  correctIndex: z.number().int().min(0).max(3),
  options: z.array(optionSchema).length(4),
  remediation: remediationSchema,
});

const partSchema = z.object({
  titleFr: z.string().min(1),
  titleEn: z.string().min(1),
  subtitleFr: z.string().nullable().optional(),
  subtitleEn: z.string().nullable().optional(),
  questions: z.array(questionSchema).min(1),
});

const prelimSchema = z.object({
  badgeFr: z.string().min(1),
  badgeEn: z.string().min(1),
  titleFr: z.string().min(1),
  titleEn: z.string().min(1),
  descFr: z.string().min(1),
  descEn: z.string().min(1),
  url: z.string().url(),
});

export const quizImportSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, digits, or hyphens"),
  titleFr: z.string().min(1),
  titleEn: z.string().min(1),
  subjectSlug: z.string().min(1),
  gradeSlug: z.string().min(1),
  prelim: prelimSchema.nullable().optional(),
  parts: z.array(partSchema).min(1),
});

export type QuizImport = z.infer<typeof quizImportSchema>;
export type QuestionImport = z.infer<typeof questionSchema>;
