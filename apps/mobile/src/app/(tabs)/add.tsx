import { Redirect } from 'expo-router';

/**
 * Placeholder route for the center "add" tab. The tab never actually navigates
 * here — its press is intercepted in the tab layout and routed to the section's
 * post form (see AddTabButton). This redirect is only a safety net in case the
 * route is ever reached directly.
 */
export default function AddTabPlaceholder() {
  return <Redirect href="/" />;
}
