import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
// Authoring source of truth: the QB array literally extracted from
// sas_mastery_final.html into prisma/qb-from-html.mjs (one-line export).
import qbModule from "./qb-from-html.mjs";

const QB = qbModule as QBItem[];

type Opt = string;
type FU = { text: string; opts: Opt[]; correct: number };
type Lang = {
  text: string;
  opts: Opt[];
  hint?: string;
  /** Only present on the `fr` block in the source HTML. */
  correct?: number;
  remed: {
    title: string;
    explain: string;
    video?: { label: string; url: string };
    video2?: { label: string; url: string };
    followups?: FU[];
    retry?: FU;
  };
};
type QBItem = {
  skill: string;
  section: string;
  diagram?: boolean;
  fr: Lang;
  en: Lang;
};

const prisma = new PrismaClient();
const slug = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);

// Strip the leading "1. " / "2. " numbering from question text so the UI
// owns numbering (it renders "Q1.", "Q2.", ...).
const stripLeadingNumber = (s: string) => s.replace(/^\s*\d+\.\s*/, "");

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SUPER_ADMIN_PASSWORD ?? "change-me";
  const name = process.env.SUPER_ADMIN_NAME ?? "Super Admin";

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.teacher.upsert({
    where: { email },
    update: { name, passwordHash, role: "SUPER_ADMIN" },
    create: { email, name, role: "SUPER_ADMIN", passwordHash },
  });

  // Default global subjects (admin-managed).
  const SUBJECTS = [
    { slug: "math",      nameFr: "Mathématiques", nameEn: "Mathematics", icon: "📐", colorKey: "math", order: 1 },
    { slug: "physics",   nameFr: "Physique",       nameEn: "Physics",    icon: "⚡",  colorKey: "phys", order: 2 },
    { slug: "chemistry", nameFr: "Chimie",         nameEn: "Chemistry",  icon: "🧪", colorKey: "chem", order: 3 },
    { slug: "biology",   nameFr: "Biologie",       nameEn: "Biology",    icon: "🌿", colorKey: "bio",  order: 4 },
  ];
  for (const s of SUBJECTS) {
    await prisma.subject.upsert({ where: { slug: s.slug }, update: s, create: s });
  }

  // Default global grades (6e → Terminale).
  const GRADES = [
    { slug: "6",  nameFr: "6ème",      nameEn: "Grade 6",  order: 1 },
    { slug: "7",  nameFr: "5ème",      nameEn: "Grade 7",  order: 2 },
    { slug: "8",  nameFr: "4ème",      nameEn: "Grade 8",  order: 3 },
    { slug: "9",  nameFr: "3ème",      nameEn: "Grade 9",  order: 4 },
    { slug: "10", nameFr: "Seconde",   nameEn: "Grade 10", order: 5 },
    { slug: "11", nameFr: "Première",  nameEn: "Grade 11", order: 6 },
    { slug: "12", nameFr: "Terminale", nameEn: "Grade 12", order: 7 },
  ];
  for (const g of GRADES) {
    await prisma.grade.upsert({ where: { slug: g.slug }, update: g, create: g });
  }

  const grade = await prisma.grade.findUniqueOrThrow({ where: { slug: "10" } });
  const subject = await prisma.subject.findUniqueOrThrow({ where: { slug: "math" } });

  // Re-seedable: wipe the previous sample quiz so changes to the HTML/QB
  // source are picked up cleanly. Cascades remove questions/options/etc.
  await prisma.quiz.deleteMany({
    where: { titleFr: "Triangles Congruents SAS — Fiche Mastery", teacherId: admin.id },
  });

  const quiz = await prisma.quiz.create({
    data: {
      slug: slug(),
      titleFr: "Triangles Congruents : Côté-Angle-Côté",
      titleEn: "Congruent Triangles : Side-Angle-Side",
      subjectId: subject.id,
      gradeId: grade.id,
      teacherId: admin.id,
      isPublished: true,
      // Preliminary GeoGebra activity, lifted straight from sas_mastery_final.html.
      prelimBadgeFr: "Activité préliminaire",
      prelimBadgeEn: "Preliminary activity",
      prelimTitleFr: "Découverte interactive des critères de congruence",
      prelimTitleEn: "Interactive discovery of congruence criteria",
      prelimDescFr:
        "Explore et découvre les règles de congruence des triangles par toi-même avant de répondre aux questions.",
      prelimDescEn:
        "Explore and discover triangle congruence rules on your own before answering the questions.",
      prelimUrl: "https://www.geogebra.org/m/vnur2wyr",
      prelimEmbedUrl: "https://www.geogebra.org/classic/vnur2wyr?embed",
    },
  });

  // The 4 parts (A/B/C/D) from the HTML's SEC_LABELS + SEC_SUBS tables.
  const PARTS: Record<string, { titleFr: string; titleEn: string; subFr: string; subEn: string }> = {
    A: { titleFr: "Partie A — Prérequis", titleEn: "Part A — Prerequisites", subFr: "Concepts fondamentaux", subEn: "Foundational concepts" },
    B: { titleFr: "Partie B — Le postulat SAS", titleEn: "Part B — The SAS Postulate", subFr: "Comprendre et identifier SAS", subEn: "Understanding and identifying SAS" },
    C: { titleFr: "Partie C — Application", titleEn: "Part C — Application", subFr: "Appliquer SAS correctement", subEn: "Applying SAS correctly" },
    D: { titleFr: "Partie D — Démonstration", titleEn: "Part D — Proof", subFr: "Prouver et raisonner", subEn: "Proving and reasoning" },
  };

  const partIdBySection: Record<string, string> = {};
  const partOrder = ["A", "B", "C", "D"];
  for (let p = 0; p < partOrder.length; p++) {
    const code = partOrder[p];
    const meta = PARTS[code];
    const part = await prisma.part.create({
      data: {
        quizId: quiz.id,
        order: p + 1,
        titleFr: meta.titleFr,
        titleEn: meta.titleEn,
        subtitleFr: meta.subFr,
        subtitleEn: meta.subEn,
      },
    });
    partIdBySection[code] = part.id;
  }

  const letters = ["A", "B", "C", "D", "E", "F"];

  for (let i = 0; i < QB.length; i++) {
    const qb = QB[i];
    const correctIndex = qb.fr.correct ?? 0; // EN block reuses FR's correct index

    const main = await prisma.question.create({
      data: {
        quizId: quiz.id,
        partId: partIdBySection[qb.section] ?? null,
        order: i + 1,
        skillTag: qb.skill,
        textFr: stripLeadingNumber(qb.fr.text),
        textEn: stripLeadingNumber(qb.en.text),
        hintFr: qb.fr.hint ?? null,
        hintEn: qb.en.hint ?? null,
        explanationFr: qb.fr.remed.explain,
        explanationEn: qb.en.remed.explain,
        options: {
          create: qb.fr.opts.map((textFr, j) => ({
            letter: letters[j],
            textFr,
            textEn: qb.en.opts[j] ?? null,
            isCorrect: j === correctIndex,
          })),
        },
        remediation: {
          create: {
            explanationFr: qb.fr.remed.explain,
            explanationEn: qb.en.remed.explain,
            // Prefer the teacher's video (video) when present, else the secondary.
            videoUrl: qb.fr.remed.video?.url ?? qb.fr.remed.video2?.url ?? null,
            videoTitle: qb.fr.remed.video?.label ?? qb.fr.remed.video2?.label ?? null,
          },
        },
      },
    });

    // Follow-ups: stored as child Questions (parentId = main.id).
    const followups = qb.fr.remed.followups ?? [];
    for (let k = 0; k < followups.length; k++) {
      const fuFr = followups[k];
      const fuEn = qb.en.remed.followups?.[k];
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          parentId: main.id,
          order: 0,
          textFr: fuFr.text,
          textEn: fuEn?.text ?? null,
          explanationFr: "",
          options: {
            create: fuFr.opts.map((textFr, j) => ({
              letter: letters[j],
              textFr,
              textEn: fuEn?.opts[j] ?? null,
              isCorrect: j === fuFr.correct,
            })),
          },
        },
      });
    }

    // The HTML also has a "retry" verification question — also a follow-up
    // conceptually. We append it after the follow-ups so the student gets
    // both as nested questions inside the remediation block.
    const retry = qb.fr.remed.retry;
    if (retry) {
      const retryEn = qb.en.remed.retry;
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          parentId: main.id,
          order: 0,
          textFr: retry.text,
          textEn: retryEn?.text ?? null,
          explanationFr: "",
          options: {
            create: retry.opts.map((textFr, j) => ({
              letter: letters[j],
              textFr,
              textEn: retryEn?.opts[j] ?? null,
              isCorrect: j === retry.correct,
            })),
          },
        },
      });
    }
  }

  const totalMain = await prisma.question.count({ where: { quizId: quiz.id, parentId: null } });
  const totalFollow = await prisma.question.count({ where: { quizId: quiz.id, parentId: { not: null } } });
  console.log(`Seed complete.`);
  console.log(`Super-admin login: ${email} / ${password}`);
  console.log(`Sample quiz: http://localhost:3003/q/${quiz.slug}`);
  console.log(`  ${totalMain} main questions, ${totalFollow} follow-up questions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
