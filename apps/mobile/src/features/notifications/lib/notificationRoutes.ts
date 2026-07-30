/**
 * Converts the server's web-style notification links into known Expo Router
 * destinations. Unknown links stay inside the notifications screen instead of
 * opening the app's unmatched-route page.
 */
export function getNotificationRoute(link: unknown): string | null {
  if (typeof link !== 'string' || !link.startsWith('/')) return null;

  const pathname = link.split(/[?#]/, 1)[0].replace(/\/+$/, '');
  const listingMatch = pathname.match(/^\/(properties|cars)\/([a-zA-Z0-9_-]+)$/);
  if (listingMatch) return `/${listingMatch[1]}/${listingMatch[2]}`;

  if (pathname === '/saved-searches') return pathname;

  return null;
}
