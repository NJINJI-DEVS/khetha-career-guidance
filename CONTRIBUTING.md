# Contributing to Khetha Career Guidance

Thanks for working on this. It's a hackathon-paced project with real government-facing content and
real learner data implications, so a few conventions exist specifically to stop bugs and risks that have
already cost us time once — please read this before your first PR.

---

## Table of contents

- [Getting set up](#getting-set-up)
- [Branching and commits](#branching-and-commits)
- [Pull requests](#pull-requests)
- [Frontend conventions](#frontend-conventions)
- [Backend conventions](#backend-conventions)
- [Security — non-negotiable](#security--non-negotiable)
- [Translation workflow](#translation-workflow)
- [Testing expectations](#testing-expectations)
- [Adding data](#adding-data)

---

## Getting set up

```bash
git clone https://github.com/<org-or-user>/khetha-career-guidance.git
cd khetha-career-guidance
npm install
cp .env.example .env.local   # fill in local values, never commit this file
npm run dev
```

Backend setup lives in its own project — see that repo/folder's own instructions. You'll need both
running locally for anything that touches auth, mentor workflows, or persistence.

---

## Branching and commits

- Branch off `main` as `feature/<short-description>`, `fix/<short-description>`, or
  `chore/<short-description>`.
- Commit messages: short imperative summary line (`Add APS what-if slider`), body only if the "why" isn't
  obvious from the diff.
- Keep PRs scoped to one concern. A PR that touches the risk-flag engine and also reworks the colour
  palette is two PRs.

## Pull requests

- Describe **what changed and why**, not just what — reviewers can read the diff.
- If you touched anything under `engines/` (APS, eligibility, RIASEC, job fit, risk flags), state what you
  verified it against (a known input/output pair, a demo profile, etc.) — these are scoring engines, not
  UI, and a silent regression there is a wrong answer given to a real learner.
- If you touched translated strings, note which languages you did **not** get to update (see
  [Translation workflow](#translation-workflow)) — a partial update should never silently look complete.

---

## Frontend conventions

**Never use Tailwind arbitrary colour values** (`bg-[#005A36]`, `text-[#00784A]`, etc.). These require a
JIT compiler; in some preview/build environments they silently resolve to nothing, leaving white text on
an unpainted white surface. This has already cost three separate rounds of "I can't see the text"
debugging. Instead:

- Use the real CSS classes emitted by the injected stylesheet (`k-bg-*`, `k-tx-*`, `k-bd-*`, `k-rg-*`,
  `k-ac-*`) for brand colours.
- Use `.k-dis` for disabled states rather than relying on Tailwind's `disabled:` variant being compiled.
- To change a brand colour, edit the `THEME` constant and the rule-generation logic that emits the `k-*`
  classes — not hex codes scattered through markup.

**Check contrast before merging anything with new text-on-colour combinations.** Body text sits at
slate-600 or darker (contrast ratio ≥ 7:1 against white). Surfaces carrying white text use the darker
brand green (`#005A36`); the lighter green is for rules and icons only, never for text backgrounds.
Slate-400 has been used by mistake before (2.56:1, fails WCAG) — don't reintroduce it.

**Hooks only, no state library.** Keep state in the existing `session` / `profile` / `settings` /
`notifications` shape rather than introducing Redux, Zustand, etc. If the state tree is genuinely
outgrowing this, raise it as its own discussion, not inside a feature PR.

**Respect the routing convention.** `tab` drives bottom-nav destinations, `route` is the full-screen
overlay. Use the existing `go()` helper (prefixed targets: `tab:`, `explore:`, `field:`, `advice:`) rather
than reaching into shell state directly from a leaf component.

---

## Backend conventions

- **The frontend never talks to Supabase directly for anything sensitive.** All reads/writes of personal
  data, mentor verification, or anything the risk-flag/redaction engines touch go through the ASP.NET Core
  API. If you're adding an endpoint that just proxies Supabase with no authorisation or validation layer,
  that's a sign the logic belongs in the engine layer, not a passthrough.
- Every mentor/admin endpoint must enforce role checks **server-side**. A frontend that hides a button is
  not an access control.
- New endpoints that touch personal information need: input validation, a role check, and an audit-log
  entry for anything a judge or a real deployment would call a "governance" action (approvals, exports,
  deletions, flag overrides).

---

## Security — non-negotiable

- **No secrets in code, ever.** No API keys, connection strings, or service-role keys in source files,
  commit history, or PR descriptions. If a secret was ever committed, rotate it — don't just delete the
  file in a follow-up commit.
- The Supabase **anon key** is the only Supabase key allowed in the frontend, and only on tables with Row
  Level Security enabled and tested as if the caller were hostile.
- The Supabase **service-role key** lives only in the backend's secret store (Key Vault / Secrets Manager /
  equivalent), referenced via environment variables, never committed — see `.gitignore`.
- Don't disable RLS "temporarily to test something" on a branch that could get merged. If you need to
  bypass it locally, do it through the backend with the service key, not by turning off RLS.

---

## Translation workflow

- The UI catalogue is translated at **build time** via `scripts/translate-with-gemini.mjs`, never at
  runtime. Don't add runtime translation calls — they break offline use, add latency, and cost money per
  view.
- The glossary terms (**APS, NQF, NSFAS, TVET, Pure Mathematics**, and others in the script's glossary list)
  stay in English inside every translated sentence, because that's what's printed on the actual application
  forms learners fill in. If you add a new glossary-sensitive term, add it to the script's glossary list,
  not just the English string.
- Run the script's `--review` mode before merging any new or changed strings — it flags lost placeholders,
  over-long translations that would break button layouts, and glossary terms that got translated anyway.
- isiZulu, Setswana, isiXhosa and Sesotho strings are a first draft pending native-speaker sign-off.
  Afrikaans is further along. Don't treat any of the four as final without that review.

---

## Testing expectations

- Every screen-affecting change should be verified by rendering the screen, not just eyeballing a diff.
  The existing suite covers all tabs, all four roles, both demo profiles, all six languages, all three
  viewports, high contrast at largest text size, and a fully completed learner journey — extend it rather
  than working around it.
- Changes to `engines/` (APS, eligibility, subject chooser, RIASEC, job fit, risk flags) need a
  before/after check against a known input, since these produce the numbers a real learner or mentor would
  act on.
- Don't change the demo credentials (`204815`, partner codes) without updating the README and telling
  whoever's running the next demo.

---

## Adding data

Course, provider and event data in this repository is illustrative. If you add or edit a qualification,
provider, or occupation entry:

- Note in the PR whether the data is real (verified against the institution's prospectus/NCAP) or
  illustrative — don't let the two blend silently.
- Keep the cross-linking intact: occupations link to qualifications via `quals[]`; qualifications link to
  providers via `providerId`. An orphaned reference breaks the directory cross-navigation.
