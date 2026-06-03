import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { makeInviteToken, inviteExpiry } from "@/lib/invite";

// Rotate a pending teacher's invite: issue a fresh token + 7-day expiry,
// which invalidates any previously-sent link.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (teacher.passwordHash) {
    return NextResponse.json({ error: "Teacher already active" }, { status: 409 });
  }

  const inviteToken = makeInviteToken();
  await prisma.teacher.update({
    where: { id },
    data: { inviteToken, inviteTokenExpires: inviteExpiry() },
  });

  return NextResponse.json({
    email: teacher.email,
    inviteUrl: `/admin/accept-invite?token=${inviteToken}`,
  });
}
