/**
 * Environment Variables Loader & Validator
 * Loads .env file and validates all required variables exist with correct types.
 * Fails fast on startup if any required variable is missing or invalid.
 */
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Rejects obvious copy-paste placeholders so a half-filled .env can't ship to
// production. Real generated secrets won't contain these markers.
const PLACEHOLDER = /replace[-_ ]?with|change[-_ ]?this|your[-_ ]?(secret|api|key)|example|xxxx|placeholder/i;


const strongSecret = (label: string) =>
  z
    .string()
    .min(32, `${label} must be at least 32 chars`)
    .refine((v) => !PLACEHOLDER.test(v), `${label} is still a placeholder — generate a real value`);

// Optional env var that an empty line (FOO=) should NOT trip. dotenv yields ''
// for a present-but-empty key; treat that as "unset" so half-filled .env files
// (e.g. an optional OAuth key left blank) don't fail validation.
const optionalConfig = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' ? undefined : v), schema.optional());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url(),

  // Extra browser origins allowed by CORS (comma-separated). Useful for
  // www/non-www or Vercel preview deployments alongside CLIENT_URL.
  CORS_EXTRA_ORIGINS: z.string().optional(),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_ACCESS_SECRET: strongSecret('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: strongSecret('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Auth cookies. 'lax' is safe when the frontend and API share a site
  // (same registrable domain — incl. localhost:3000 ↔ localhost:5000, or
  // app.example.com ↔ api.example.com). Use 'none' only if they are truly
  // cross-site (e.g. Vercel frontend + Railway API), in which case Secure is
  // forced on and HTTPS is required.
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().optional(),

  // Google OAuth (social login). Optional so the app still boots without it —
  // the Google routes guard at request time and return a clear error if unset.
  GOOGLE_CLIENT_ID: optionalConfig(z.string().min(1)),
  GOOGLE_CLIENT_SECRET: optionalConfig(z.string().min(1)),
  // The exact redirect URI registered in the Google Cloud console, e.g.
  // https://api.btlee.com/api/auth/google/callback
  GOOGLE_CALLBACK_URL: optionalConfig(z.string().url()),


  CLOUDINARY_CLOUD_NAME: z.string().min(1).refine((v) => !PLACEHOLDER.test(v), 'CLOUDINARY_CLOUD_NAME is still a placeholder'),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1).refine((v) => !PLACEHOLDER.test(v), 'CLOUDINARY_API_SECRET is still a placeholder'),

  // SMTP — used locally / on hosts that allow outbound SMTP. Optional now that
  // Resend (HTTP) is an alternative, so the app boots even if only Resend is set.
  SMTP_HOST: optionalConfig(z.string().min(1)),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: optionalConfig(z.string().min(1)),
  SMTP_PASS: optionalConfig(z.string().min(1)),
  EMAIL_FROM: z.string().min(1),

  // Resend HTTP API key. Set this on hosts that block SMTP (e.g. Railway) — when
  // present, email is sent via Resend over HTTPS instead of SMTP.
  RESEND_API_KEY: optionalConfig(z.string().min(1)),

  // Seed admin. Password must be reasonably strong since it owns the platform.
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z
    .string()
    .min(10, 'ADMIN_PASSWORD must be at least 10 chars')
    .refine((v) => /[A-Za-z]/.test(v) && /[0-9]/.test(v), 'ADMIN_PASSWORD must include letters and numbers')
    .optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

// The access and refresh secrets MUST differ — otherwise an access token could
// be replayed as a refresh token (and vice-versa). Fail fast at boot.
if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
  console.error('❌ JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values.');
  process.exit(1);
}

// Cross-site safety check: in production a Vercel-style frontend talking to a
// separate API host needs SameSite=None, otherwise the browser drops the auth
// cookies and every login silently fails. Warn loudly if that looks misconfigured.
if (env.NODE_ENV === 'production' && env.COOKIE_SAMESITE === 'lax') {
  console.warn(
    '⚠️  COOKIE_SAMESITE=lax in production. If the frontend and API are on ' +
    'different sites (e.g. *.vercel.app + *.railway.app), set COOKIE_SAMESITE=none ' +
    'or auth cookies will NOT be sent and login will fail.'
  );
}
