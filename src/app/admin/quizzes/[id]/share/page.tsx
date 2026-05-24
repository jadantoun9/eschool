import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ShareClient from "./ShareClient";

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const quiz = await prisma.quiz.findUnique({ where: { id }, select: { slug: true, titleFr: true, isPublished: true, teacherId: true } });
  if (!quiz) notFound();
  if (session.user.role !== "SUPER_ADMIN" && quiz.teacherId !== session.user.id) notFound();
  return <ShareClient slug={quiz.slug} title={quiz.titleFr} isPublished={quiz.isPublished} />;
}
