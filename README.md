# AngkorCraft

A marketplace for **authentic Cambodian artisans** — handmade silk, GI Kampot
pepper, silverwork, woodcarving, and more. Shoppers discover and wishlist
verified crafts; artisan sellers list their store, subscribe to stay active, and
boost into the featured spotlight; admins run the whole platform.

> Focused on the **artisan / handmade / souvenir** vertical today, architected so
> other local-business verticals (food, cafes, sellers) can be switched on later.

## Architecture

```
Unipreneur/
├── frontend/   React 19 + Vite + Tailwind. Public site + customer/merchant/admin portals.
└── backend/    Express + TypeScript. Cloudinary signing + cascade deletes + health check.
```

- **Supabase** — Postgres database, authentication (one account system, roles:
  `customer` / `merchant` / `admin`), and Row-Level Security.
- **Cloudinary** — all uploaded media. The secret lives only in the backend.
- **Frontend** hosting (later): Vercel. **Backend** hosting (later): Render +
  UptimeRobot. See "Deployment" below.

## Local setup (order matters)

1. **Supabase** — create a free project. In the SQL editor run, in order:
   `backend/supabase/schema.sql`, then `backend/supabase/migration-bilingual.sql`,
   then `backend/supabase/migration-contact-moderation.sql` (contact fields,
   shareable store slugs, and content moderation), then
   `backend/supabase/migration-quotas.sql` (per-merchant store/product caps).
   Note your Project URL, `anon` key, and `service_role` key.
2. **Cloudinary** — create a free account. Note your cloud name, API key, secret.
3. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env      # fill in Supabase service role + Cloudinary secret
   npm run dev               # http://localhost:4000
   ```
4. **Seed sample data** (optional but recommended for a full-looking site):
   ```bash
   cd backend && npm run seed
   ```
5. **Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local # fill in Supabase URL + anon key, Cloudinary cloud name
   npm run dev                # http://localhost:3000
   ```

Full credential walkthrough and the admin-promotion SQL snippet live in
`backend/supabase/` (added in the Supabase setup step).

## Accounts & roles

- **Customer** — browse, wishlist (persisted to their account).
- **Merchant** — self-registers a store (goes live after admin approval),
  manages products, simulated subscription + boost, mock POS.
- **Admin** — approves merchants, full CRUD on shops/products with Cloudinary
  media, cascade delete, featured control.

> Payments, subscriptions, and POS are **simulated** for the prototype — flows
> work end-to-end and update real database state, but no real money moves.

## Content moderation

AngkorCraft uses the standard "reactive moderation" model so a small team can
stay on top of a growing catalog:

- **Guidelines gate** — merchants must confirm each listing follows the
  [content guidelines](/guidelines) before it saves.
- **Reporting** — anyone (including logged-out tourists) can flag a product or
  shop with the flag button. No account required.
- **Auto-escalation** — once a listing collects 3+ open reports it is
  automatically hidden pending review (DB trigger).
- **Admin queue** — `/admin/moderation` lists open reports and hidden content;
  admins can hide, remove, restore, or dismiss.
- **RLS enforcement** — non-approved products are hidden from the public catalog
  at the database level; owners still see their own with an "under review" badge.
- **Optional automated pre-screening** — set `CLOUDINARY_MODERATION=aws_rek`
  (Cloudinary's Amazon Rekognition AI Moderation add-on) to auto-screen every
  uploaded image. Uploads are signed with the moderation flag automatically;
  wire a Cloudinary moderation webhook to flip flagged assets in the DB.

## Safeguards & scale

- **Rate limiting** — the backend applies a global per-IP cap plus a tighter cap
  on write/upload/translate endpoints (`express-rate-limit`), and sends security
  headers via `helmet`. It trusts the Render proxy for correct client IPs.
- **Quotas** — max 5 stores per merchant and 60 products per store, enforced both
  in the UI and by DB triggers (`migration-quotas.sql`). Bump these when the
  database plan is upgraded.
- **Bounded reads** — public catalog fetches are capped (`CATALOG_FETCH_LIMIT`)
  so a large catalog never loads all at once.

## Deployment (free tier, no custom domain)

Deploy the backend first (so you have its URL for the frontend's `VITE_API_BASE_URL`),
then the frontend.

### 1. Backend → Render
- Render → **New +** → **Blueprint** → connect this repo. It reads `render.yaml`
  (root dir `backend/`, build `npm install && npm run build`, start `npm start`,
  health check `/health`).
- In the service's **Environment**, set the secret vars: `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
  `CLOUDINARY_API_SECRET`, and `CORS_ORIGINS` (add it after step 2). Set it to
  `https://your-app.vercel.app,https://*.vercel.app` — the wildcard entry covers
  every Vercel preview deploy too, so CORS won't break on preview builds.
  Optionally `GOOGLE_TRANSLATE_API_KEY` for best-quality Khmer auto-translation.
- Copy the service URL, e.g. `https://angkorcraft-api.onrender.com`.

### 2. Frontend → Vercel
- Vercel → **Add New… → Project** → import this repo → set **Root Directory** to
  `frontend/`. `vercel.json` handles the SPA rewrite (deep links to `/admin`,
  `/merchant` work).
- Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_CLOUDINARY_CLOUD_NAME`, and `VITE_API_BASE_URL` = the Render URL from step 1.
- Deploy, then go back to Render and set `CORS_ORIGINS` to the Vercel URL.

### 3. Keep the backend warm
- **UptimeRobot**: add an HTTP(s) monitor pinging `https://<render-url>/health`
  every 5 minutes so the free Render service doesn't sleep.

### 4. Install as an app (PWA)
Open the deployed Vercel URL on a phone → browser menu → **Add to Home Screen**.
It installs with the AngkorCraft icon and opens full-screen like a native app —
no App Store or Play Store needed.
