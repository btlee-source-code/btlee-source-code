import type { MetadataRoute } from 'next';
import { SITE_NAME, SITE_NAME_EN, SITE_DESCRIPTION } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_NAME_EN}`,
    short_name: SITE_NAME_EN,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1A3C34',
    dir: 'auto',
    icons: [
      { src: '/favicon.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicon.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
