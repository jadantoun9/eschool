import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const Body = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const teacher = await prisma.teacher.findUnique({ where: { inviteToken: parsed.data.token } });
  if (!teacher) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.teacher.update({
    where: { id: teacher.id },
    data: { passwordHash, inviteToken: null },
  });
  return NextResponse.json({ ok: true });
}
