import type { Prisma } from "@prisma/client";
import { CHALLENGE_MIN_PCT } from "@/types/quiz";

function norm(s: string | null | undefined): string {
  return (s ?? "").normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
}

// Students have no accounts: a submission only carries the name/class they
// typed. The same (name, class) pair — ignoring case and extra spaces — is
// treated as one student. The key is URL-safe so it can be a route segment.
export function studentKey(name: string, cls: string | null): string {
  return Buffer.from(`${norm(name)}\u0000${norm(cls)}`, "utf8").toString("base64url");
}

// Teachers only see submissions to their own worksheets; super admins see all.
export function submissionScope(user: { id: string; role: string }): Prisma.SubmissionWhereInput {
  return user.role === "SUPER_ADMIN" ? {} : { quiz: { teacherId: user.id } };
}

export function scorePct(score: number, total: number): number {
  return Math.round((score / Math.max(1, total)) * 100);
}

// Follow-up questions appear under each main question the student got wrong
// (when it has a remediation). Include this on a submission's answers to get
// what followUpStats needs.
export const answerWithQuestion = {
  question: {
    select: {
      parentId: true,
      isChallenge: true,
      remediation: { select: { id: true } },
      _count: { select: { followUps: true } },
    },
  },
} satisfies Prisma.AnswerInclude;

type StatsAnswer = Prisma.AnswerGetPayload<{ include: typeof answerWithQuestion }>;

// correct / total is the follow-up score; total counts every follow-up the
// student was offered, answered or not.
export function followUpStats(answers: StatsAnswer[]): { correct: number; answered: number; total: number } {
  let correct = 0;
  let answered = 0;
  let total = 0;
  for (const a of answers) {
    if (a.question.isChallenge) continue;
    if (a.question.parentId) {
      answered++;
      if (a.isCorrect) correct++;
    } else if (!a.isCorrect && a.question.remediation) {
      total += a.question._count.followUps;
    }
  }
  return { correct, answered, total };
}

// "2/5", or "—" when no follow-up was offered or none was answered.
export function followUpLabel(s: { correct: number; answered: number; total: number }): string {
  return s.total > 0 && s.answered > 0 ? `${s.correct}/${s.total}` : "—";
}

export function challengeOffered(score: number, total: number): boolean {
  return total > 0 && scorePct(score, total) >= CHALLENGE_MIN_PCT;
}

// Challenge score: correct / challengeCount, for students who were offered
// the quiz's challenge questions (null when they weren't).
export function challengeStats(
  sub: { score: number; total: number; answers: StatsAnswer[] },
  challengeCount: number
): { correct: number; answered: number; total: number } | null {
  if (challengeCount === 0 || !challengeOffered(sub.score, sub.total)) return null;
  const answers = sub.answers.filter((a) => a.question.isChallenge);
  return { correct: answers.filter((a) => a.isCorrect).length, answered: answers.length, total: challengeCount };
}

export function scoreColor(pct: number): string {
  return pct >= 80 ? "#86efac" : pct >= 60 ? "var(--accent)" : "#fca5a5";
}
