# Backend + frontend setup

This project has two parts, meant to be run together:

```
khetha-career-guidance/
├─ backend/               ← ASP.NET Core API (Supabase Postgres via EF Core/Npgsql)
├─ frontend/              ← Vite + React app
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ tailwind.config.js
│  ├─ postcss.config.js
│  ├─ index.html
│  ├─ .env.example
│  └─ src/
│     ├─ main.jsx
│     ├─ App.jsx          ← the full app, ported from the preview build
│     ├─ index.css
│     └─ lib/
│        ├─ supabaseClient.js
│        └─ api.js
├─ package.json           ← root — runs both dev servers together
└─ SETUP.md               ← this file
```

## What changed in App.jsx vs. the preview build

The preview build (the single self-contained HTML file) loaded React, Tailwind and
lucide-react as CDN `<script>` tags and transpiled JSX in the browser via Babel
Standalone — that's what let it run inside the Claude artifact sandbox, which has no
build step of its own. A real Vite project has an actual build step, so:

- `const { useState, ... } = React;` → `import React, { useState, ... } from 'react';`
- `const { Home, ... } = window.__ICONS__;` → `import { Home, ... } from 'lucide-react';`
- The manual `ReactDOM.createRoot(...).render(...)` at the bottom moved into
  `main.jsx`, and the component now has a real `export default`.

Nothing about the app's actual logic, screens, data, or behaviour changed — this was
a mechanical port, not a rewrite. Everything else (the 6,000+ lines of screens,
engines, translations, the `a11yCss` injected stylesheet) is untouched.

## First-time setup

```bash
cd khetha-career-guidance

# install root tooling (just `concurrently`, for running both dev servers at once)
npm install

# install frontend dependencies
npm --prefix frontend install

# restore backend dependencies
dotnet restore backend

# set up your local env
cp frontend/.env.example frontend/.env.local
# then fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase
# project's API settings, and confirm VITE_API_BASE_URL matches wherever the
# backend actually listens (check backend/Properties/launchSettings.json)
```

Also update `backend/appsettings.Development.json` (create it if it doesn't
exist — it's gitignored) with your real Supabase connection string and JWT secret,
matching the placeholders already in `appsettings.json`.

## Running both at once

```bash
npm run dev
```

This runs the Vite dev server (`frontend`, usually `http://localhost:5173`) and the
ASP.NET Core API (`dotnet watch run`, whatever port it's configured for) side by side
in one terminal, each prefixed and colour-coded so you can tell their output apart.
`dotnet watch` also means backend code changes hot-reload without a manual restart,
same as Vite does for the frontend.

If you'd rather run them in separate terminals (e.g. for debugging the API in VS
Code's debugger, which `dotnet watch` from a script can get in the way of):

```bash
# terminal 1
npm run dev:frontend

# terminal 2 — or just hit F5 in VS Code to debug the API directly
npm run dev:backend
```

## Confirm the wiring works

1. Open `http://localhost:5173` — you should see the full app.
2. Sign in via Supabase Auth (email/OTP, phone, or OAuth — whichever you've configured
   in your Supabase project's Auth settings).
3. Open your browser's Network tab and confirm a request to `/api/...` carries an
   `Authorization: Bearer eyJ...` header — that's the Supabase JWT reaching the
   backend.
4. If a request to `/api/matriculants/me` returns 401, check that
   `Supabase:JwtSecret` in the backend's config matches your project's actual JWT
   secret (Supabase dashboard → Project Settings → API → JWT Secret).
5. If the browser blocks the request entirely (a CORS error in the console), check
   `Cors:AllowedOrigins` in the backend config includes `http://localhost:5173`.
