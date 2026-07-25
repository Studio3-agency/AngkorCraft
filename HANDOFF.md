# AngkorCraft — Project Handoff (v2, live)

> Drop this whole file into a new session as context. It covers the product,
> current LIVE state, architecture, everything built, how to run, deploy setup,
> gotchas, and open threads. Working directory: `E:\Code\Unipreneur`.

---

## 1. What this is

**AngkorCraft** — a Grab-style marketplace for **authentic Cambodian artisans**
(handmade silk, GI Kampot pepper, silverwork, woodcarving, souvenirs).

- **Buyers = mostly foreign tourists** (browse in English).
- **Sellers = local, non-technical Cambodian vendors** (operate in Khmer).
- Core value: gives locals a **digital presence they can't set up themselves** —
  the vendor works in Khmer, taps a map to mark their shop, tourists see it in
  English with directions. Discovery is online; the **transaction is in-person**.
- Sellers pay a **(simulated) subscription** to stay listed and **boost** to the
  homepage. There's a **mock POS** for their sales.
- Artisan vertical now; architected to add food/cafes later (`vertical` column).

**Owner:** a non-coder "director" — drives product, relies on the agent for all
implementation. **Preferences:** bias to execution, don't over-ask; when a
problem is reported, fix it thoroughly across the app incl. unlisted issues;
both languages must look consistent; **Khmer renders bold + larger**, never
skinny. Reviews by screenshot. Co-edits files concurrently sometimes.

## 2. Status: LIVE 🟢

