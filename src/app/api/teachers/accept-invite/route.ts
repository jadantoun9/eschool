import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isInviteExpired } from "@/lib/invite";

const Body = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(200),
});

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (token.length < 10) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  const teacher = await prisma.teacher.findUnique({ where: { inviteToken: token } });
  if (!teacher) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  if (isInviteExpired(teacher.inviteTokenExpires)) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  // Only surface what the invite card needs — never the password hash or token.
  return NextResponse.json({
    name: teacher.name,
    email: teacher.email,
    role: teacher.role,
  });
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const teacher = await prisma.teacher.findUnique({ where: { inviteToken: parsed.data.token } });
  if (!teacher) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  if (isInviteExpired(teacher.inviteTokenExpires)) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.teacher.update({
    where: { id: teacher.id },
    data: { passwordHash, inviteToken: null, inviteTokenExpires: null },
  });
  return NextResponse.json({ ok: true });
}
