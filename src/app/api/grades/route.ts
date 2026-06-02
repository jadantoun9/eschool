import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const grades = await prisma.grade.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(grades);
}

const Create = z.object({
  slug: z.string().trim().min(1).max(20).regex(/^[a-z0-9-]+$/),
  nameFr: z.string().trim().min(1).max(60),
  nameEn: z.string().trim().min(1).max(60),
});

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = Create.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const max = await prisma.grade.aggregate({ _max: { order: true } });
  const grade = await prisma.grade.create({
    data: { ...parsed.data, order: (max._max.order ?? 0) + 1 },
  });
  return NextResponse.json(grade);
}
