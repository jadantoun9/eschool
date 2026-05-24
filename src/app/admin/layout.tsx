import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SidebarNavLink } from "@/components/SidebarNavLink";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const lang = await getLang();

  if (!session?.user) {
    return (
      <main
        className="min-h-screen bg-slate-50 text-slate-900"
        style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
      >
        <div className="absolute right-6 top-6 z-10">
          <LanguageSwitcher current={lang} />
        </div>
        {children}
        <Toaster richColors position="top-right" />
      </main>
    );
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        minHeight: "100vh",
        fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
        background: "rgb(248 250 252)",
        color: "rgb(15 23 42)",
      }}
    >
      <aside
        className="flex flex-col gap-4 border-r border-slate-200 bg-white"
        style={{ padding: "1.5rem 1rem", minHeight: "100vh" }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-lg font-semibold tracking-tight text-slate-900">
              e-school
            </div>
            <div className="text-xs text-slate-500">{session.user.name}</div>
          </div>
          <LanguageSwitcher current={lang} />
        </div>

        <Separator />

        <nav className="flex flex-col gap-1">
          <SidebarNavLink href="/admin" exact>
            {t("sidebar.dashboard", lang)}
          </SidebarNavLink>
          <SidebarNavLink href="/admin/quizzes/new">
            {t("sidebar.newQuiz", lang)}
          </SidebarNavLink>
          <SidebarNavLink href="/admin/subjects">
            {t("sidebar.subjects", lang)}
          </SidebarNavLink>
          {isSuperAdmin && (
            <SidebarNavLink href="/admin/teachers">
              {t("sidebar.teachers", lang)}
            </SidebarNavLink>
          )}
        </nav>

        <div className="mt-auto">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <Button
              variant="outline"
              type="submit"
              className="h-10 w-full border-slate-200 text-sm"
            >
              {t("sidebar.logout", lang)}
            </Button>
          </form>
        </div>
      </aside>

      <main style={{ padding: "2.5rem 3rem", minWidth: 0 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>{children}</div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
