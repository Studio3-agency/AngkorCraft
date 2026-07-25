# AngkorCraft — Credentials & Setup Walkthrough

This is your step-by-step. You only need a web browser and ~20 minutes. Nothing
here costs money (all free tiers). Do the steps in order. When you paste keys,
put them in the files noted — **never** share the "secret"/"service_role" ones
publicly or commit them.

There are two files you'll fill in:
- `frontend/.env.local`  ← public keys (safe in the browser)
- `backend/.env`         ← secret keys (server only)

Create each by copying the matching `.env.example` in that folder.

---

## 1. Supabase (database + login) — ~10 min

1. Go to **https://supabase.com** → sign in with GitHub or email → **New project**.
2. Name it `angkorcraft`, choose a strong database password (save it somewhere),
   pick the region closest to Cambodia (e.g. **Southeast Asia (Singapore)**),
   then **Create new project**. Wait ~2 min for it to finish provisioning.
3. In the left sidebar open **Project Settings** (gear icon) → **API**. You'll see:
   - **Project URL** → copy into:
     - `frontend/.env.local` → `VITE_SUPABASE_URL`
     - `backend/.env` → `SUPABASE_URL`
   - **Project API keys → `anon` `public`** → copy into:
     - `frontend/.env.local` → `VITE_SUPABASE_ANON_KEY`
   - **Project API keys → `service_role` `secret`** (click "Reveal") → copy into:
     - `backend/.env` → `SUPABASE_SERVICE_ROLE_KEY`
     - ⚠️ This one is all-powerful. Backend only. Never put it in the frontend.
4. Create the database tables: left sidebar → **SQL Editor** → **New query** →
   open the file `backend/supabase/schema.sql`, copy ALL of it, paste, click
   **Run**. You should see "Success. No rows returned".
5. (For smooth demos) Turn off email confirmation so new signups log in instantly:
   left sidebar → **Authentication** → **Sign In / Providers** → **Email** →
   turn **OFF** "Confirm email" → **Save**.

---

## 2. Cloudinary (media storage) — ~5 min

1. Go to **https://cloudinary.com** → **Sign up for free** → verify email.
2. On the **Dashboard** (home) you'll see **Product Environment Credentials**:
   - **Cloud name** → copy into:
     - `frontend/.env.local` → `VITE_CLOUDINARY_CLOUD_NAME`
     - `backend/.env` → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → copy into:
     - `backend/.env` → `CLOUDINARY_API_KEY`
   - **API Secret** (click the eye to reveal) → copy into:
     - `backend/.env` → `CLOUDINARY_API_SECRET`
     - ⚠️ Secret — backend only.

That's it — no bucket/folder to create; the app uploads into an `angkorcraft/`
folder automatically.

---

## 3. Load the sample catalog + become admin — ~3 min

Once `backend/.env` is filled in, tell me (or run these yourself):

```bash
cd backend
npm run seed
```
This fills the site with the sample artisan shops and products.

Then, to make **your** account the admin:
1. Start the app and **sign up** once (any email/password) as a Shopper.
2. In Supabase → **SQL Editor**, open `backend/supabase/make-admin.sql`,
   change the email to the one you signed up with, and **Run** it.
3. Log out and back in — you'll land in the Admin dashboard.

---

## What I need from you to finish wiring the live demo

Just confirm when steps 1–2 are done (keys pasted into the two `.env` files and
the schema SQL run). You do **not** need to send me the secret keys — keep them
in your local files. Once they're in place I'll run the seed, create the demo
accounts, and verify all three flows end-to-end.
