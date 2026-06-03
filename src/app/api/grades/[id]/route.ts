import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const grade = await prisma.grade.findUnique({
    where: { id },
    select: { id: true, _count: { select: { quizzes: true } } },
  });
  if (!grade) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Quizzes reference the grade via a required FK, so refuse to orphan them.
  if (grade._count.quizzes > 0) {
    return NextResponse.json(
      { error: "This grade is used by existing worksheets and cannot be deleted." },
      { status: 409 }
    );
  }

  await prisma.grade.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
