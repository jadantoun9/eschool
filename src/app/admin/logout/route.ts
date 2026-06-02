import { signOut } from "@/lib/auth";

// Clears the session cookie and returns to the login page. Used when the admin
// layout detects that the logged-in teacher no longer exists in the database
// (e.g. after a DB reseed or switching DATABASE_URL) — a server component can't
// mutate cookies during render, so it redirects here to sign out cleanly.
export async function GET() {
  await signOut({ redirectTo: "/admin/login?expired=1" });
}
