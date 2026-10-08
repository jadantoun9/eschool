import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { z } from "zod";
import { challengeSchema as challengeImportSchema, quizImportSchema, type ChallengeImport, type QuizImport } from "@/lib/quiz-import-schema";
import { newSlug } from "@/lib/slug";

// Automatic worksheet generation: ChatGPT first, Claude as fallback. Both are
// asked for the same JSON (enforced by each provider's structured outputs),
// which is then assembled into a QuizImport and validated with the same schema
// the manual JSON import uses — so the result drops straight into the import
// preview/editor.

export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5";

export type GenerateInput = {
  subject: { slug: string; nameFr: string; nameEn: string };
  grade: { slug: string; nameFr: string; nameEn: string };
  topic: string;
  questionCount: number;
  notes?: string;
  prelimUrl?: string;
};

export type Provider = "claude" | "openai";

// Streamed while generating. Questions are counted as they appear in the
// partial JSON ("skillTag" is the first field of every main question), so the
// UI can show "question N of M" and estimate the time left.
export type GenerateProgress = {
  provider: Provider;
  model: string;
  phase: "thinking" | "writing";
  questionsStarted: number;
};
type OnProgress = (p: Omit<GenerateProgress, "provider" | "model">) => void;

function countQuestions(partialJson: string): number {
  return partialJson.split('"skillTag"').length - 1;
}

export type GenerateResult = {
  data: QuizImport;
  provider: Provider;
  model: string;
  /** Why earlier providers were skipped, if any (for logs / UI). */
  failures: string[];
};

// ---------------------------------------------------------------------------
// Output schema (shared by both providers). Every object lists all of its
// properties as required with additionalProperties: false, and optional values
// are nullable — the common subset both structured-output engines accept.
// Length rules (4 options, 2 follow-ups) are enforced afterwards by zod.

const nullableString = { anyOf: [{ type: "string" }, { type: "null" }] };
const correctIndex = { type: "integer", enum: [0, 1, 2, 3] };

const optionSchema = {
  type: "object",
  properties: { textFr: { type: "string" }, textEn: { type: "string" } },
  required: ["textFr", "textEn"],
  additionalProperties: false,
};

const followupSchema = {
  type: "object",
  properties: {
    textFr: { type: "string" },
    textEn: { type: "string" },
    correctIndex,
    options: { type: "array", items: optionSchema },
  },
  required: ["textFr", "textEn", "correctIndex", "options"],
  additionalProperties: false,
};

const questionSchema = {
  type: "object",
  properties: {
    skillTag: { type: "string" },
    textFr: { type: "string" },
    textEn: { type: "string" },
    hintFr: nullableString,
    hintEn: nullableString,
    diagramSvg: nullableString,
    correctIndex,
    options: { type: "array", items: optionSchema },
    remediation: {
      type: "object",
      properties: {
        explanationFr: { type: "string" },
        explanationEn: { type: "string" },
        followups: { type: "array", items: followupSchema },
      },
      required: ["explanationFr", "explanationEn", "followups"],
      additionalProperties: false,
    },
  },
  required: [
    "skillTag",
    "textFr",
    "textEn",
    "hintFr",
    "hintEn",
    "diagramSvg",
    "correctIndex",
    "options",
    "remediation",
  ],
  additionalProperties: false,
};

const challengeSchema = {
  type: "object",
  properties: {
    textFr: { type: "string" },
    textEn: { type: "string" },
    hintFr: nullableString,
    hintEn: nullableString,
    diagramSvg: nullableString,
    correctIndex,
    options: { type: "array", items: optionSchema },
    explanationFr: { type: "string" },
    explanationEn: { type: "string" },
  },
  required: ["textFr", "textEn", "hintFr", "hintEn", "diagramSvg", "correctIndex", "options", "explanationFr", "explanationEn"],
  additionalProperties: false,
};

const CHALLENGES_SCHEMA = {
  type: "object",
  properties: { challenges: { type: "array", items: challengeSchema } },
  required: ["challenges"],
  additionalProperties: false,
};

