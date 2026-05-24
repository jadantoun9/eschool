import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "e-school",
  description: "Quizzes and mastery fiches for students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
