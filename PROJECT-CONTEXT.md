# Njinji Career Guidance — Project Context (Backend + Frontend)

**Repo:** github.com/NJINJI-DEVS/khetha-career-guidance
**Challenge:** DHET "Khetha NCAP" — GovTech Hackathon 2026 (SITA)
**Owner:** Mandla / Tshepo Sekete — Njinjicom
**Last updated:** this session, following the backend+frontend merge

This file exists so you (or anyone else) can pick this project up in VS Code without
needing the chat history. It supersedes the earlier `PROJECT-CONTEXT.md` versions,
which described the frontend-only, artifact-preview stage of the project — a lot has
changed since then, most importantly: a real backend now exists, and the frontend has
been ported out of the single-file preview into a real Vite project.

---

## 1. What this is

A mobile-first PWA reimagining DHET's National Career Advice Portal (NCAP) for the
GovTech 2026 hackathon. Full feature scope (subject chooser, career/job-fit
questionnaires, three directories, mentor network, admin safeguarding, offline
access, six languages) is documented in `README.md`. This file is about **current
technical state and what to do next**, not the product spec.

### Judging criteria this is being built against

| Criterion | Weight |
|---|---|
| Relevance to challenge statement | 20% |
| Innovation & emerging tech | 15% |
| Technical feasibility & functionality | 20% |
| UX, accessibility, inclusivity | 10% |
| Data & insight generation | 10% |
| Security, governance, responsible tech | 10% |
| Scalability, sustainability, digital sovereignty | 10% |
| Presentation & demonstration | 5% |

Technical feasibility + digital sovereignty (30% combined) are why the architecture
decisions below leaned toward "own, reviewable infrastructure" over a third-party
app-builder — see §3.

---

## 2. Repo layout (current, as of this zip)

```
khetha-career-guidance/
├─ backend/                      # ASP.NET Core Web API (folder renamed from CareerAdvisor.Api;
│                                 # internal project/namespace is still CareerAdvisor.Api — only
│                                 # the containing folder changed)
│  ├─ Controllers/
│  │  ├─ ApsController.cs        # POST /api/aps/calculate
│  │  ├─ CoursesController.cs    # POST /api/courses/match, GET /api/courses
│  │  ├─ MatriculantsController.cs  # GET/POST /api/matriculants(/me), [Authorize]
│  │  └─ QualificationsController.cs # GET /api/qualifications/saqa|ofo
│  ├─ Data/AppDbContext.cs       # EF Core, snake_case tables, Npgsql → Supabase Postgres
│  ├─ Models/                    # Matriculant, MatriculantSubject, University, Course,
│  │                              # CourseSubjectRequirement, OfoCode, SaqaQualification, DataSyncLog
│  ├─ DTOs/ApsDtos.cs
│  ├─ Services/
│  │  ├─ ApsCalculatorService.cs      # NSC 7-point scale — FIXED this session, see §5
│  │  ├─ CourseMatchingService.cs
│  │  ├─ ReferenceDataImportServices.cs  # OFO + SAQA batch importers (both are periodic
│  │  │                                    exports, not live APIs — by design)
│  │  └─ GovernmentPortalScraperService.cs  # scaffold only, not wired up yet
│  ├─ Program.cs                 # validates Supabase-issued JWTs; issues none of its own
│  ├─ appsettings.json           # placeholders only, safe to commit
│  └─ CareerAdvisor.Api.csproj
├─ frontend/                     # Vite + React (ported from the single-file preview build)
│  ├─ src/
│  │  ├─ App.jsx                 # the whole app — one component, ~6,400 lines (intentional,
│  │  │                            see README's note on why this isn't split up yet)
│  │  ├─ main.jsx
│  │  ├─ index.css               # Tailwind directives
│  │  └─ lib/
│  │     ├─ supabaseClient.js    # Supabase Auth client (needs real env vars — see §6)
│  │     └─ api.js               # fetch wrapper; attaches Supabase JWT as Bearer header
│  ├─ .env.example               # copy to .env.local, fill in real values
│  ├─ package.json, vite.config.js, tailwind.config.js, postcss.config.js, index.html
├─ package.json                  # root — `npm run dev` runs backend + frontend together
├─ .gitignore                    # Node + .NET + Supabase + secrets — see §5 for what it fixes
├─ README.md                     # product spec + setup instructions
├─ SETUP.md                      # narrower setup/verification walkthrough
├─ CONTRIBUTING.md               # team conventions (Tailwind rule, translation glossary, etc.)
├─ LICENSE                       # MIT + carve-out for DHET coat of arms / NCAP content
└─ FIXES.md                      # tracked backend fixes (APS scale correction)
```

