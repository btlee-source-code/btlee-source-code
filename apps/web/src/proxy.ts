/**
 * next-intl middleware — handles locale detection + redirects.
 * Runs on every request matching the matcher below.
 */
import createMiddleware from 'next-intl/middleware';
import { routing } from './config/routing';

export default createMiddleware(routing);

export const config = {
  // Match all routes except API, _next, favicon, and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
