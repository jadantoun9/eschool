import { getLang } from "@/lib/lang";
import { dict, t } from "@/lib/i18n";
import LoginClient from "./LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const lang = await getLang();
  const { expired } = await searchParams;
  const notice = expired ? t("login.sessionExpired", lang) : null;
  return <LoginClient strings={dict[lang]} notice={notice} />;
}