const WORKSHEET_SCHEMA = {
  type: "object",
  properties: {
    titleFr: { type: "string" },
    titleEn: { type: "string" },
    parts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          titleFr: { type: "string" },
          titleEn: { type: "string" },
          subtitleFr: nullableString,
          subtitleEn: nullableString,
          questions: { type: "array", items: questionSchema },
        },
        required: ["titleFr", "titleEn", "subtitleFr", "subtitleEn", "questions"],
        additionalProperties: false,
      },
    },
    challenges: { type: "array", items: challengeSchema },
  },
  required: ["titleFr", "titleEn", "parts", "challenges"],
  additionalProperties: false,
};

// ---------------------------------------------------------------------------
// Prompt (adapted from public/quiz-template.md, minus the chat-specific steps).

export const CHALLENGE_COUNT = 3;

const CHALLENGE_RULES = `## Challenge questions ("go further")
Write exactly ${CHALLENGE_COUNT} challenge questions. They are offered only to students who score 85% or more on the worksheet, after it is submitted, to take them beyond what is expected at their grade.
- Each one is clearly harder than every main question: multi-step reasoning, combining two or more skills of the worksheet, an unfamiliar context, a "why does this always work" or generalisation angle, or a first step into the ideas of the next chapter.
- Each stays within reach of a strong student who has mastered this chapter: no techniques from far beyond the grade.
- Same format as a main question: 4 options, the 3 wrong ones encoding mistakes a strong student could still make; one correct option.
- explanationFr / explanationEn: 2–4 sentences walking through the reasoning, shown after the student answers.
- hintFr / hintEn and diagramSvg follow the same rules as for main questions.`;

const SYSTEM_PROMPT = `You are an AI tutor designer for the ICE Learning platform, a bilingual (French + English) adaptive-learning site for middle- and high-school science and mathematics. You write complete interactive worksheets: multiple-choice questions with teaching explanations and follow-up questions. Your output is saved straight into the platform, then reviewed by the teacher.

## Question count
Write exactly the number of main questions requested. Never stop early, abbreviate, or leave placeholders.

## Question quality
Questions are substantive, exam-grade items, not one-line trivia.
- Each question makes the student reason, not just recall a definition. Where the subject calls for it, include a concrete scenario, real numbers or data to work with, a short code snippet (computer science), a small dataset or a worked setup.
- Vary difficulty: early questions check prerequisites, later ones apply and combine concepts.
- The 3 wrong options each encode a specific, common student mistake, not obviously-wrong throwaways.
- Pitch the content at the given grade level and keep to the given topic.

## Structure
- Group the questions into 2–4 parts that scaffold from prerequisites → core concept → application → extension. With 3 questions or fewer, use a single part. Never create a part without questions.
- Each question targets exactly one skill, named by a short snake_case skillTag (e.g. "angle_inclus", "newton_second_law").
- Every question, main or follow-up, has exactly 4 options; correctIndex is the 0-based position of the single correct option. Vary the position of the correct answer across questions.

## Remediation (every main question)
- explanationFr / explanationEn: 2–4 full sentences that genuinely teach — state the rule, say why the correct answer is right, and name the misconception behind the most tempting wrong answer.
- followups: exactly 2 follow-up questions on the same skill in a fresh setting, as real as the main question. Students only see them after getting the main question wrong.

## Bilingual content
- Every text field has a French (…Fr) and an English (…En) version. Translate naturally and adapt notation; don't translate word for word.
- French uses « guillemets »; English uses "…".
- Use proper Unicode symbols (∠ △ ≅ ∥ ° → ² ₁ ½ · α β π ≤ ≥ ≠), never ASCII fallbacks like "<=" or "triangle ABC".
- Text fields may use the HTML tags <strong>, <em>, <code>, <br> and <pre> (for code). No other HTML, no Markdown.

## Optional fields
- hintFr / hintEn: a short nudge shown under the question. Use on at most 1–2 questions; null otherwise.
- diagramSvg: only when a small diagram genuinely helps — an inline SVG string with viewBox="0 0 240 130", simple shapes, stroke="currentColor", no scripts or external references. null otherwise; most questions need none.
- subtitleFr / subtitleEn on a part: a short description of the part, or null.

${CHALLENGE_RULES}

## Videos and activities
Never create, generate, script or describe videos, animations or interactive activities, and never write a URL. Do not include videos or links of any kind. A separate step browses the web for existing videos and interactive lessons that match each question and inserts them.`;

