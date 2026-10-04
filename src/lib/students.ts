import type { Prisma } from "@prisma/client";

function norm(s: string | null | undefined): string {
  return (s ?? "").normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
}

// Students have no accounts: a submission only carries the name/class they
// typed. The same (name, class) pair — ignoring case and extra spaces — is
// treated as one student. The key is URL-safe so it can be a route segment.
export function studentKey(name: string, cls: string | null): string {
  return Buffer.from(`${norm(name)}\u0000${norm(cls)}`, "utf8").toString("base64url");
}

// Teachers only see submissions to their own worksheets; super admins see all.
export function submissionScope(user: { id: string; role: string }): Prisma.SubmissionWhereInput {
  return user.role === "SUPER_ADMIN" ? {} : { quiz: { teacherId: user.id } };
}

export function scorePct(score: number, total: number): number {
  return Math.round((score / Math.max(1, total)) * 100);
}

export function scoreColor(pct: number): string {
  return pct >= 80 ? "#86efac" : pct >= 60 ? "var(--accent)" : "#fca5a5";
}
