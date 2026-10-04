import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateWorksheet } from "@/lib/ai-worksheet";

// A full worksheet can take a few minutes to generate (longer if Claude fails
// and ChatGPT has to start over), so allow long-running requests where the
// host supports it.
export const maxDuration = 300;

const bodySchema = z.object({
  subjectId: z.string().min(1),
  gradeId: z.string().min(1),
  topic: z.string().trim().min(3).max(2000),
  questionCount: z.number().int().min(1).max(20),
  notes: z.string().trim().max(2000).optional(),
  prelimUrl: z.string().trim().url().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;

  const [subject, grade] = await Promise.all([
    prisma.subject.findUnique({ where: { id: body.subjectId } }),
    prisma.grade.findUnique({ where: { id: body.gradeId } }),
  ]);
  if (!subject || !grade) {
    return NextResponse.json({ error: "Unknown subject or grade" }, { status: 400 });
  }

  try {
    const result = await generateWorksheet({
      subject: { slug: subject.slug, nameFr: subject.nameFr, nameEn: subject.nameEn },
      grade: { slug: grade.slug, nameFr: grade.nameFr, nameEn: grade.nameEn },
      topic: body.topic,
      questionCount: body.questionCount,
      notes: body.notes || undefined,
      prelimUrl: body.prelimUrl || undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Generation failed", details: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }
}
