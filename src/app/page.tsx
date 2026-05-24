import Link from "next/link";

export default function Home() {
  return (
    <main className="wrap" style={{ padding: "4rem 1rem" }}>
      <h1 style={{ fontFamily: "Crimson Pro, serif", fontSize: 32, marginBottom: 12 }}>
        e-school
      </h1>
      <p style={{ color: "var(--g500)", marginBottom: 24 }}>
        Plateforme de fiches d&apos;exercices pour les enseignants et leurs élèves.
      </p>
      <Link href="/admin/login" className="btn-primary" style={{ display: "inline-block", width: "auto", padding: "10px 20px", textDecoration: "none" }}>
        Espace enseignant
      </Link>
    </main>
  );
}
