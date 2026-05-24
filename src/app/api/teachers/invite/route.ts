import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customAlphabet } from "nanoid";

const token = customAlphabet("abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789", 32);

const Body = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(120),
});

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.teacher.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already used" }, { status: 409 });

  const inviteToken = token();
  const teacher = await prisma.teacher.create({
    data: { email, name: parsed.data.name, role: "TEACHER", inviteToken },
  });
  return NextResponse.json({
    id: teacher.id,
    email: teacher.email,
    // The super-admin copies this link manually (no email sender in MVP).
    inviteUrl: `/admin/accept-invite?token=${inviteToken}`,
  });
}