| Piece | URL / ref |
|---|---|
| **Frontend** (Vercel, team "Studio 3") | https://angkor-craft.vercel.app — root dir `frontend` |
| **Backend** (Render free) | https://angkorcraft-api.onrender.com — service `angkorcraft-api`, Oregon |
| **Database** (Supabase) | project ref `qfvttdyhmjaytvgzvmlx` ("angkorcraft") |
| **GitHub** | `Studio3-agency/AngkorCraft`, branch `main`, autoDeploy on |
| **Keep-warm** | UptimeRobot pings `/health` every 5 min (Render free won't sleep) |

Everything is verified working end-to-end on production: browsing, store pages,
maps + geolocation, reviews, moderation, both languages, link previews.

**The DB migration is ALREADY APPLIED** to production (via Supabase MCP) —
`backend/supabase/RUN-IN-SUPABASE.sql` no longer needs running. It's idempotent
if you ever recreate the DB.

## 3. Tech stack & architecture

```
E:\Code\Unipreneur\
├── frontend/   React 19 + Vite 6 + Tailwind v4 + react-router-dom 7 + Leaflet + Supabase JS + motion. PWA.
├── backend/    Express + TypeScript. Cloudinary signing + cascade deletes + auto-translate + /health + helmet + rate limiting.
├── render.yaml — Render blueprint for the backend
├── HANDOFF.md (this), README.md, SETUP-CREDENTIALS.md
```

- **Supabase** — Postgres, Auth (one system, roles `customer`/`merchant`/`admin`),
  Row-Level Security. Browsing/auth/reviews/wishlist/profiles go **frontend →
  Supabase directly** (anon key, public/RLS-protected).
- **Cloudinary** (cloud `s3eggdpp`) — all uploaded media. Secret lives ONLY in the
  backend; uploads are backend-signed; deletes cascade through the backend.
- **Backend** only handles: Cloudinary sign/delete, auto-translate, cascade
  deletes, `/health`. So if the backend is down, browsing still works — only
  image upload / translate / cascade-delete break.
- **Payments/subscription/POS are SIMULATED** (real DB state, no real money).

Keys are in `backend/.env` and `frontend/.env.local` (gitignored). Frontend
VITE_ keys are public-safe (anon key + cloud name). Backend has the secrets.

## 4. How to run locally

From project root: `npm run dev:all` → backend (http://localhost:4000, `/health`)
+ frontend (http://localhost:3000). Individually: `cd backend && npm run dev` /
`cd frontend && npm run dev`.

**Verify:** `cd frontend && npx tsc --noEmit && npm run build`;
`cd backend && npx tsc --noEmit && npm run build`. Both pass clean.
(If `npx tsc` grabs a wrong global package, use `./node_modules/.bin/tsc`.)

CORS allows localhost + 127.0.0.1 + private LAN IPs in dev, so phone-on-Wi-Fi
testing works.

## 5. Demo accounts (password: `Demo1234!`)

- **customer@angkorcraft.demo** — shopper
- **merchant@angkorcraft.demo** — owns a pending store to demo approval
- **admin@angkorcraft.demo** — control center (approvals, moderation)

Recreate: `cd backend && npm run seed` then `npm run setup-demo`.

## 6. Database

- Base schema: `backend/supabase/schema.sql` (**run**). Convention is
  schema.sql + ordered `migration-*.sql`.
- **All migrations bundled + APPLIED**: `backend/supabase/RUN-IN-SUPABASE.sql`
  (bilingual + contact/social + slugs + moderation + quotas + profiles/reviews).
- Tables: `profiles`, `shops`, `products`, `wishlists`, `transactions`,
  `pos_sales`, **`content_reports`**, **`store_reviews`**; view **`public_profiles`**.
- To change schema: prefer the **Supabase MCP** if available in the session
  (`apply_migration` / `execute_sql` on project `qfvttdyhmjaytvgzvmlx`). Otherwise
  hand SQL to the owner to paste in the SQL Editor.

## 7. What's built (feature inventory)

**Public site** (state-based sub-pages via hash + real routes for a few):
- Home (hero, **Browse by Category** with lucide icons, **Featured Locations**
  = actively-boosted shops in a 3-col grid with motion, popular products, map
  preview w/ geolocation, tips strip).
- Products (filters + working **sort** dropdown), Shops/Locations (Leaflet map +
  **compact list rows**, page-size 10/50/100, **prev/next pagination**, sort,
  own-scroll column), Guide (Khmer audio), Saved/Wishlist.
- **Individual store page** `/shop/:slug` (real route) — cover, verified/featured
  badges, rating, **Share/Copy-link**, Google-Map button, contact channels,
  **nearby tourist landmarks** (auto from lat/lng, with an interactive map that
  distinguishes store vs landmark markers), products, **reviews + star rating**,
  "Run by [merchant]" avatar, report button.
- `/guidelines` (content policy), `/account` (profile editor: avatar+name+bio).

**Maps** (`InteractiveMap`, `StoreLocationMap`): default framed on **Cambodia**,
mouse-wheel zoom + keyboard, subtle secondary **landmark markers**, **user
geolocation** ("Near me" blue dot; asks once, remembers via localStorage).

**Merchant portal** (`/merchant`, Khmer-first): **multi-store** (switcher + add
branch, quota 5 stores), onboarding, dashboard (simulated subscription + boost),
products CRUD (Cloudinary, quota 60/store, guidelines-acceptance gate, "under
review" badge), mock POS.

**Admin** (`/admin`): overview, shops (approve/reject/feature/verify/cascade
delete), products, **moderation queue** (`/admin/moderation` — reports + flagged
content, hide/remove/restore/dismiss).

**Content moderation** (reactive model): report/flag button (anon-friendly),
auto-hide at 3+ reports (DB trigger), admin queue, RLS hides non-approved from
public, guidelines gate, optional Cloudinary AI pre-screening (env-gated).

**Profiles/reviews:** avatars (consumers can upload — sign endpoint allows any
authed user), `store_reviews` (one per user/shop, denormalized author for public
read), `public_profiles` view for safe name/avatar/bio.

**Contact/social:** phone, Telegram, WhatsApp, Messenger, Instagram, Facebook,
TikTok, WeChat, website, email, note — on the shared shop form + displayed via
`ContactLinks`.

**Security/scale:** helmet, per-IP rate limiting (generous), quotas (DB
triggers), bounded catalog fetches (`CATALOG_FETCH_LIMIT`).

**Link previews:** OpenGraph + Twitter meta in `index.html`, 1200×630
`public/og-image.jpg`.

## 8. Key decisions & GOTCHAS

1. **Design rules the owner established (apply consistently):**
   - Brand orange **`#FF914D`** (replaced the old terracotta `#BF5A36`).
   - **White text on bright-orange** (`bg-[#FF914D]`) badges/buttons.
   - **Golden `#F5C542` for text/icons on the dark-teal** (`#134E4A`) background
     (banners, verified badges, teal buttons, footer accents). Orange stays on
     light/cream backgrounds and in `bg-[#FF914D]/10` tint pills.
   - Teal `#134E4A` primary dark; cream `#FAF7F2`/`#FDF8F3` backgrounds; gold
     `#F5C542` accents on teal; `#F4C430` for map landmark stars.
2. **RLS guard triggers**: non-admins (incl. the service role, no `auth.uid()`)
   can't change `shops.status`/`is_verified`/`moderation_status` or
   `products.moderation_status`. So **shop approval + moderation happen via the
   admin JWT in the UI**, not the backend. Admin promotion = delete+re-insert
   profile (INSERT isn't guarded). Moderation auto-escalation uses a
   transaction-local GUC bypass.
3. **Resilient writes**: `saveShop`/`updateMyProfile` detect "column does not
   exist" and retry without the new fields, so the app degrades gracefully on a
   pre-migration DB.
4. **Slugs**: `/shop/:slug` matches slug OR id (so links work even pre-migration).
   Slugs auto-generate on shop create, unique, backfilled.
5. **i18n**: flat dicts `frontend/src/i18n/{en,km}.ts` (~427 keys each, kept at
   parity), via `useLanguage().t()`. Place names / user English are exceptions.
   Merchant portal defaults to Khmer.
6. **Render deploy gotchas (both fixed in render.yaml):**
   - Build must be `npm install --include=dev && npm run build` — Render sets
     `NODE_ENV=production`, which prunes devDeps → `tsc` missing → build fails.
   - `NODE_VERSION=22` — `@supabase/supabase-js` needs native WebSocket; Node 20
     crashes at client init.
7. **CORS**: `CORS_ORIGINS` supports `*` wildcard per label
   (`https://*.vercel.app` covers all preview deploys) + always allows
   localhost/LAN. Set on Render to `https://angkor-craft.vercel.app,https://*.vercel.app`.
8. **Free Render** sleeps after 15 min idle → UptimeRobot 5-min ping keeps it warm.
9. **Auth redirect** waits for profile role before routing. **LocationPicker**
   captures lat/lng invisibly (no raw coord inputs).
10. **Dev-only React warning** ("effect deps size changed") is a Vite Fast-Refresh
    artifact from editing hook deps; gone on hard refresh / in prod build.

## 9. Known issues / limitations

- Payments/subscription/POS **simulated** (intended).
- Link preview is **site-wide** (same card for every URL). Per-store OG needs SSR/
  prerender — out of scope.
- `fb:app_id` warning in FB debugger is **harmless** (only for FB Insights).
- Bundle is a single ~800KB+ chunk (code-split is a nice-to-have).
- Auto-translate quality: free MyMemory unless `GOOGLE_TRANSLATE_API_KEY` set.
- Agent can't screenshot the in-app browser pane here (owner reviews by
  screenshot); can `read_page`/JS-eval for structural checks.

## 10. Open threads / what's next

- **Seller analytics + attribution proposal (APPROVED-PENDING)** — the professor's
  requirement, proposal written, awaiting owner go-ahead. Three problems, one
  connected system:
  1. *Store traffic* → a `store_events` table (anon-insert, owner-read) + a
     `track(shopId, type)` helper firing on store-page views, Google-Map/directions
     clicks, contact taps, "view store", wishlist, map-marker clicks → merchant
     **Analytics tab** with KPI tiles + daily trend.
  2. *Growth from subscription* → overlay the boost/subscription window
     (`featured_until` + subscription dates) on the trend; before-vs-during
     comparison ("during your boost, views +142%").
  3. *Buyer came from AngkorCraft (attribution)* → an **AngkorCraft Visitor Pass**
     (code + QR shown on the store page, esp. after Directions/Contact) + a
     **POS "customer came from AngkorCraft" toggle** → dashboard shows attributed
     visits/sales. (Phase 1 = analytics; Phase 2 = attribution.)
- Possible polish: approval notification stub, richer onboarding, code-split.

## 11. Key files map

- Public data hook: `frontend/src/hooks/useCatalog.ts`; admin `useAdminData.ts`;
  merchant `useMerchantData.ts` (multi-store); geo `useUserLocation.ts`.
- Data access `frontend/src/lib/store.ts` (reads/writes, slugs, reviews,
  moderation, profiles), mappers `lib/db.ts`, backend API `lib/api.ts`, ranking/
  boost `lib/shops.ts`, geo `lib/geo.ts`, limits `lib/limits.ts`, `lib/localize.ts`.
- Data: `frontend/src/data/hotspots.ts` (35 curated tourist landmarks).
- Reusable UI: `components/{PortalShell,BottomNav,LanguageToggle,PasswordInput,
  PhoneInput,LocationPicker,ImageUpload,ProductCard,ShopCard,ShopListItem,
  ProductDetailModal,CurrencyConverter,Navbar,Footer,ContactLinks,NearbyHotspots,
  StoreLocationMap,InteractiveMap,StoreReviews,ReportButton,Avatar,CustomSelect}.tsx`
- Pages: `pages/{HomePage,ProductsPage,LocationsPage,GuidePage,SavedPage,
  StorePage,ContentPolicyPage,ProfilePage}.tsx`, auth `pages/auth/*`,
  admin `pages/admin/{AdminApp,AdminOverview,AdminShops,AdminProducts,
  AdminModeration,ShopFormModal,ProductFormModal}.tsx`,
  merchant `pages/merchant/{MerchantApp,MerchantOverview,MerchantProducts,MerchantPos}.tsx`
- Backend: `backend/src/{index,env,auth,cloudinary,supabaseAdmin}.ts`,
  `routes/{cloudinary,shops,products,translate}.ts`, scripts `backend/scripts/*`.
- SQL: `backend/supabase/{schema,RUN-IN-SUPABASE, migration-*}.sql`.

## 12. Current status

MVP + a large feature batch + full cloud deploy are **complete and verified**
(frontend + backend tsc/build pass; i18n at parity; live site renders real data;
`/health` ok; CORS verified; store pages/reviews/geolocation working live). Real
Supabase + Cloudinary wired. Backend kept warm 24/7. Remaining work is the
**seller-analytics/attribution build** (proposal approved-pending) and optional
polish.
