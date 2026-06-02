import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Toaster } from "@/components/ui/sonner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteNav } from "@/components/SiteNav";
import { getLang } from "@/lib/lang";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const lang = await getLang();

  // The session is a JWT, so it isn't re-checked against the DB on each request.
  // If the teacher it points to no longer exists (e.g. after a reseed), every
  // write would fail with a foreign-key error. Detect it here and sign the user
  // out automatically instead, prompting a fresh login.
  if (session?.user) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (!teacher) redirect("/admin/logout");
  }

  // Logged-out admin routes (login, accept-invite) render bare on the navy canvas.
  if (!session?.user) {
    return (
      <div className="page">
        <div className="page-inner">
          <div style={{ position: "absolute", right: 56, top: 24, zIndex: 20 }}>
            <LanguageSwitcher current={lang} />
          </div>
          {children}
        </div>
        <Toaster theme="dark" richColors position="top-right" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-inner">
        <SiteNav mode="admin" />
        <main className="section">
          <div className="container">{children}</div>
        </main>
      </div>
      <Toaster theme="dark" richColors position="top-right" />
    </div>
  );
}
