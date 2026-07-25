# AngkorCraft — Project Handoff

> Drop this whole file into a new session as context. It covers the product,
> architecture, current state, how to run, key decisions/gotchas, known issues,
> and what's next. Working directory: `E:\Code\Unipreneur`.

---

## 1. What this is

**AngkorCraft** — a Grab-style marketplace for **authentic Cambodian artisans**
(handmade silk, GI Kampot pepper, silverwork, woodcarving, souvenirs).

**Business model / vision:**
- **Buyers = mostly foreign tourists** (browse in English).
- **Sellers = local, non-technical Cambodian vendors** (operate in Khmer).
- The platform's core value: it gives locals a **digital presence they can't set
  up themselves** — they don't know Google Maps, latitude/longitude, or even
  always have a fixed address. AngkorCraft bridges that: the vendor works in
  Khmer, taps a map to mark their shop, and tourists see it in English.
- Sellers pay a **(simulated) subscription** to stay listed and can **boost** to
  the homepage Featured section. There's a **mock POS** for their sales.
- Focused on the **artisan vertical now**, architected to add food/cafes/other
  local sellers later (a `vertical` column exists on shops/products).

**Owner:** a non-coder "director" — drives product decisions, relies on the agent
for all implementation. Preferences (important): **bias to execution, don't
over-ask** routine choices; when a problem is reported, **fix it thoroughly
across the whole app including unlisted issues** (that's what "audit/review"
means to them); both language modes must look consistent (same component sizing,
no wrapping differences); **Khmer must render bold + larger**, never skinny.

---

## 2. Tech stack & architecture

```
E:\Code\Unipreneur\
├── frontend/   React 19 + Vite 6 + Tailwind v4 + react-router-dom 7 + Leaflet + Supabase JS. PWA-enabled.
├── backend/    Express + TypeScript. Thin: Cloudinary signing + cascade deletes + auto-translate + /health.
├── package.json (root) — concurrently runs both: `npm run dev:all`
├── render.yaml — Render blueprint for the backend
├── HANDOFF.md (this file), README.md, SETUP-CREDENTIALS.md
```

- **Supabase** — Postgres DB, Auth (ONE system, role-based: `customer`/`merchant`/`admin`),
  Row-Level Security. Project ref `qfvttdyhmjaytvgzvmlx`.
- **Cloudinary** — all uploaded media (cloud name `s3eggdpp`). API secret lives
  ONLY in the backend. Uploads are backend-signed; deletes cascade (DB row +
  Cloudinary asset) through the backend.
- **Frontend → Vercel** (later), **Backend → Render** + UptimeRobot (later).
  Hosting is prepped/documented but **deferred** — everything runs on localhost
  for the pitch.
- **Payments/subscription/POS are SIMULATED** — flows update real DB state, no
  real money moves.

**Keys are already configured** in `backend/.env` and `frontend/.env.local`
(gitignored). If a fresh clone/session needs them, they must be re-supplied by
the owner (Supabase URL + anon + service_role; Cloudinary cloud/key/secret;
optional `GOOGLE_TRANSLATE_API_KEY`).

---

## 3. How to run

