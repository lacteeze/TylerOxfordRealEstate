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
- `/admin` — private listing manager (Supabase email/password auth). Add, edit, or archive
  listings, swap the photos used on each home-page section, and upload photos to Supabase
  Storage. `/admin/settings` connects Google Drive for folder imports.

## Admin auth

Admin login lives at `/admin/login`. **Remember me** is checked by default and keeps the session cookie for 30 days. Unchecked, the session lasts for the browser session (until the window is closed).

Forgot password can email a **magic sign-in link** or a **password reset** link. After a reset link, `/admin/update-password` sets a new password and continues to `/admin`.

Emails are sent through Pingram to the typed address when it matches an existing Auth user **if** `SUPABASE_SERVICE_ROLE_KEY` is set (so the app can generate the link). Otherwise Supabase Auth sends the email itself.

### Supabase dashboard URL config

In [URL Configuration](https://supabase.com/dashboard/project/moqhrfdqwpvucxoemcrg/auth/url-configuration):

- **Site URL:** `https://tyler-oxford-real-estate.vercel.app`
- **Redirect URLs** (add each):
  - `https://tyler-oxford-real-estate.vercel.app/admin/login`
  - `https://tyler-oxford-real-estate.vercel.app/admin/auth/callback`
  - `https://tyler-oxford-real-estate.vercel.app/admin/update-password`
  - `https://tyler-oxford-real-estate.vercel.app/**`
  - `http://localhost:3001/admin/login`
  - `http://localhost:3001/admin/auth/callback`
  - `http://localhost:3001/admin/update-password`
  - `http://localhost:3001/**`
  - `http://localhost:3000/**` (if you run `next dev` on the default port)

Optional: Authentication → Sessions — keep the session time-box at least 30 days (or disabled) so Remember me can last a month.

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
# Optional: send magic/reset links through Pingram instead of Supabase SMTP.
# SUPABASE_SERVICE_ROLE_KEY=
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
  Google refresh token is encrypted and never sent to the browser), `landing_photos`
  (public read, authenticated write; home-page section photo overrides)
- Storage bucket: `listing-photos` (public read, authenticated write; listing galleries
  and uploaded landing-page photos)
