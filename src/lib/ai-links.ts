import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { z } from "zod";
import { CLAUDE_MODEL, OPENAI_MODEL, describeError } from "@/lib/ai-worksheet";
import type { QuizImport } from "@/lib/quiz-import-schema";

// Second step of automatic generation: a model with web search looks for one
// existing video or interactive activity per question (YouTube, GeoGebra,
// Khan Academy, PhET) — Claude first, ChatGPT if Claude fails. Kept apart
// from the worksheet itself because the generating step cannot browse, and
// would invent URLs. Every link returned is checked to still open before it
// is kept.

const ALLOWED_DOMAINS = ["youtube.com", "youtu.be", "geogebra.org", "khanacademy.org", "phet.colorado.edu"];

export type QuestionLink = {
  part: number;
  question: number;
  url: string;
  labelFr: string;
  labelEn: string;
};

const SYSTEM_PROMPT = `You find learning resources for the questions of a worksheet on the ICE Learning platform, a bilingual (French + English) site for middle- and high-school science and mathematics. Each link you return is shown next to its question, for a student who is stuck on it.

## You search; you never create
Your only job is to browse the web and pick resources that already exist and are published online. Never generate, write, script, describe or invent a video, an animation, an activity or any other resource yourself, and never propose one that "could be made". Every link you return points to an existing page you found through web search.

## What to find
For each question, search the web for at most one existing resource: a YouTube video, a GeoGebra activity, a Khan Academy video, article or exercise, or a PhET simulation.

## Relevance comes first
The resource must be very relevant to the content of that specific question: it teaches or lets the student explore the exact skill the question tests, at a level that fits the grade. A resource on the chapter in general is not enough. For example, for a question on the ratio of the areas of two similar triangles, link a resource on that ratio, not a general introduction to similar triangles. Judge from the page's title and description in the search results. When no resource is clearly relevant, leave the question out: no link is always better than a loosely related one.

## Rules
- Use only URLs that appeared in your search results. Never guess, shorten or build a URL yourself.
- If your searches find nothing relevant for a question, leave it out. Never fill the gap with a resource you make up.
- Prefer French-language resources when one of good quality exists; otherwise English.
- Prefer well-known sources (Khan Academy, Yvan Monka / Maths et tiques, Mario's Math Tutoring, The Organic Chemistry Tutor, official GeoGebra materials…).
- The same resource can serve several questions only if it is truly relevant to each.
- labelFr / labelEn: a short title saying what the resource is and where it comes from, e.g. « Vidéo Khan Academy — rapport des aires de triangles semblables » / "Khan Academy video — ratio of areas of similar triangles". Say "vidéo" / "video" or "activité interactive" / "interactive activity".

## Answer
When you are done searching, reply with only this JSON object, no other text:
{"links": [{"q": <question number>, "url": "<url>", "labelFr": "<label>", "labelEn": "<label>"}]}`;

const answerSchema = z.object({
  links: z.array(
    z.object({
      q: z.number().int(),
      url: z.string().url(),
      labelFr: z.string().min(1),
      labelEn: z.string().min(1),
    })
  ),
});

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

function userPrompt(data: QuizImport, subject: string, grade: string): string {
  const lines: string[] = [];
  let n = 0;
  for (const part of data.parts) {
    for (const q of part.questions) {
      n++;
      const answer = q.options[q.correctIndex]?.textEn ?? "";
      lines.push(
        `${n}. [${q.skillTag}] ${stripHtml(q.textEn || q.textFr)}\n   Correct answer: ${stripHtml(answer)}`
      );
    }
  }
  return `Subject: ${subject}\nGrade: ${grade}\nWorksheet: ${data.titleEn || data.titleFr}\n\nQuestions:\n${lines.join("\n")}`;
}

function allowedHost(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return ALLOWED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
}

