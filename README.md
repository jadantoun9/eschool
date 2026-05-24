# e-school

Multi-choice quiz platform with per-question remediation (explanation, video, follow-up questions), inspired by the included `sas_mastery_final.html` reference.

- **Frontend + backend**: Next.js 15 (App Router, TypeScript) — single app
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth (Auth.js) credentials for teachers; students need no login
- **Math**: MathJax via `better-react-mathjax`

## Architecture at a glance

- Students open a public URL `/q/<slug>` (no login). Their submission is graded server-side; corrections — including remediation videos and follow-up questions — come back in the response.
- Teachers log in at `/admin`, build quizzes with a structured form, and see per-student results plus per-skill bars.
- One Next.js app, role-based routes:
  - `/q/[slug]` student quiz
  - `/admin/*` teacher dashboard (auth-protected)
  - `/api/public/*` student-facing endpoints
  - `/api/*` teacher-facing endpoints

## Local development

### 1. Install Node + Postgres

You need Node 20+ and Postgres 14+.

**Postgres options on macOS:**
- Docker (recommended): `docker compose up -d` (uses `docker-compose.yml`)
- Homebrew: `brew install postgresql@16 && brew services start postgresql@16 && createdb eschool`

### 2. Configure env

```bash
cp .env.example .env
# Edit .env: set DATABASE_URL, NEXTAUTH_SECRET, and super-admin creds.
```

Generate a `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Install + migrate + seed

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
```

The seed prints the super-admin email/password and a sample quiz URL.

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

- Student view of the sample quiz: see the URL printed by the seed
- Teacher login: `/admin/login` with the super-admin credentials

## Production / VPS deploy

This is a standard Next.js app — deploy any way you like. A simple VPS setup:

1. **Provision**: Ubuntu 22.04, install Node 20 (via nvm or NodeSource), Postgres 16, and Nginx.
2. **Postgres**: `sudo -u postgres createuser -P eschool && sudo -u postgres createdb -O eschool eschool`. Set `DATABASE_URL` in `.env.production`.
3. **Build**:
   ```bash
   git clone <your-repo> /var/www/eschool && cd /var/www/eschool
   npm ci
   npx prisma migrate deploy
   npm run db:seed     # only on first deploy
   npm run build
   ```
4. **Process manager**: PM2 (`pm2 start npm --name eschool -- start`) or a systemd unit running `npm start`. App listens on `:3000` by default.
5. **Nginx** reverse-proxies `:443` → `:3000`; terminate TLS with Let's Encrypt (`certbot`).
6. **Backups**: `pg_dump eschool > /backups/eschool-$(date +%F).sql` in a daily cron.

## Key files

```
prisma/
  schema.prisma              # data model (Teacher, Subject, Grade, Quiz,
                             #  Question + self-relation for follow-ups,
                             #  Option, Remediation, Submission, Answer)
  seed.ts                    # creates super-admin + sample SAS quiz

src/app/
  q/[slug]/                  # student quiz page (server + client component)
  admin/                     # teacher dashboard
    quizzes/new              # create quiz form
    quizzes/[id]/edit        # quiz builder (questions + options + remediation
                             #  + follow-ups, all in one form)
    quizzes/[id]/results     # per-student table + per-skill bars
    quizzes/[id]/share       # copy student link
    subjects                 # manage subjects + grades
    teachers                 # super-admin only: invite teachers
    accept-invite            # invited teachers set their password here
  api/
    auth/[...nextauth]       # NextAuth handler
    public/quiz/[slug]       # GET quiz (no isCorrect leaked)
    public/submit            # POST submission (server-side grading)
    quizzes                  # POST create, PATCH/DELETE [id], PUT [id]/questions
    subjects, grades         # CRUD for taxonomy
    teachers/invite          # super-admin only

src/lib/
  prisma.ts                  # Prisma singleton
  auth.ts                    # NextAuth config (credentials + JWT session)
  grading.ts                 # pure function: questions + answers → corrections
  slug.ts                    # nanoid generator for /q/<slug>

src/types/quiz.ts            # Zod schemas shared by client + server
```

## Data model notes

- A **follow-up question** is just a `Question` with a `parentId`. App logic
  enforces max nesting depth of 1 (no follow-up of a follow-up); the schema
  itself does not.
- Every `Question` has 2–6 `Option`s; exactly one is marked `isCorrect`. This
  invariant is checked by the bulk-save API.
- `Submission` and `Answer` are persisted on every student submit. Follow-up
  answers are stored as additional `Answer` rows but do **not** count toward
  the score (they're remediation, not assessment).

## Things deliberately deferred (post-MVP)

- Email sending for invites (super-admin currently copies the link manually).
- Rate limiting on `/api/public/submit`.
- CSV export of results.
- Image / file uploads (you can use image URLs in question text today).
- Student progress tracked across multiple quizzes.

## Teacher quick-start

1. Sign in at `/admin/login`.
2. **Matières** → add your subject(s); **Niveaux** → add your grades.
3. **Nouvelle fiche** → pick subject + grade + title.
4. On the editor: add questions; for each question, fill the 4 options, mark
   the correct one, write the explanation. Optionally add a remediation block
   (videos + follow-up question) shown to students who answer wrong.
5. Tick **Publié**, save, then **Partager** to copy the student link.
6. **Résultats** shows incoming submissions and per-skill bars (uses each
   question's `skillTag`).
