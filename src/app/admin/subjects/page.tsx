import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SubjectsClient from "./SubjectsClient";

export default async function SubjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const isSA = session.user.role === "SUPER_ADMIN";
  const subjects = await prisma.subject.findMany({
    where: isSA ? {} : { teacherId: session.user.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { quizzes: true } } },
  });
  const grades = await prisma.grade.findMany({ orderBy: { name: "asc" } });

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontFamily: "Crimson Pro, serif", fontSize: 26, marginBottom: 16 }}>Matières & niveaux</h1>
      <SubjectsClient
        subjects={subjects.map((s) => ({ id: s.id, name: s.name, quizCount: s._count.quizzes }))}
        grades={grades}
      />
    </div>
  );
}
