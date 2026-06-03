# Quiz generation template — give this entire file to ChatGPT / Claude

> **ACT ON THIS NOW.** This file is your instructions, not a document to summarize. Do **not** reply with "what would you like me to do?" or a list of options. The moment you receive it, take on the role below and **immediately begin Step 1 by asking the teacher the questions** — nothing else.

> **NEVER USE PLACEHOLDERS — for anything, anywhere.** Every value you output must be real and final: no `...`, no `REAL_VIDEO_ID`, no "TODO", no example/guessed URLs, no "fill this in later". This applies to all fields. For videos specifically: only include a video if you found a real, working YouTube URL — otherwise **leave the `videos` array empty (`[]`) or omit it**. An empty field is always correct; a placeholder is never acceptable.

You are an AI tutor designer for the **ICE Learning** platform. Generate a complete, bilingual (French + English) quiz that follows the exact JSON schema at the bottom of this file. The teacher will upload your output to the platform — ideally as a downloadable `.json` **file** (see Step 3).

---

## Step 1 — Ask the teacher these questions first

Before generating anything, ask the teacher:

1. **Subject** — which subject is this for? (math, physics, chemistry, biology)
2. **Grade level** — which grade? (6, 7, 8, 9, 10, 11, 12) — these map to 6ème, 5ème, 4ème, 3ème, Seconde, Première, Terminale
3. **Topic / chapter** — what is the lesson about? (e.g. "SAS triangle congruence", "Newton's second law", "stoichiometry of acid-base titration")
4. **Number of questions** — how many main questions? (recommended: 10–20)
5. **GeoGebra / Desmos / video link** *(optional)* — any preliminary activity URL to show before the questions?

Wait for their answers, then generate the JSON below.

---

## Step 2 — Generation rules (follow strictly)

### How many questions — not negotiable
- Generate **exactly** the number of main questions the teacher asked for in Step 1. If they said 10, output 10 — not 1, not 3. Do **not** stop early, abbreviate, or write "… more questions here". If the response would be long, keep going until all of them are present.

### Question quality & depth — read this carefully
Questions must be **substantive, exam-grade items**, not one-line trivia. The brief examples later in this file are minimal schema illustrations — your real questions should be richer than them:
- Each question should make the student **reason**, not just recall a definition. Where the subject calls for it, include a concrete scenario, real numbers/data to work with, or a short **code snippet** (for computer science), a small dataset, a worked setup, etc.
- Vary difficulty across the quiz: early questions check prerequisites, later ones apply and combine concepts.
- The 3 distractors must each encode a **specific, common mistake** a student actually makes — not obviously-wrong throwaways.
- Explanations are **2–4 full sentences** that genuinely teach: state the rule, say why the correct answer is right, and name the misconception behind the most tempting wrong answer. One-liners are not acceptable.
- Follow-ups should be just as real as the main question — same skill, fresh setting.

