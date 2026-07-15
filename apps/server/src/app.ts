/**
 * Express Application Setup
 * Configures all middleware, routes, and error handlers.
 * Exported so it can be imported by server.ts (or by tests later).
 */
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './shared/middlewares/errorHandler.js';
import { verifyOrigin } from './shared/middlewares/csrf.js';
import { ForbiddenError } from './shared/errors/AppError.js';

const isProd = env.NODE_ENV === 'production';

// Allow-list of browser origins permitted to call the API with credentials.
// CLIENT_URL is the primary frontend; CORS_EXTRA_ORIGINS (comma-separated)
// covers extras like www/non-www or Vercel preview deployments.
const allowedOrigins = [
  env.CLIENT_URL,
  ...(env.CORS_EXTRA_ORIGINS?.split(',') ?? []),
]
  .map((o) => o.trim().replace(/\/$/, '')) // tolerate trailing slashes
  .filter(Boolean);

export function createApp(): Express {
  const app = express();

  // Trust the first proxy (required behind Nginx/Railway/Render/Cloudflare so
  // req.ip + req.secure + rate-limit keying reflect the real client).
  app.set('trust proxy', 1);

  // Force HTTPS in production. The platform terminates TLS and forwards over
  // http with `x-forwarded-proto: https`; redirect anything that isn't https.
  if (isProd) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.secure || req.headers['x-forwarded-proto'] === 'https') return next();
      return res.redirect(308, `https://${req.headers.host}${req.originalUrl}`);
    });
  }

  // Security headers
  app.use(helmet());

  // CORS — only the allow-listed origins, with credentials so the browser
  // sends/receives our auth cookies. A missing Origin (curl, server-to-server,
  // health checks) is allowed; a present-but-unknown Origin is rejected.
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
          callback(null, true);
        } else {
          // A ForbiddenError (403) instead of a bare Error so a blocked origin
          // gets a clean 403 from the error handler, not a generic 500.
          callback(new ForbiddenError(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
    })
  );


  // Body parsing. Images go through multipart (multer), so JSON bodies are
  // small — keep the limit tight to reduce the large-payload DoS surface.
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use(cookieParser());

  // CSRF defense-in-depth — reject cross-origin state-changing requests.
  app.use(verifyOrigin);

  // Compression for response payloads
  app.use(compression());

  // Request logging — concise 'dev' locally, Apache 'combined' in production
  // (written to stdout, which Railway/Render capture as structured logs).
  app.use(morgan(isProd ? 'combined' : 'dev'));

  // Global rate limit — 300 req / 15 min per IP
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );


  // Mount API
  app.use('/api', apiRouter);

  // 404 + error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
