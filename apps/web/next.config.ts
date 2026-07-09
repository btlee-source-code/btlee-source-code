import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/config/i18n.ts');

// Same-origin API proxy. When API_PROXY_TARGET is set (production on Vercel),
// the browser calls our own origin at /api/* and Vercel rewrites those to the
// Railway API. That makes the auth cookie FIRST-PARTY (same site as the app),
// so it is sent on every request even on iOS Safari / mobile browsers that
// block third-party cookies — without merging the two deployments or buying a
// shared domain. The i18n middleware (src/proxy.ts) already excludes /api.
//   Vercel env:  API_PROXY_TARGET=https://<your-app>.up.railway.app
//                NEXT_PUBLIC_API_URL=/api
const proxyTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, '');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async rewrites() {
    if (!proxyTarget) return [];
    return [{ source: '/api/:path*', destination: `${proxyTarget}/api/:path*` }];
  },
  // Baseline security headers for every response from the Next app. (The API
  // sets its own via helmet.) HSTS is only meaningful over HTTPS in production.
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(self)',
      },
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload',
            },
          ]
        : []),
    ];
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