---

## 3. Architecture — how we got here (decision log)

Worth knowing this history so nobody re-litigates it or gets confused by earlier
chat/doc references to a different plan:

1. **First considered:** connect the project to Lovable and let it manage a Supabase
   backend end-to-end. Rejected because: Lovable's "backend" is Supabase provisioned
   *through* Lovable's own AI-agent-edited project — no real connector for hosting our
   own arbitrary backend, no version-controlled migration history, unclear data
   region, and a weaker "digital sovereignty" story for judging criterion 7.
2. **Then considered:** replace the ASP.NET Core plan entirely with pure Supabase +
   Row Level Security, business logic in Postgres/Edge Functions. This was the plan
   *before* we discovered an ASP.NET Core backend already existed in the repo.
3. **What we found, and what we're actually doing:** the existing `backend/` project
   already implements a coherent hybrid — **Supabase owns Auth and Postgres hosting;
   ASP.NET Core owns business logic and data access**, validating Supabase-issued JWTs
   rather than minting its own. This is better than either extreme above (real
   reviewable server-side logic, version-controlled EF Core migrations, and Supabase's
   managed Postgres/Auth without giving up backend ownership). **This is the current
   and intended architecture** — new features (mentor hub, redaction, risk-flagging,
   audit log) should be built as EF Core models + C# controllers/services in
   `backend/`, **not** as Supabase Edge Functions, despite earlier chat discussion
   assuming Edge Functions before this backend was found.

### The auth flow, concretely

```
Frontend (React, via supabase-js)
   │  1. supabase.auth.signInWith...() → Supabase Auth
   │  2. gets back a JWT (access_token)
   ▼
apiFetch() in frontend/src/lib/api.js
   │  3. attaches Authorization: Bearer <token> to every backend request
   ▼
ASP.NET Core (backend/Program.cs)
   │  4. validates the JWT against Supabase's JWT secret (no login endpoint of its own)
   ▼
EF Core → Supabase Postgres (direct connection, Npgsql)
```

