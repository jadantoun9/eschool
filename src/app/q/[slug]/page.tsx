import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuizClient from "./QuizClient";

export const dynamic = "force-dynamic";

export default async function StudentQuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { slug }, select: { isPublished: true } });
  if (!quiz || !quiz.isPublished) notFound();
  return <QuizClient slug={slug} />;
}
