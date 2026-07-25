import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.warn(`[AngkorCraft API] Missing env var: ${name}. Some endpoints will fail until it is set.`);
    return '';
  }
  return value;
}

const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

/**
 * Build a matcher for one configured origin. Plain origins match exactly;
 * an origin containing `*` is treated as a wildcard where `*` matches a single
 * hostname label. This lets one entry (e.g. `https://*.vercel.app`) cover the
 * production domain AND every Vercel preview deploy — each of which gets its own
 * generated subdomain — so CORS doesn't silently break on preview builds.
 */
function originMatcher(pattern: string): (origin: string) => boolean {
  if (!pattern.includes('*')) {
    return (origin) => origin === pattern;
  }
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // escape regex metacharacters
    .replace(/\*/g, '[^.]+'); // `*` → one hostname label (no dots)
  const re = new RegExp(`^${escaped}$`);
  return (origin) => re.test(origin);
}

const corsMatchers = corsOrigins.map(originMatcher);

/** True when the given request Origin is permitted by CORS_ORIGINS. */
export function isOriginAllowed(origin: string): boolean {
  return corsMatchers.some((match) => match(origin));
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigins,
  supabaseUrl: required('SUPABASE_URL'),
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  cloudinary: {
    cloudName: required('CLOUDINARY_CLOUD_NAME'),
    apiKey: required('CLOUDINARY_API_KEY'),
    apiSecret: required('CLOUDINARY_API_SECRET'),
  },
};

export const isConfigured =
  Boolean(env.supabaseUrl && env.supabaseServiceRoleKey && env.cloudinary.apiSecret);