**Important nuance:** the backend's Postgres connection string uses the `postgres`
role directly (see `appsettings.json`'s `ConnectionStrings:Supabase`), which is a
Postgres **superuser** and therefore **bypasses Row Level Security** regardless of any
policies defined. This means: **authorization currently depends entirely on the C#
controllers checking ownership correctly** (e.g. `MatriculantsController` scoping
every query to the JWT's `sub` claim) — not on RLS. RLS is still worth adding as
defense-in-depth for any future case where the frontend queries Supabase directly
(e.g. Realtime subscriptions), but it is not currently the enforcement boundary.

---

## 4. What's built vs. not built

**Built (backend):** learner profile + subjects (`Matriculant`), universities/courses/
subject requirements, OFO/SAQA reference data (batch-imported), APS calculator,
course matcher.

**Built (frontend):** the full app as ported from the preview build — all screens,
engines (RIASEC, job fit, subject chooser, eligibility), six-language i18n, four
roles, mentor hub UI, admin UI, responsive layouts. **Note:** the frontend's mentor
hub / admin / messaging screens are currently working against the app's own in-memory
mock state, not the backend — there is no backend support for any of that yet (see
next section).

**Not built (backend) — next major chunk of work:**
- Mentor applications + verification + the risk-flag engine (Luhn ID check,
  disposable-email detection, registration-number shape checks, duplicate-submission
  detection)
- Help requests (learner ↔ mentor)
- Messages, with **server-side redaction on send** (phone numbers, emails, links,
  handles stripped before the row is ever persisted — this must happen in the C#
  service layer, since a client-side-only redaction can be bypassed by a modified
  client)
- Admin approval workflow + audit log
- Notifications
- SMS summary generation endpoint
- Auth endpoints — **not needed**, Supabase Auth handles this; the backend only
  validates tokens

**Not built (frontend):**
- Real Supabase Auth wiring — `AuthScreen` still mocks Google/Apple/email/phone/OTP.
  Draft code for the real `supabase.auth.signInWithOtp` / `signInWithOAuth` calls was
  written in chat but not yet applied to `App.jsx`.
- Custom two-step verification — Supabase's phone OTP is a real second factor for
  phone sign-in, but Google/Apple/email sign-in would need a custom second step built
  on top; Supabase doesn't provide this for free.
- Wiring the existing screens (APS calculator, course directories, learner profile) to
  the real backend endpoints via `frontend/src/lib/api.js` — the api.js wrapper
  functions exist and match the backend's actual endpoints, but `App.jsx` itself
  still needs its internal state/handlers updated to call them instead of local mock
  logic.
- The PWA layer — `manifest.webmanifest` and `service-worker.js` don't exist yet.
  These need a real hosting origin to test properly (they won't register correctly
  inside any sandboxed preview).

---

## 5. Fixes already applied in this delivered structure

Don't redo these — they're already in the zip:

1. **APS scale bug** (`backend/Services/ApsCalculatorService.cs`) — the band table was
   shifted one level above the real NSC achievement scale (used `90–100 → 7` instead
   of the correct `80–100 → 7`, etc.), understating every learner's APS by up to
   several points across six subjects. Corrected to the real NSC bands.
2. **Build artifacts were committed to git** — `bin/`, `obj/` (141 files, ~32MB) and a
   `.vs/` folder (Visual Studio's local cache, separate from `.vscode/`) had no
   `.gitignore` to stop them. A proper root `.gitignore` now exists; when you commit
   this structure, also run `git rm -r --cached` on any of these that are still
   tracked in your local working copy before committing, or the old tracked copies
   will linger.
3. **A stray empty folder** (`backend/khetha-career-guidance/`, an accidental nested
   folder with the same name as the repo) was removed.
4. **Folder renamed** `CareerAdvisor.Api/` → `backend/` for a cleaner, parallel
   structure next to `frontend/`. The `.csproj` file name and C# namespace are
   untouched — only the containing folder changed — so nothing in the code needed
   editing.
5. **Placeholder port corrected** — docs previously guessed `http://localhost:5000`
   for the backend; the real port from `launchSettings.json` is `56878` (http) /
   `56877` (https). `.env.example` and the docs now use the real one.

---

## 6. What you need to fill in yourself (can't be done from this side)

- **Create the actual Supabase project** (supabase.com or via CLI) and decide on a
  region — check whether Cape Town is available; this matters for the POPIA
  data-residency question that's been open since early in this project.
- **Real env values:**
  - `frontend/.env.local` (copy from `.env.example`): `VITE_SUPABASE_URL`,
    `VITE_SUPABASE_ANON_KEY`
  - `backend/appsettings.Development.json` (create it — it's gitignored):
    `ConnectionStrings:Supabase` (with the real password) and `Supabase:JwtSecret`
    (from Supabase dashboard → Project Settings → API)
- **Configure Supabase Auth providers** (Google/Apple OAuth, phone OTP via an SMS
  provider) in the Supabase dashboard before the real sign-in wiring can be tested.
- **Push this structure to GitHub** — this zip hasn't been committed anywhere yet.

---

## 7. Recommended next steps, in order

1. Unzip this over (or diff it against) your local working copy, resolve any
   conflicts, commit, and push.
2. Create the Supabase project, fill in the env values above, and confirm the
   frontend ↔ backend ↔ Supabase auth chain actually works end to end (see the
   verification checklist in `SETUP.md`).
3. Wire the frontend's `AuthScreen` to real `supabase.auth` calls (pattern already
   drafted in chat — ask for it again if needed, it wasn't applied to `App.jsx` yet).
4. Design and add the EF Core models + migration for the mentor hub (help requests,
   messages with redaction, audit log, notifications) in `backend/`.
5. Wire the frontend's mentor hub / admin screens to those new endpoints, replacing
   the current in-memory mock state.
6. Build the PWA layer (`manifest.webmanifest`, `service-worker.js`) once there's a
   real hosting target to test against.
7. Revisit the AI Advisor — currently scripted keyword-matching, which is the biggest
   gap against judging criterion 2 (innovation/emerging tech, 15%).

---

## 8. Demo credentials (unchanged)

- Two-step verification code: `204815`
- Partner access codes: `IKAMVA-2027`, `KUTL-2027`, `SRC-PEER-2027`, `TVET-SRC-2027`

These are frontend-mock values today: they'll need real equivalents once the auth
flow is wired to actual Supabase Auth + a real partner-code check.
