import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const subjects = await prisma.subject.findMany({
    where: session.user.role === "SUPER_ADMIN" ? {} : { teacherId: session.user.id },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(subjects);
}

const Create = z.object({ name: z.string().trim().min(1).max(80) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = Create.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const subject = await prisma.subject.create({
    data: { name: parsed.data.name, teacherId: session.user.id },
  });
  return NextResponse.json(subject);
}
