import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { CopyLinkFloating } from "@/components/CopyLinkFloating";
import QuizClient from "./QuizClient";

export const dynamic = "force-dynamic";

export default async function StudentQuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { slug }, select: { isPublished: true } });
  if (!quiz || !quiz.isPublished) notFound();

  const session = await auth();
  const isStaff = !!session?.user;
  const lang = await getLang();

  return (
    <div className="student-shell">
      {isStaff && (
        <CopyLinkFloating
          slug={slug}
          label={t("dash.copyLink", lang)}
          copiedLabel={t("dash.linkCopied", lang)}
        />
      )}
      <QuizClient slug={slug} />
    </div>
  );
}
