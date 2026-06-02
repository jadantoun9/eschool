import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const subjects = await prisma.subject.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(subjects);
}

const Create = z.object({
  slug: z.string().trim().min(1).max(40).regex(/^[a-z0-9-]+$/),
  nameFr: z.string().trim().min(1).max(80),
  nameEn: z.string().trim().min(1).max(80),
  icon: z.string().trim().max(8).optional(),
  colorKey: z.enum(["math", "phys", "chem", "bio"]).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = Create.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const max = await prisma.subject.aggregate({ _max: { order: true } });
  const subject = await prisma.subject.create({
    data: {
      ...parsed.data,
      icon: parsed.data.icon ?? "📚",
      colorKey: parsed.data.colorKey ?? "math",
      order: (max._max.order ?? 0) + 1,
    },
  });
  return NextResponse.json(subject);
}
