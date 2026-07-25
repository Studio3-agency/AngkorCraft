/**
 * Runs backend/supabase/schema.sql against the database using a direct
 * Postgres connection. Only needed once (creates tables/policies/triggers).
 *
 *   DATABASE_URL="postgresql://postgres:..." npm run db-setup
 *   (or put DATABASE_URL in backend/.env)
 *
 * Get the connection string from the Supabase dashboard: the green "Connect"
 * button at the top -> Session pooler or Direct connection URI.
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL (put it in backend/.env or pass it inline).');
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, '..', 'supabase', 'schema.sql');

async function main() {
  const sql = readFileSync(schemaPath, 'utf8');
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  console.log('Connecting to database…');
  await client.connect();
  console.log('Running schema.sql…');
  await client.query(sql);
  await client.end();
  console.log('Schema applied. ✅');
}

main().catch((e) => {
  console.error('Schema setup failed:', e.message ?? e);
  process.exit(1);
});
