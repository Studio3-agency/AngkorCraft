# AngkorCraft — Web (frontend)

The AngkorCraft customer/merchant/admin web app. React 19 + Vite + Tailwind v4,
with Supabase (auth + data) and a small backend for Cloudinary media.

## Run locally

**Prerequisites:** Node.js 20+, a running AngkorCraft backend (see `../backend`).

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your Supabase + Cloudinary values.
3. Start the dev server:
   ```bash
   npm run dev
   ```
   The app runs on http://localhost:3000

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — TypeScript type-check (no emit)

See the project root `README.md` for the full architecture and setup walkthrough.
