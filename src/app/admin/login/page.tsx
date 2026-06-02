import { getLang } from "@/lib/lang";
import { dict } from "@/lib/i18n";
import LoginClient from "./LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const lang = await getLang();
  const { expired } = await searchParams;
  const notice = expired
    ? lang === "fr"
      ? "Votre session a expiré. Veuillez vous reconnecter."
      : "Your session expired. Please sign in again."
    : null;
  return <LoginClient strings={dict[lang]} notice={notice} />;
}
