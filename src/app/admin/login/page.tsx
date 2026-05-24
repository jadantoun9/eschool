import { getLang } from "@/lib/lang";
import { dict } from "@/lib/i18n";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const lang = await getLang();
  return <LoginClient strings={dict[lang]} />;
}
