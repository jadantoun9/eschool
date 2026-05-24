import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeachersClient from "./TeachersClient";

export default async function TeachersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/admin");

  const teachers = await prisma.teacher.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, passwordHash: true, inviteToken: true, createdAt: true },
  });

  return (
    <div style={{ maxWidth: 880 }}>
      <h1 style={{ fontFamily: "Crimson Pro, serif", fontSize: 26, marginBottom: 16 }}>Enseignants</h1>
      <TeachersClient
        teachers={teachers.map((t) => ({
          id: t.id,
          email: t.email,
          name: t.name,
          role: t.role,
          status: t.passwordHash ? "active" : "pending",
          inviteToken: t.inviteToken,
        }))}
      />
    </div>
  );
}
