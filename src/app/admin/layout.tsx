import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Login page handles its own layout — but the layout still wraps it. Let the
  // page render unauthenticated; protect everything else.
  // We detect "is this the login page?" via not having a session; the login
  // page itself doesn't reference this layout's auth state.

  if (!session?.user) {
    // Allow rendering only if the child is the login page. We can't easily
    // inspect pathname in a layout, so we just render children — login page
    // is fine to show; other admin pages should additionally guard via auth().
    return <main style={{ minHeight: "100vh", background: "var(--g50)" }}>{children}</main>;
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside style={{ background: "#0F2140", color: "#fff", padding: "1.5rem 1rem" }}>
        <div style={{ fontFamily: "Crimson Pro, serif", fontSize: 22, marginBottom: 4 }}>e-school</div>
        <div style={{ fontSize: 12, opacity: .7, marginBottom: 24 }}>{session.user.name}</div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <NavLink href="/admin">Tableau de bord</NavLink>
          <NavLink href="/admin/quizzes/new">Nouvelle fiche</NavLink>
          <NavLink href="/admin/subjects">Matières</NavLink>
          {isSuperAdmin && <NavLink href="/admin/teachers">Enseignants</NavLink>}
        </nav>

        <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }} style={{ marginTop: 24 }}>
          <button className="btn-sm" style={{ width: "100%" }}>Déconnexion</button>
        </form>
      </aside>

      <main style={{ padding: "2rem", background: "var(--g50)" }}>{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "8px 12px",
        borderRadius: 8,
        color: "rgba(255,255,255,.85)",
        textDecoration: "none",
        fontSize: 14,
      }}
    >
      {children}
    </Link>
  );
}
