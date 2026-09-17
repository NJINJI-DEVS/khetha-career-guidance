# Njinji Career Guidance

**A mobile-first PWA reimagining of South Africa's National Career Advice Portal (NCAP)**
Entry for the DHET *"Khetha NCAP: Your Career Guidance Companion, On the Go"* challenge — GovTech Hackathon 2026

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-utility--first-06B6D4?logo=tailwindcss&logoColor=white)
![C#](https://img.shields.io/badge/Backend-ASP.NET_Core-512BD4?logo=csharp&logoColor=white)
![Supabase](https://img.shields.io/badge/Data-Supabase%2FPostgres-3ECF8E?logo=supabase&logoColor=white)
![Status](https://img.shields.io/badge/status-hackathon_prototype-yellow)

---

## What this is

DHET's Khetha Career Development Services runs the [National Career Advice Portal](https://ncap.careerhelp.org.za/)
(NCAP) — a trusted, content-rich resource that exists today only as a desktop-oriented website. The
challenge asks entrants to go beyond shrinking that site onto a phone: to reimagine it as something
mobile-first youth actually reach for, with personalisation, offline access, accessibility and engagement
built in from the start.

**Njinji Career Guidance** carries NCAP's information architecture, tools and trusted-source content onto
mobile, adds assessment instruments that genuinely score (not just decorative sliders), and wraps it in a
mentor network, admin safeguarding layer, and offline-first architecture — all under the official DHET and
Khetha identity.

> This repository holds the frontend PWA. The backend (ASP.NET Core Web API + Supabase/Postgres) is
> developed alongside it — see [Backend](#backend) below for the current split and status.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Backend](#backend)
- [Security & compliance](#security--compliance)
- [Getting started](#getting-started)
- [Demo credentials](#demo-credentials)
- [Project structure](#project-structure)
- [Known limitations](#known-limitations--open-items)
- [Judging criteria alignment](#judging-criteria-alignment)
- [License](#license)

---

## Features

### For learners
- **Six-step guided journey** — Subjects → Interests → Job Fit → APS → Shortlist → Mentor
- **Subject Chooser** — Grade 9 marks + interests → ranked Grade 10 subject packages with per-subject gate checks
- **Career Choice questionnaire** — RIASEC/Holland model (the same model NCAP's own instrument uses)
- **Job Fit questionnaire** — work-context distance matching across five axes
- **APS calculator** — real NSC banding, live qualifying-course counter, what-if sliders
- **Three NCAP directories** — Careers (with OFO codes), What to Study, Where to Study
- **Advice directory** — Khetha helpline, WhatsApp, Please Call Me, events, FAQs
- **AI Advisor** — six-language chat assistant
- **SMS summary generator** — the full plan as a ~4-segment plain-text SMS for zero-data access

### Mentor network and safeguarding
- Verification badges: `ID Verified`, `Degree Verified`, `NGO Vetted`
- Structured help-request letters with marks and APS attached automatically
- Recommendation letters with configurable honesty levels and a reference number
- **Message redaction on send** — phone numbers, emails, links, social handles and platform names are
  stripped before delivery
- **Admin approval gate** — no mentor is visible to learners until approved; an automated risk-flag engine
  scores applications (SA ID Luhn validation, disposable-email detection, registration-number shape checks,
  duplicate-submission detection) with a documented "what to watch out for" guide that also states what is
  *not* evidence of fraud, to avoid laundering bias into rejections

### Inclusivity
- **Six languages** — English, isiZulu, Setswana, Afrikaans, isiXhosa, Sesotho — with English fallback per key
- **Three responsive layouts** (mobile / tablet / desktop) from one state tree, plus an auto mode
- **Accessibility** — high contrast, reduced motion, adjustable text size, plain-language mode, contrast-checked palette
- **Offline-first** — IndexedDB with localStorage fallback, downloadable content packs, install prompt, offline centre

### Admin
- Grade split, provincial reach, APS distribution, gateway bottlenecks, top careers, mentor operations,
  verification mix, and an aspiration-vs-eligibility panel

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React (hooks only, no state library), Tailwind CSS, `lucide-react` |
| PWA | Web App Manifest + Service Worker (app-shell caching, offline content packs) |
| Backend | ASP.NET Core Web API |
| Data / Auth / Storage | Supabase (Postgres, Auth, Storage), accessed **only** through the backend |
| Translation pipeline | Build-time translation via the Gemini API (`translate-with-gemini.mjs`), never at runtime |
| Hosting (target) | Region TBC — evaluating Cape Town/Johannesburg options for data-residency reasons (see [Security & compliance](#security--compliance)) |

No other runtime dependencies. Brand assets (DHET coat of arms, Khetha wordmark) are inlined as base64 so
the frontend needs no separate asset pipeline.

---

## Architecture

```
Learner / Mentor / Admin (PWA, installed or in-browser)
        │
        │  HTTPS, short-lived JWT
        ▼
ASP.NET Core Web API  ── owns all business logic:
        │                 risk-flag engine, redaction rules,
        │                 mentor approval workflow, APS/eligibility
        │                 scoring, SMS generation
        ▼
Supabase (Postgres + Auth + Storage)
        — accessed only with the service-role key, server-side.
          The frontend never holds anything but a public anon key,
          and only where Row Level Security makes that safe.
```

Frontend responsibilities: rendering, client-side questionnaire scoring for instant feedback, offline cache,
and calling the API for anything that must be authoritative, persisted or protected.

Backend responsibilities: authentication and session issuance, authorisation on every mentor/admin action,
the risk-flag and redaction engines as the source of truth, and all reads/writes against Supabase.

---

## Backend

The API is developed as a companion service to this frontend. Current status: **some endpoints exist**
(authentication and a couple of resource endpoints); the rest of the surface below is in progress.

Planned endpoint groups:

- `POST /api/auth/*` — sign-in, OTP verification, session issuance
- `GET/PUT /api/profile` — the learner's persisted journey (favourites, questionnaire results, subject choices)
- `GET/POST /api/mentors/*` — mentor applications, verification status, help requests
- `POST /api/admin/approvals/*` — the approval queue and risk-flag verdicts
- `GET /api/directories/*` — careers, qualifications, providers (backing the three NCAP directories)
- `POST /api/sms-summary` — server-side generation of the SMS plan text

Key design rule: **the browser never talks to Supabase directly for anything sensitive.** OAuth
redirects may touch Supabase Auth directly, but the resulting token exchange, and every read/write of
personal or mentor-verification data, goes through this API so authorisation and redaction can be enforced
server-side rather than trusted to the client.

---

## Security & compliance

This is a hackathon prototype, not a certified system — the points below describe engineering intent, not
a compliance attestation. Legal review is required before any public or production use.

- **No API keys in the frontend.** The Supabase service-role key lives only in the backend's secret store
  (Key Vault / Secrets Manager / equivalent) — never in `appsettings.json`, never committed, never shipped
  to the browser. Any Supabase key the frontend does hold is the public anon key, and only on tables with
  Row Level Security enabled and tested.
- **POPIA / data residency.** Personal information (ID numbers, marks, contact details) should be hosted in
  a South African region where possible (e.g. AWS `af-south-1`, Azure South Africa North/West). Where data
  must leave SA, the cross-border transfer justification should be documented, per POPIA s72.
- **Encryption.** TLS in transit; sensitive columns (ID numbers, assessment results) encrypted at rest.
- **RBAC.** Every mentor/admin endpoint enforces role checks server-side — the frontend hiding a button is
  not an authorisation control.
- **Audit logging.** Mentor approvals, risk-flag triggers, and consent/export/delete actions are logged for
  accountability.
- **Consent management.** Granular consent gate at sign-up; users can export or delete their data from the
  app.
- **Rate limiting and input validation** on all public-facing endpoints, especially authentication.

---

## Getting started

> The frontend currently exists as a single self-contained component for rapid prototyping and demo
> purposes. Migrating it into a proper Vite project (with `vite-plugin-pwa` for production-grade service
> worker generation) is tracked in [Known limitations](#known-limitations--open-items).

```bash
# clone
git clone https://github.com/<org-or-user>/njinji-career-guidance.git
cd njinji-career-guidance

# install
npm install

# run locally
npm run dev
```

### Environment variables

Create a `.env.local` (frontend) and the backend's own secrets configuration. Never commit either.

```
# Frontend — public values only
VITE_API_BASE_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Backend — private, server-side only (example names; align to your actual config provider)
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_CONNECTION_STRING=
JWT_SIGNING_KEY=
GEMINI_API_KEY=   # build-time translation script only, never shipped to the client
```

---

## Demo credentials

For judging/demo purposes only — replace before any public deployment.

- Two-step verification code: `204815`
- Partner access codes: `IKAMVA-2027`, `KUTL-2027`, `SRC-PEER-2027`, `TVET-SRC-2027`

---

## Project structure

```
├─ src/
│  ├─ theme/            # palette + i18n catalogue (six languages, English-fallback)
│  ├─ data/              # occupations, qualifications, providers, events, mentors, demo profiles
│  ├─ engines/           # APS scoring, eligibility, subject chooser, RIASEC, job fit, risk flags
│  ├─ components/        # shared UI primitives
│  ├─ auth/              # role selection, verification, sign-in
│  └─ screens/           # dashboard, tools, directories, mentor hub, workspace, approvals, analytics
├─ scripts/
│  └─ translate-with-gemini.mjs   # build-time translation of the UI catalogue
├─ public/
│  ├─ manifest.webmanifest
│  └─ service-worker.js
└─ README.md
```

---

## Known limitations / open items

Naming these here rather than waiting for a judge to find them:

1. **AI Advisor is currently scripted**, not backed by a live model — upgrading it to a real,
   profile-aware assistant is the highest-leverage remaining innovation item.
2. **Translation needs native-speaker sign-off.** isiZulu, Setswana, isiXhosa and Sesotho are a strong
   first draft; Afrikaans is further along. Directory and questionnaire content is still English-only.
3. **Admin analytics are seeded**, not wired to live data yet — clearly labelled as illustrative for judging.
4. **Service worker asset list is currently manual.** A Vite build produces hashed filenames that won't
   match by hand — `vite-plugin-pwa` is the intended fix.
5. **Course, provider and event data is illustrative.** APS minimums and closing dates must be verified
   against each institution's prospectus before anyone relies on them.
6. **Coat of arms usage.** DHET has rules on third-party use of the state emblem — confirm permission
   before any public deployment.
7. **No live NCAP API integration yet.** The connection panel demonstrates the intended sync/endpoint
   design; there is no live link behind it today.

---

## Judging criteria alignment

Mapped against the GovTech 2026 adjudication criteria, for the team's own tracking:

| Criterion | Weight | Primary evidence in this repo |
|---|---|---|
| Relevance to challenge statement | 20% | Full mandatory-requirement coverage — see [Features](#features) |
| Innovation & emerging tech | 15% | RIASEC/job-fit engines, risk-flag engine; AI Advisor upgrade in progress |
| Technical feasibility & functionality | 20% | PWA (installable, offline-capable), ASP.NET Core API, Supabase-backed persistence |
| UX, accessibility, inclusivity | 10% | Six languages, three responsive layouts, contrast-checked palette |
| Data & insight generation | 10% | APS/eligibility/RIASEC scoring engines; admin analytics (seeded, labelled) |
| Security, governance, responsible tech | 10% | RBAC, redaction, consent gate, audit logging, no client-side secrets |
| Scalability, sustainability, digital sovereignty | 10% | SA-region hosting target, open web standards, ASP.NET Core + Postgres (no vendor lock-in) |
| Presentation & demonstration | 5% | See demo script (internal project docs) |

---

## License

TBD — add a license before making this repository public, if it isn't already decided.

## Acknowledgements

Built for DHET's Khetha Career Development Services and the GovTech 2026 Hackathon (SITA SOC Ltd).
NCAP is the property of the Department of Higher Education and Training; this project is a hackathon
prototype and is not an official DHET product.
