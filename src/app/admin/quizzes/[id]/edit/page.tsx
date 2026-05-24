import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditClient from "./EditClient";

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      parts: { orderBy: { order: "asc" } },
      questions: {
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: {
          options: { orderBy: { letter: "asc" } },
          remediation: true,
          followUps: { include: { options: { orderBy: { letter: "asc" } } } },
        },
      },
    },
  });
  if (!quiz) notFound();
  if (session.user.role !== "SUPER_ADMIN" && quiz.teacherId !== session.user.id) notFound();

  return <EditClient quiz={JSON.parse(JSON.stringify(quiz))} />;
}
