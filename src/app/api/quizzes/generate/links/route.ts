import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { quizImportSchema } from "@/lib/quiz-import-schema";
import { findQuestionLinks } from "@/lib/ai-links";

// Searching the web for every question takes a minute or two.
export const maxDuration = 300;

const bodySchema = z.object({ data: quizImportSchema });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { data } = parsed.data;

  const [subject, grade] = await Promise.all([
    prisma.subject.findUnique({ where: { slug: data.subjectSlug } }),
    prisma.grade.findUnique({ where: { slug: data.gradeSlug } }),
  ]);

  try {
    const links = await findQuestionLinks(
      data,
      subject?.nameEn ?? data.subjectSlug,
      grade ? `${grade.nameEn} (FR: ${grade.nameFr})` : data.gradeSlug
    );
    return NextResponse.json({ links });
  } catch (err) {
    console.error("[ai-links]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }
}