From the project root:
```bash
npm run dev:all
```
Starts backend (http://localhost:4000, health at `/health`) and frontend
(http://localhost:3000) together with color-coded logs.

Individually: `cd backend && npm run dev` / `cd frontend && npm run dev`.

**Verify commands:** `cd frontend && npx tsc --noEmit && npm run build`;
`cd backend && npx tsc --noEmit && npm run build`. All currently pass clean.

---

## 4. Demo accounts (password: `Demo1234!`)

- **customer@angkorcraft.demo** — shopper (browse, wishlist)
- **merchant@angkorcraft.demo** — owns a **pending** store "Sophea Silk Studio"
  (with bilingual EN/KH content) to demo the approval flow
- **admin@angkorcraft.demo** — the control center

Recreate/refresh: `cd backend && npm run seed` (catalog) then
`npm run setup-demo` (accounts + sample store).

---

## 5. Database

- Schema: `backend/supabase/schema.sql` (tables, `handle_new_user` trigger, RLS,
  guard triggers). **Already run.**
- Bilingual migration: `backend/supabase/migration-bilingual.sql` (adds
  `shops.description_kh`, `products.description_kh`, `products.cultural_story_kh`).
  **Already run.**
- Admin promotion: `backend/supabase/make-admin.sql` (delete+insert form — see gotcha below).
- Tables: `profiles`, `shops`, `products`, `wishlists`, `transactions`, `pos_sales`.

**To change the schema you must run SQL in the Supabase SQL Editor** (the direct
DB host isn't reachable from the sandbox, and DDL can't go through the REST/
service-role client). Hand the owner the SQL to paste + Run; they can also put it
on the clipboard via the computer-use `write_clipboard` tool.

---

## 6. Key architectural decisions & GOTCHAS

1. **RLS guard triggers** (`protect_shop_columns`, `protect_profile_role`): a
   non-admin (including the **service role**, which has no `auth.uid()`) CANNOT
   change `shops.status` / `shops.is_verified` / `profiles.role`. Consequences:
   - **Shop approval must be done by an authenticated admin JWT** (the admin UI
     does this). A backend/service-role status change is silently reverted.
   - **Admin promotion uses delete + re-insert** of the profile row (INSERT isn't
     guarded), not UPDATE. See `setup-demo.ts` and `make-admin.sql`.
   - Merchants CAN change their own `is_featured`/`subscription_status` (used by
     the simulated boost/subscribe) — those columns aren't guarded.
2. **Cascade delete** goes through the backend (`/api/admin/shops/:id`,
   `/api/products/:id`) using the service role + Cloudinary secret. DELETE isn't
   guarded by the triggers, so service-role delete works.
3. **Bilingual content bridge:** merchant/admin forms let the user type in ONE
   language; on save the backend `/api/translate` fills the other language.
   Provider = Google Translate if `GOOGLE_TRANSLATE_API_KEY` set, else free
   **MyMemory** (no key). Stored as `description`/`description_kh` etc. Display
   uses `localized(en, kh, language)` (`frontend/src/lib/localize.ts`).
4. **i18n:** flat dictionaries `frontend/src/i18n/en.ts` + `km.ts` (~320 keys each,
   kept at parity), consumed via `useLanguage().t(key, params)`. Place names /
   user-entered English are accepted exceptions.
5. **Khmer typography:** `LanguageProvider` sets `data-lang="kh"|"en"` on `<html>`.
   `index.css` then applies Khmer web fonts (**Noto Sans Khmer** body +
   **Kantumruy Pro** headings), bumps root size to **105%**, and increases weights
   so Khmer isn't skinny. Fonts loaded in `index.html`.
6. **Location without coordinates:** `LocationPicker` (Leaflet) lets a vendor tap
   the map / use GPS to drop a pin — lat/lng captured invisibly. No raw lat/long
   inputs, no required Google Maps URL. ShopCard auto-builds a Maps link from the
   pin. Plus a plain "how to find you" landmark field.
7. **Auth redirect** waits for the profile role to load before routing (else it
   lands everyone on `/`). See `LoginPage`/`SignupPage` effects.
8. **Merchant portal defaults to Khmer** via `defaultTo('kh')` (only if the user
   never chose a language).

---

## 7. What each portal does

- **Public site** (`/`, state-based sub-pages + bottom tab bar on mobile): Home
  (hero, categories computed from data, featured artisans, popular products, map
  preview, live-rate/guide strip), Products, Shops/Locations (Leaflet map), Guide
  (tourist buying guide, Khmer pronunciation audio), Saved/Wishlist. Live USD/KHR
  rate modal (informational, not an exchange — pulls a real market rate).
- **Auth** (`/login`, `/signup`): role toggle (shopper/seller), password eye,
  phone country-code picker, language toggle, no browser autofill.
- **Merchant portal** (`/merchant`, Khmer-first): onboarding (create store →
  pending), dashboard (store status, simulated subscription + boost, billing
  history), My Products (CRUD + Cloudinary), mock POS (cart → record sale →
  revenue tiles).
- **Admin dashboard** (`/admin`): Overview (tiles + pending-approvals queue),
  Shops & Merchants (approve/reject, feature, verify, edit, cascade-delete, add),
  Products (CRUD + Cloudinary). This is where **merchant stores get approved**.

Portals use a shared responsive `PortalShell` (sidebar on desktop, bottom tabs on
mobile) with a language switch.

---

## 8. The three hero demo flows (all verified working)

1. **Admin engine:** log in as admin → approve the pending store → it appears on
   the public site → add a product with a real photo (Cloudinary) → delete it →
   gone from the site AND Cloudinary (cascade).
2. **Merchant revenue:** merchant activates subscription (simulated) → boosts →
   jumps into homepage Featured. Mock POS rings up a sale.
3. **Customer journey:** sign up as customer → browse → wishlist (persists to
   account) → view a shop on the map.

> Tip for testing the merchant→admin approval loop: use two windows (merchant in
> normal, admin in incognito) so you can approve and refresh side by side.

---

## 9. Known issues / limitations

- **Simulated** payments/subscription/POS (intended for the prototype).
- **Hosting deferred** — Vercel/Render/UptimeRobot documented in README + files
  present (`vercel.json`, `render.yaml`), not yet deployed. PWA is enabled
  (installable via "Add to Home Screen") and verified in build output.
- **Auto-translate quality:** free MyMemory provider is decent but not perfect for
  Khmer; set `GOOGLE_TRANSLATE_API_KEY` for best quality. Seed/demo content is
  hand-authored bilingual so demos look right regardless.
- **Agent screenshot limitation:** the in-app browser pane can't capture
  screenshots in this environment, so **pixel-level visual QA relies on the owner
  sending screenshots.** Structure/overflow/translation are verified in code.
- Bundle is ~750KB (single chunk) — a code-split is a nice-to-have, not urgent.

---

## 10. What's next (open threads)

- **Deploy** (when ready): backend → Render (blueprint), frontend → Vercel
  (root `frontend/`), set env vars, `CORS_ORIGINS` = Vercel URL, UptimeRobot ping
  `/health`. Walkthrough in `README.md`.
- Possible polish the owner may ask for: approval **notification stub** ("your
  store was approved"), more address granularity, richer merchant onboarding,
  visual tweaks from their screenshots.
- Continue the **visual consistency pass** in both languages per owner feedback
  (they review by screenshot).

---

## 11. Key files map

- Public data hook: `frontend/src/hooks/useCatalog.ts` (Supabase, mock fallback)
- Data access: `frontend/src/lib/store.ts`, mappers `frontend/src/lib/db.ts`
- Backend API calls (Cloudinary/translate): `frontend/src/lib/api.ts`
- Auth: `frontend/src/context/AuthContext.tsx`, guard `components/RequireRole.tsx`
- i18n: `frontend/src/context/LanguageContext.tsx` + `src/i18n/{en,km}.ts`,
  `src/lib/localize.ts`
- Reusable UI: `components/{PortalShell,BottomNav,LanguageToggle,PasswordInput,
  PhoneInput,LocationPicker,ImageUpload,ProductCard,ShopCard,ProductDetailModal,
  CurrencyConverter,Navbar,Footer}.tsx`
- Admin: `pages/admin/{AdminApp,AdminOverview,AdminShops,AdminProducts,
  ShopFormModal,ProductFormModal}.tsx`
- Merchant: `pages/merchant/{MerchantApp,MerchantOverview,MerchantProducts,MerchantPos}.tsx`
- Backend routes: `backend/src/routes/{cloudinary,shops,products,translate}.ts`,
  auth middleware `backend/src/auth.ts`
- Scripts: `backend/scripts/{seed,setup-demo,db-setup}.ts`

---

## 12. Current status

MVP + a large redesign are **complete and verified building clean** (frontend +
backend `tsc` and `vite build` pass; no console errors; live end-to-end tests of
auth, admin approval, Cloudinary upload+cascade-delete, RLS security, and the
auto-translate bridge all passed). Real Supabase + Cloudinary are wired and
working on localhost. Remaining work is deployment + visual polish from owner
review.