// YouTube answers 200 on its oEmbed endpoint only for videos that still exist
// and can be embedded; other sites get a plain GET.
async function stillOpens(url: string): Promise<boolean> {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !allowedHost(parsed)) return false;
  const isYouTube = /(^|\.)youtube\.com$|^youtu\.be$/.test(parsed.hostname);
  const target = isYouTube
    ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`
    : url;
  try {
    const res = await fetch(target, { redirect: "follow", signal: AbortSignal.timeout(10_000) });
    return res.ok;
  } catch {
    return false;
  }
}

// Each provider runs the search and returns the JSON object from its final
// answer, or throws with a short reason.
type Search = { user: string; maxSearches: number };

async function searchWithClaude({ user, maxSearches }: Search): Promise<unknown> {
  const client = new Anthropic();
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: user }];

  let message: Anthropic.Beta.BetaMessage;
  // The server-side search loop can pause on long runs; resending the turn
  // lets it carry on where it stopped.
  for (let round = 0; ; round++) {
    const stream = client.beta.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 32000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      output_config: { effort: "medium" },
      tools: [
        {
          type: "web_search_20260209",
          name: "web_search",
          allowed_domains: ALLOWED_DOMAINS,
          max_uses: maxSearches,
        },
      ],
      messages,
    });
    message = await stream.finalMessage();
    if (message.stop_reason !== "pause_turn" || round >= 4) break;
    messages.push({ role: "assistant", content: message.content });
  }

  if (message.stop_reason === "refusal") throw new Error("Claude declined the request");
  if (message.stop_reason === "max_tokens") throw new Error("Claude's answer was cut off (max_tokens)");
  if (message.stop_reason === "pause_turn") throw new Error("the web search did not finish");

  // Only the text after the last search is the answer.
  const lastTool = message.content.findLastIndex((b) => b.type !== "text");
  const text = message.content
    .slice(lastTool + 1)
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return extractJson(text);
}

async function searchWithOpenAI({ user }: Search): Promise<unknown> {
  const client = new OpenAI();
  const response = await client.responses.create({
    model: OPENAI_MODEL,
    instructions: SYSTEM_PROMPT,
    input: user,
    reasoning: { effort: "medium" },
    tools: [{ type: "web_search", filters: { allowed_domains: ALLOWED_DOMAINS } }],
  });
  if (response.status === "incomplete") {
    throw new Error(`ChatGPT's answer was cut off (${response.incomplete_details?.reason ?? "incomplete"})`);
  }
  if (!response.output_text) throw new Error("ChatGPT returned no answer");
  return extractJson(response.output_text);
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  if (start === -1) throw new Error("no JSON in the answer");
  return JSON.parse(text.slice(start, text.lastIndexOf("}") + 1));
}

const PROVIDERS = [
  { name: "Claude", model: CLAUDE_MODEL, run: searchWithClaude },
  { name: "ChatGPT", model: OPENAI_MODEL, run: searchWithOpenAI },
];

export async function findQuestionLinks(
  data: QuizImport,
  subject: string,
  grade: string
): Promise<QuestionLink[]> {
  const positions: Array<{ part: number; question: number }> = [];
  data.parts.forEach((p, pi) => p.questions.forEach((_, qi) => positions.push({ part: pi, question: qi })));
  if (positions.length === 0) return [];

  // Claude first, ChatGPT if it fails; an answer that isn't the expected
  // JSON also counts as a failure.
  const search = { user: userPrompt(data, subject, grade), maxSearches: Math.min(60, positions.length * 3) };
  const failures: string[] = [];
  let answer: z.infer<typeof answerSchema> | null = null;
  let provider = "";
  for (const p of PROVIDERS) {
    try {
      answer = answerSchema.parse(await p.run(search));
      provider = p.name;
      break;
    } catch (err) {
      const reason = `${p.name} (${p.model}): ${err instanceof z.ZodError || err instanceof SyntaxError ? "returned invalid JSON" : describeError(err)}`;
      console.error("[ai-links]", reason);
      failures.push(reason);
    }
  }
  if (!answer) throw new Error(failures.join(" | "));

  const candidates = answer.links.filter((l) => l.q >= 1 && l.q <= positions.length);
  const checks = await Promise.all(candidates.map((l) => stillOpens(l.url)));
  const seen = new Set<number>();
  const links: QuestionLink[] = [];
  candidates.forEach((l, i) => {
    if (!checks[i]) console.warn("[ai-links] dropped, does not open:", l.url);
    if (!checks[i] || seen.has(l.q)) return;
    seen.add(l.q);
    links.push({ ...positions[l.q - 1], url: l.url, labelFr: l.labelFr.trim(), labelEn: l.labelEn.trim() });
  });
  console.info(`[ai-links] ${provider}: ${answer.links.length} proposed, ${links.length} kept, ${positions.length} questions`);
  return links;
}
