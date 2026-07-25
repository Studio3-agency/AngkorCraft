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

1. **Supabase** — create a free project. Run `backend/supabase/schema.sql` in the
   SQL editor, then note your Project URL, `anon` key, and `service_role` key.
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
