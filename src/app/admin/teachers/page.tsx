import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeachersClient from "./TeachersClient";
import { getLang } from "@/lib/lang";
import { dict, t } from "@/lib/i18n";

export default async function TeachersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/admin");
  const lang = await getLang();

  const teachers = await prisma.teacher.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, passwordHash: true, inviteToken: true, createdAt: true },
  });

  return (
    <TeachersClient
      lang={lang}
      strings={dict[lang]}
      teachers={teachers.map((t) => ({
        id: t.id,
        email: t.email,
        name: t.name,
        role: t.role,
        status: t.passwordHash ? "active" : "pending",
        inviteToken: t.inviteToken,
        createdAt: t.createdAt.toISOString(),
      }))}
    />
  );
}
