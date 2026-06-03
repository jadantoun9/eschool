import type { Metadata } from "next";
import "./globals.css";
import { Inter, Lexend } from "next/font/google";
import { getLang } from "@/lib/lang";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-google",
});
const lexend = Lexend({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display-google",
});

export const metadata: Metadata = {
  title: "ICE Learning — Learn at your own pace",
  description: "Adaptive learning platform for science and mathematics.",
  icons: {
    icon: "/ice-logo.png",
    shortcut: "/ice-logo.png",
    apple: "/ice-logo.png",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${inter.variable} ${lexend.variable}`}>
      <body>{children}</body>
    </html>
  );
}