function userPrompt(input: GenerateInput): string {
  const lines = [
    `Subject: ${input.subject.nameEn} (FR: ${input.subject.nameFr})`,
    `Grade: ${input.grade.nameEn} (FR: ${input.grade.nameFr})`,
    `Topic: ${input.topic}`,
    `Number of main questions: ${input.questionCount}`,
  ];
  if (input.notes) lines.push(`Teacher's notes: ${input.notes}`);
  return `Write the worksheet.\n\n${lines.join("\n")}`;
}

// ---------------------------------------------------------------------------
// Providers. Each returns the parsed JSON or throws with a short reason.

type Job = { system: string; user: string; schemaName: string; schema: Record<string, unknown> };

async function generateWithClaude(job: Job, onProgress: OnProgress): Promise<unknown> {
  const client = new Anthropic();
  // Streaming: a full worksheet is a long answer, and streaming avoids HTTP
  // timeouts on large max_tokens. finalMessage() collects the whole reply.
  const stream = client.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 64000,
    system: job.system,
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: job.schema },
    },
    messages: [{ role: "user", content: job.user }],
  });
  // Before any text arrives Claude is thinking; then the JSON streams in.
  let last = -1;
  stream.on("text", (_delta, snapshot) => {
    const n = countQuestions(snapshot);
    if (n !== last) {
      last = n;
      onProgress({ phase: "writing", questionsStarted: n });
    }
  });
  const message = await stream.finalMessage();
  if (message.stop_reason === "refusal") throw new Error("Claude declined the request");
  if (message.stop_reason === "max_tokens") throw new Error("Claude's answer was cut off (max_tokens)");
  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return JSON.parse(text);
}

async function generateWithOpenAI(job: Job, onProgress: OnProgress): Promise<unknown> {
  const client = new OpenAI();
  const stream = await client.chat.completions.create({
    model: OPENAI_MODEL,
    stream: true,
    messages: [
      { role: "system", content: job.system },
      { role: "user", content: job.user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: job.schemaName, schema: job.schema, strict: true },
    },
  });
  let text = "";
  let refusal = "";
  let finishReason: string | null = null;
  let last = -1;
  for await (const chunk of stream) {
    const choice = chunk.choices[0];
    if (!choice) continue;
    if (choice.delta?.content) {
      text += choice.delta.content;
      const n = countQuestions(text);
      if (n !== last) {
        last = n;
        onProgress({ phase: "writing", questionsStarted: n });
      }
    }
    if (choice.delta?.refusal) refusal += choice.delta.refusal;
    if (choice.finish_reason) finishReason = choice.finish_reason;
  }
  if (refusal) throw new Error(`ChatGPT declined the request: ${refusal}`);
  if (finishReason === "length") throw new Error("ChatGPT's answer was cut off (length)");
  if (!text) throw new Error("ChatGPT returned no answer");
  return JSON.parse(text);
}

// ---------------------------------------------------------------------------

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

type AiWorksheet = {
  titleFr: string;
  titleEn: string;
  parts: Array<{
    questions: Array<{ remediation: Record<string, unknown> }>;
    [k: string]: unknown;
  }>;
};

// Adds the fields the teacher picked in the form (slug, subject, grade,
// activity link) and validates against the import schema.
function assemble(raw: unknown, input: GenerateInput): QuizImport {
  const ai = raw as AiWorksheet;
  const base = slugify(ai.titleEn || ai.titleFr || input.topic) || "worksheet";
  const candidate = {
    ...ai,
    slug: `${base}-${newSlug().slice(0, 5)}`,
    subjectSlug: input.subject.slug,
    gradeSlug: input.grade.slug,
    prelim: input.prelimUrl
      ? {
          badgeFr: "Activité préliminaire",
          badgeEn: "Preliminary activity",
          titleFr: "Découverte interactive",
          titleEn: "Interactive discovery",
          descFr: "À faire avant de commencer les questions.",
          descEn: "Do this before starting the questions.",
          url: input.prelimUrl,
        }
      : null,
    parts: (ai.parts ?? []).map((p) => ({
      ...p,
      questions: (p.questions ?? []).map((q) => ({
        ...q,
        remediation: { ...q.remediation, videos: [] },
      })),
    })),
  };
  const parsed = quizImportSchema.safeParse(candidate);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`output failed validation (${issues})`);
  }
  return parsed.data;
}

