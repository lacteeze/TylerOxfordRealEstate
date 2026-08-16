# Tyler Oxford — REALTOR® & Oxford Media

Public-facing personal brand site for Tyler Oxford, a REALTOR® (EXP Realty) and founder of
Oxford Media, an award-winning real estate media studio in St. John's, Newfoundland.

## Stack

- **Next.js 15** (App Router, React Server Components) + TypeScript
- **Tailwind CSS 4**
- **Supabase** — Postgres (listings, leads), Auth (admin login), Storage (listing photos)
- **Vercel** — hosting

## Features

- Home, Properties (search / filter / sort), and per-property detail pages with gallery,
  lightbox, and map
- Contact form that writes leads to Supabase (`leads` table) — ready to be wired to the
  Pingram API for a dedicated lead pipeline
- `/admin` — private listing manager (Supabase email/password auth). Add, edit, remove
  listings and upload photos to Supabase Storage. `/admin/settings` connects Google Drive
  for folder imports.

## Local development

```bash
npm install
npm run dev
```

Environment variables (`.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
# GOOGLE_REDIRECT_URI is optional; derived from the request origin when unset.
```

### Google Drive (admin photo import)

1. In [Google Cloud Console](https://console.cloud.google.com/), create (or pick) a project.
2. Enable **Google Drive API**.
3. Configure the OAuth consent screen (External is fine for Tyler’s account; add him as a test user while the app is in Testing).
4. Create OAuth credentials: **Web application**.
5. Authorized redirect URIs:
   - `http://localhost:3001/api/admin/google/callback`
   - `https://tyler-oxford-real-estate.vercel.app/api/admin/google/callback`
6. Put the Client ID and Client Secret in `.env.local` and in the Vercel project env vars, then redeploy.
7. Sign in at `/admin` → **Settings** → **Connect Google Drive**.

## Supabase

- Project: `tyler-oxford-real-estate` (ca-central-1)
- Tables: `listings` (public read, authenticated write; optional Drive folder fields),
  `leads` (public insert, authenticated read), `admin_settings` (authenticated only;
  Google refresh token is encrypted and never sent to the browser)
- Storage bucket: `listing-photos` (public read, authenticated write)
