import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { I18nProvider } from '@/features/i18n/components/I18nProvider';
import { NotificationsProvider } from '@/features/notifications/components/NotificationsProvider';
import { SectionBrandProvider } from '@/features/section/components/SectionBrandProvider';
import { ThemeProvider } from '@/features/theme/components/ThemeProvider';
import { WishlistProvider } from '@/features/wishlist/components/WishlistProvider';
import { ToastHost } from '@/shared/components/ui/Toast';
import { store } from '@/shared/store';

/**
 * All app-wide context providers in one place, wrapped once at the root
 * (`app/_layout.tsx`). Mirrors the web's `shared/components/providers`
 * composition so the two frontends stay structurally aligned.
 *
 * Order matters (outermost → innermost):
 *   Redux            — the store; everything below reads it
 *   Auth / Wishlist / Notifications — hydrate user state from the store + API
 *   I18n             — locale (re-reads once auth is known)
 *   Theme            — applies the persisted colour scheme before first paint
 *   SafeArea         — nearest the UI; provides insets to the screens
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <WishlistProvider>
          <NotificationsProvider>
            <I18nProvider>
              <ThemeProvider>
                {/* Applies the active section's brand colors over the whole UI */}
                <SectionBrandProvider>
                  <SafeAreaProvider>
                    {children}
                    {/* Global toast pill — rendered above the navigator */}
                    <ToastHost />
                  </SafeAreaProvider>
                </SectionBrandProvider>
              </ThemeProvider>
            </I18nProvider>
          </NotificationsProvider>
        </WishlistProvider>
      </AuthProvider>
    </Provider>
  );
}
