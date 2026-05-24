import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewQuizForm from "./NewQuizForm";

export default async function NewQuizPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const isSA = session.user.role === "SUPER_ADMIN";
  const [subjects, grades] = await Promise.all([
    prisma.subject.findMany({
      where: isSA ? {} : { teacherId: session.user.id },
      orderBy: { name: "asc" },
    }),
    prisma.grade.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontFamily: "Crimson Pro, serif", fontSize: 26, marginBottom: 16 }}>Nouvelle fiche</h1>
      <NewQuizForm subjects={subjects} grades={grades} />
    </div>
  );
}
