import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { CLAUDE_MODEL } from "@/lib/ai-worksheet";
import type { QuizImport } from "@/lib/quiz-import-schema";

// Second step of automatic generation: Claude searches the web for one video
// or interactive activity per question (YouTube, GeoGebra, Khan Academy,
// PhET). Kept apart from the worksheet itself because the generating models
// cannot browse, and would invent URLs. Every link returned is checked to
// still open before it is kept.

const ALLOWED_DOMAINS = ["youtube.com", "youtu.be", "geogebra.org", "khanacademy.org", "phet.colorado.edu"];

export type QuestionLink = {
  part: number;
  question: number;
  url: string;
  labelFr: string;
  labelEn: string;
};

const SYSTEM_PROMPT = `You find learning resources for the questions of a worksheet on the ICE Learning platform, a bilingual (French + English) site for middle- and high-school science and mathematics. Each link you return is shown next to its question, for a student who is stuck on it.

## What to find
For each question, search the web for at most one resource: a YouTube video, a GeoGebra activity, a Khan Academy video, article or exercise, or a PhET simulation.

## Relevance comes first
The resource must be very relevant to the content of that specific question: it teaches or lets the student explore the exact skill the question tests, at a level that fits the grade. A resource on the chapter in general is not enough. For example, for a question on the ratio of the areas of two similar triangles, link a resource on that ratio, not a general introduction to similar triangles. Judge from the page's title and description in the search results. When no resource is clearly relevant, leave the question out: no link is always better than a loosely related one.

## Rules
- Use only URLs that appeared in your search results. Never guess, shorten or build a URL yourself.
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

export async function findQuestionLinks(
  data: QuizImport,
  subject: string,
  grade: string
): Promise<QuestionLink[]> {
  const positions: Array<{ part: number; question: number }> = [];
  data.parts.forEach((p, pi) => p.questions.forEach((_, qi) => positions.push({ part: pi, question: qi })));
  if (positions.length === 0) return [];

  const client = new Anthropic();
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: userPrompt(data, subject, grade) },
  ];

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
          max_uses: Math.min(60, positions.length * 3),
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
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  const answer = answerSchema.parse(JSON.parse(json));

  const candidates = answer.links.filter((l) => l.q >= 1 && l.q <= positions.length);
  const checks = await Promise.all(candidates.map((l) => stillOpens(l.url)));
  const seen = new Set<number>();
  const links: QuestionLink[] = [];
  candidates.forEach((l, i) => {
    if (!checks[i] || seen.has(l.q)) return;
    seen.add(l.q);
    links.push({ ...positions[l.q - 1], url: l.url, labelFr: l.labelFr.trim(), labelEn: l.labelEn.trim() });
  });
  return links;
}
