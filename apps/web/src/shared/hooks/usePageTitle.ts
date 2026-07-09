'use client';
/**
 * usePageTitle — sets the browser tab title for client-rendered pages.
 *
 * The app is client-heavy (pages fetch data in the browser), so most pages
 * can't use Next's server-side `generateMetadata`. This hook updates
 * `document.title` to "<page> | <appName>" once the page knows its title
 * (e.g. after a property loads), and restores the previous title on unmount.
 *
 * Pass `null`/`undefined` while data is still loading to leave the title as-is.
 */
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export function usePageTitle(title: string | null | undefined) {
  const tc = useTranslations('common');
  const appName = tc('appName');

  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = `${title} | ${appName}`;
    return () => {
      document.title = previous;
    };
  }, [title, appName]);
}
