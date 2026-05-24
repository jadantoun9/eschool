import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const Patch = z.object({
  titleFr: z.string().trim().min(1).max(200).optional(),
  titleEn: z.string().trim().max(200).nullable().optional(),
  subjectId: z.string().optional(),
  gradeId: z.string().optional(),
  isPublished: z.boolean().optional(),
  prelimBadgeFr:  z.string().trim().max(120).nullable().optional(),
  prelimBadgeEn:  z.string().trim().max(120).nullable().optional(),
  prelimTitleFr:  z.string().trim().max(200).nullable().optional(),
  prelimTitleEn:  z.string().trim().max(200).nullable().optional(),
  prelimDescFr:   z.string().trim().max(1000).nullable().optional(),
  prelimDescEn:   z.string().trim().max(1000).nullable().optional(),
  prelimUrl:      z.string().url().nullable().optional().or(z.literal("")),
  prelimEmbedUrl: z.string().url().nullable().optional().or(z.literal("")),
});

async function ensureOwner(id: string) {
  const session = await auth();
  if (!session?.user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const quiz = await prisma.quiz.findUnique({ where: { id }, select: { teacherId: true } });
  if (!quiz) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (session.user.role !== "SUPER_ADMIN" && quiz.teacherId !== session.user.id) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await ensureOwner(id);
  if ("error" in guard) return guard.error;

  const parsed = Patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  // Normalize empty strings → null so the student page can detect absence.
  const data = { ...parsed.data };
  for (const k of ["prelimUrl", "prelimEmbedUrl"] as const) {
    if (data[k] === "") data[k] = null;
  }
  const quiz = await prisma.quiz.update({ where: { id }, data });
  return NextResponse.json({ id: quiz.id });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await ensureOwner(id);
  if ("error" in guard) return guard.error;
  await prisma.quiz.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
