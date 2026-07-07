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
  listings and upload photos to Supabase Storage.

## Local development

```bash
npm install
npm run dev
```

Environment variables (`.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Supabase

- Project: `tyler-oxford-real-estate` (ca-central-1)
- Tables: `listings` (public read, authenticated write), `leads` (public insert,
  authenticated read)
- Storage bucket: `listing-photos` (public read, authenticated write)