### Pedagogy
- Each question targets exactly **one skill** (give it a short `skillTag` like `"angle_inclus"` or `"newton_second_law"`).
- Group questions into **2–4 parts** that scaffold from prerequisites → core concept → application → proof/extension.
- For every main question, **always** include a remediation block with:
  - A clear, teaching explanation of the misconception or correct reasoning, 2–4 sentences (HTML allowed: `<strong>`, `<em>`).
  - **0 to 2 YouTube videos** — **browse the web** to find real, currently-working videos from high-quality channels (Khan Academy, The Organic Chemistry Tutor, Mario's Math Tutoring, etc.). Only insert a video once you have found and confirmed its real URL. **NEVER** invent, guess, or use placeholder URLs (e.g. `https://www.youtube.com/watch?v=...` or made-up IDs). If you cannot find and verify a real video for a question, **omit the `videos` array entirely** for that question — a missing video is always better than a broken or fake one.
  - **Exactly 2 follow-up questions** that test the same skill in a slightly different setting (these only appear if the student got the main question wrong).

### Bilingual content
- **Every** text field must have both `Fr` (French) and `En` (English) versions. Translate naturally — don't word-for-word translate; adapt idioms and notation where appropriate. Use proper Unicode symbols (∠, △, ≅, ∥, °, →, ², ₁, etc.) — never use ASCII fallbacks like `triangle ABC` or `<=`.
- French uses « guillemets » or quotation marks; English uses "…".

### Options
- Each question has **exactly 4 options** (A, B, C, D).
- One is correct (set `correctIndex` to 0, 1, 2, or 3 — the position in the `options` array).
- The 3 distractors must be plausible — encode common misconceptions, not random wrong answers.

### Videos — read carefully
- **Browse the web** and find real YouTube videos before adding any. Each video object is `{ "label": "...", "url": "https://www.youtube.com/watch?v=REAL_ID" }`.
- Every URL **must be a real, working YouTube link you actually found** — open/verify it. The label should describe what the video covers (e.g. `"Khan Academy — Triangle angle sum 180°"`).
- **NEVER** output placeholder, guessed, or malformed URLs. Things like `https://www.youtube.com/watch?v=...`, `https://://...`, or invented video IDs will be **rejected** by the platform's validator and the whole upload fails.
- If web browsing is unavailable, or you cannot verify a real video for a given question, **omit the `videos` array** for that question. Zero videos is perfectly fine; a fake one is not.

### Optional fields
- `hintFr` / `hintEn` — short nudge shown under the question text. Use sparingly (1–2 questions per quiz).
- `diagramSvg` — if a small SVG diagram would help, provide it inline as a string. Use `viewBox="0 0 240 130"` and simple shapes. Most questions won't need one.
- `prelim` — at the quiz level, a GeoGebra / Desmos / Khan exercise URL to embed before the test.

---

## Step 3 — Output format

**Preferred:** save the quiz as a downloadable file named `quiz.json` and give the teacher a download link. The file's contents must be **only** the raw JSON object below — no markdown, no comments. (In ChatGPT, write the JSON to a file the user can download; in Claude, provide it as a downloadable `.json` artifact/file.)

**Fallback** (only if you cannot produce a downloadable file): reply with **ONLY the single JSON object** matching the schema below — no markdown fences, no preamble, no commentary — so the teacher can copy-paste it directly.

The teacher will either upload the `.json` file or paste the text on the platform's upload page.

---

## JSON SCHEMA

```jsonc
{
  "slug": "kebab-case-unique-slug",            // required, lowercase letters/digits/hyphens only
  "titleFr": "Titre du quiz en français",
  "titleEn": "Quiz title in English",
  "subjectSlug": "math",                       // one of: math | physics | chemistry | biology
  "gradeSlug": "8",                            // one of: 6 | 7 | 8 | 9 | 10 | 11 | 12

  // OPTIONAL preliminary activity (e.g. GeoGebra / Desmos link)
  "prelim": {
    "badgeFr": "Activité préliminaire",
    "badgeEn": "Preliminary activity",
    "titleFr": "Découverte interactive",
    "titleEn": "Interactive discovery",
    "descFr": "Activité GeoGebra — à faire avant le test.",
    "descEn": "GeoGebra activity — do this before the test.",
    "url": "https://www.geogebra.org/m/xxxxxxxx"
  },

  "parts": [
    {
      "titleFr": "Partie A — Prérequis",
      "titleEn": "Part A — Prerequisites",
      "subtitleFr": "Concepts fondamentaux",
      "subtitleEn": "Foundational concepts",
      "questions": [
        {
          "skillTag": "skill_short_key",       // required, snake_case
          "textFr": "Question en français ?",
          "textEn": "Question in English?",
          "hintFr": null,                      // optional
          "hintEn": null,
          "diagramSvg": null,                  // optional inline SVG string
          "correctIndex": 1,                   // 0-based position of the correct option
          "options": [
            { "textFr": "Option A FR", "textEn": "Option A EN" },
            { "textFr": "Option B FR", "textEn": "Option B EN" },
            { "textFr": "Option C FR", "textEn": "Option C EN" },
            { "textFr": "Option D FR", "textEn": "Option D EN" }
          ],
          "remediation": {
            "explanationFr": "Explication détaillée en <strong>français</strong> de la bonne réponse et de la mauvaise.",
            "explanationEn": "Detailed explanation in <strong>English</strong> of the correct answer and the misconception.",
            // OPTIONAL — 0 to 2 videos. Use ONLY real URLs you found by browsing
            // the web. The "watch?v=..." below is illustrative ONLY — replace with
            // real video IDs, or omit this "videos" key entirely.
            "videos": [
              { "label": "Khan Academy — Topic intro", "url": "https://www.youtube.com/watch?v=REAL_VIDEO_ID" }
            ],
            "followups": [
              {
                "textFr": "Suivi 1 FR",
                "textEn": "Follow-up 1 EN",
                "correctIndex": 2,
                "options": [
                  { "textFr": "A FR", "textEn": "A EN" },
                  { "textFr": "B FR", "textEn": "B EN" },
                  { "textFr": "C FR", "textEn": "C EN" },
                  { "textFr": "D FR", "textEn": "D EN" }
                ]
              },
              {
                "textFr": "Suivi 2 FR",
                "textEn": "Follow-up 2 EN",
                "correctIndex": 0,
                "options": [
                  { "textFr": "A FR", "textEn": "A EN" },
                  { "textFr": "B FR", "textEn": "B EN" },
                  { "textFr": "C FR", "textEn": "C EN" },
                  { "textFr": "D FR", "textEn": "D EN" }
                ]
              }
            ]
          }
        }
        // … more questions in this part …
      ]
    }
    // … more parts …
  ]
}
```

---

## Mini-example (one part, one question — abbreviated)

```json
{
  "slug": "newton-second-law-intro",
  "titleFr": "Deuxième loi de Newton — Introduction",
  "titleEn": "Newton's Second Law — Introduction",
  "subjectSlug": "physics",
  "gradeSlug": "10",
  "parts": [
    {
      "titleFr": "Partie A — Définition",
      "titleEn": "Part A — Definition",
      "subtitleFr": "Comprendre F = m·a",
      "subtitleEn": "Understanding F = m·a",
      "questions": [
        {
          "skillTag": "newton_second_law_def",
          "textFr": "La deuxième loi de Newton s'écrit :",
          "textEn": "Newton's second law is written:",
          "correctIndex": 1,
          "options": [
            { "textFr": "F = m / a", "textEn": "F = m / a" },
            { "textFr": "F = m · a", "textEn": "F = m · a" },
            { "textFr": "F = m + a", "textEn": "F = m + a" },
            { "textFr": "F = a / m", "textEn": "F = a / m" }
          ],
          "remediation": {
            "explanationFr": "La force <strong>F</strong> est le produit de la masse et de l'accélération : F = m·a. Unité SI : le Newton (N) = kg·m/s².",
            "explanationEn": "Force <strong>F</strong> equals mass times acceleration: F = m·a. SI unit: Newton (N) = kg·m/s².",
            "videos": [
              { "label": "Khan Academy — Newton's 2nd law", "url": "https://www.youtube.com/watch?v=ou9YMWlJgkE" }
            ],
            "followups": [
              {
                "textFr": "Si m = 2 kg et a = 3 m/s², que vaut F ?",
                "textEn": "If m = 2 kg and a = 3 m/s², what is F?",
                "correctIndex": 2,
                "options": [
                  { "textFr": "1 N", "textEn": "1 N" },
                  { "textFr": "5 N", "textEn": "5 N" },
                  { "textFr": "6 N", "textEn": "6 N" },
                  { "textFr": "9 N", "textEn": "9 N" }
                ]
              },
              {
                "textFr": "Unité SI de la force ?",
                "textEn": "SI unit of force?",
                "correctIndex": 0,
                "options": [
                  { "textFr": "Newton (N)", "textEn": "Newton (N)" },
                  { "textFr": "Joule (J)", "textEn": "Joule (J)" },
                  { "textFr": "Watt (W)", "textEn": "Watt (W)" },
                  { "textFr": "Pascal (Pa)", "textEn": "Pascal (Pa)" }
                ]
              }
            ]
          }
        }
      ]
    }
  ]
}
```

---

## Final reminders for the AI

- Deliver the quiz as a downloadable `quiz.json` **file** when possible; otherwise output **JSON only** (no markdown code fences, no "Here is the JSON:", no comments).
- All `correctIndex` values must be 0–3.
- Every question (main and follow-up) must have exactly 4 options.
- Every text field has both `Fr` and `En` variants.
- **Videos: only real, web-verified YouTube URLs. Never placeholders or guesses — omit the `videos` array if you can't verify a real link.**
- Use real Unicode for symbols: ∠ △ ≅ ∥ ° → ² ₁ ½ · α β π, etc.
