import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { CopyLinkFloating } from "@/components/CopyLinkFloating";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import QuizClient from "./QuizClient";

export const dynamic = "force-dynamic";

export default async function StudentQuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { slug }, select: { isPublished: true } });

  const session = await auth();
  const isStaff = !!session?.user;
  const lang = await getLang();

  // Students only see published worksheets. Staff can preview drafts.
  if (!quiz || (!quiz.isPublished && !isStaff)) notFound();

  return (
    <div className="page">
      <div className="page-inner">
        <SiteNav mode="public" />
        {isStaff && (
          <CopyLinkFloating
            slug={slug}
            label={t("dash.copyLink", lang)}
            copiedLabel={t("dash.linkCopied", lang)}
          />
        )}
        <section className="section">
          <div className="container container--narrow">
            <QuizClient slug={slug} lang={lang} />
          </div>
        </section>
        <SiteFooter />
      </div>
    </div>
  );
}