export function describeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError || err instanceof OpenAI.AuthenticationError) {
    return "API key is missing or invalid";
  }
  if (err instanceof Anthropic.APIError || err instanceof OpenAI.APIError) {
    return `API error ${err.status ?? ""}: ${err.message}`.trim();
  }
  if (err instanceof SyntaxError) return "returned invalid JSON";
  return err instanceof Error ? err.message : String(err);
}

const PROVIDERS = [
  { id: "openai" as const, model: OPENAI_MODEL, run: generateWithOpenAI },
  { id: "claude" as const, model: CLAUDE_MODEL, run: generateWithClaude },
];

// ChatGPT first, Claude if it fails; `finish` validates the raw answer, and a
// validation failure also moves on to the next provider.
async function runProviders<T>(
  job: Job,
  finish: (raw: unknown) => T,
  onProgress: (p: GenerateProgress) => void
): Promise<{ value: T; provider: Provider; model: string; failures: string[] }> {
  const failures: string[] = [];
  for (const p of PROVIDERS) {
    try {
      onProgress({ provider: p.id, model: p.model, phase: "thinking", questionsStarted: 0 });
      const raw = await p.run(job, (pr) => onProgress({ provider: p.id, model: p.model, ...pr }));
      return { value: finish(raw), provider: p.id, model: p.model, failures };
    } catch (err) {
      const reason = `${p.id === "claude" ? "Claude" : "ChatGPT"} (${p.model}): ${describeError(err)}`;
      console.error("[ai-worksheet]", reason);
      failures.push(reason);
    }
  }
  throw new Error(failures.join(" | "));
}

export async function generateWorksheet(
  input: GenerateInput,
  onProgress: (p: GenerateProgress) => void = () => {}
): Promise<GenerateResult> {
  const job = { system: SYSTEM_PROMPT, user: userPrompt(input), schemaName: "worksheet", schema: WORKSHEET_SCHEMA };
  const r = await runProviders(job, (raw) => assemble(raw, input), onProgress);
  return { data: r.value, provider: r.provider, model: r.model, failures: r.failures };
}

// ---------------------------------------------------------------------------
// Challenge questions for an existing worksheet (editor's "Generate" button).

export type ChallengeContext = {
  title: string;
  subject: string;
  grade: string;
  questions: { skillTag: string | null; text: string; correctAnswer: string }[];
};

const CHALLENGE_SYSTEM_PROMPT = `You are an AI tutor designer for the ICE Learning platform, a bilingual (French + English) adaptive-learning site for middle- and high-school science and mathematics. A teacher has a worksheet and wants challenge questions for the students who master it. You are given the worksheet's questions; write challenge questions on the same chapter. Your output is added to the worksheet, then reviewed by the teacher.

${CHALLENGE_RULES}

## Bilingual content
- Every text field has a French (…Fr) and an English (…En) version. Translate naturally and adapt notation; don't translate word for word.
- French uses « guillemets »; English uses "…".
- Use proper Unicode symbols (∠ △ ≅ ∥ ° → ² ₁ ½ · α β π ≤ ≥ ≠), never ASCII fallbacks like "<=" or "triangle ABC".
- Text fields may use the HTML tags <strong>, <em>, <code>, <br> and <pre> (for code). No other HTML, no Markdown.
- Do not repeat or lightly rephrase a worksheet question.`;

const challengesResultSchema = z.object({
  challenges: z.array(challengeImportSchema).min(1),
});

export async function generateChallenges(ctx: ChallengeContext): Promise<{ challenges: ChallengeImport[]; provider: Provider; model: string }> {
  const strip = (t: string) => t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const user = [
    `Subject: ${ctx.subject}`,
    `Grade: ${ctx.grade}`,
    `Worksheet: ${ctx.title}`,
    "",
    "Worksheet questions:",
    ...ctx.questions.map(
      (q, i) => `${i + 1}. ${q.skillTag ? `[${q.skillTag}] ` : ""}${strip(q.text)}\n   Correct answer: ${strip(q.correctAnswer)}`
    ),
  ].join("\n");
  const job = { system: CHALLENGE_SYSTEM_PROMPT, user, schemaName: "challenges", schema: CHALLENGES_SCHEMA };
  const r = await runProviders(job, (raw) => challengesResultSchema.parse(raw).challenges.slice(0, CHALLENGE_COUNT), () => {});
  return { challenges: r.value, provider: r.provider, model: r.model };
}
