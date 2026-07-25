# AngkorCraft — API (backend)

A thin Express + TypeScript service. It does the two things that must not happen
in the browser:

1. **Signs Cloudinary uploads** so the API secret never reaches the frontend.
2. **Cascade-deletes** shops/products — removing the database row *and* the
   Cloudinary asset in one server-side operation.

Everything else (reads, most writes, auth) goes directly frontend → Supabase,
protected by Row-Level Security.

## Run locally

**Prerequisites:** Node.js 20+.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your Supabase **service role** key
   and Cloudinary **API key + secret**. These are secrets — never commit `.env`.
3. Start the dev server (auto-reload):
   ```bash
   npm run dev
   ```
   The API runs on http://localhost:4000 and exposes `GET /health`.

## Endpoints

| Method | Path                       | Auth            | Purpose                                  |
| ------ | -------------------------- | --------------- | ---------------------------------------- |
| GET    | `/health`                  | none            | Health check (UptimeRobot pings this).   |
| POST   | `/api/cloudinary/sign`     | merchant/admin  | Signed params for a direct browser upload. |
| POST   | `/api/cloudinary/delete`   | merchant/admin  | Delete one Cloudinary asset by publicId. |
| DELETE | `/api/admin/shops/:id`     | admin           | Cascade delete a shop (+ media + links). |
| DELETE | `/api/products/:id`        | owner/admin     | Cascade delete a product (+ media).      |

## Scripts

- `npm run dev` — start with auto-reload (tsx watch)
- `npm start` — run the server
- `npm run seed` — load the sample artisan catalog into Supabase (Phase 1)
- `npm run build` — type-check + compile to `dist/`

See the project root `README.md` for the full setup walkthrough.
