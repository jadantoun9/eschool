import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { lang } = await req.json();
  const value = lang === "fr" ? "fr" : "en";
  const store = await cookies();
  store.set("lang", value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return NextResponse.json({ ok: true, lang: value });
}
