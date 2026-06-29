'use client';
/**
 * OAuth callback landing page.
 *
 * The server has already set the httpOnly auth cookies and redirected here with
 * a ?status. Because there's no persisted user yet, AuthHydrator won't probe —
 * so we explicitly fetch /users/me to populate the store, then route the user
 * on (new accounts see the onboarding dialog first).
 */
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@/config/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usersApi } from '@/features/account/api/users.api';
import { OnboardingDialog } from '@/features/auth/components/OnboardingDialog';

function OAuthCallback() {
  const params = useSearchParams();
  const router = useRouter();
  const tErr = useTranslations('errors');
  const { setUser } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  // Guard against React 18 double-invoke in dev (StrictMode) and param changes.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const status = params.get('status');

    if (status !== 'success') {
      const reason = params.get('reason');
      const key =
        reason === 'blocked'
          ? 'accountBlocked'
          : reason === 'unconfigured'
            ? 'oauthUnavailable'
            : 'oauthFailed';
      toast.error(tErr(key));
      router.replace('/login');
      return;
    }

    // Cookies are set — load the user into the store, then continue.
    usersApi
      .me()
      .then((u) => {
        setUser(u);
        toast.success('تم تسجيل الدخول بنجاح');
        if (params.get('onboarding') === '1') {
          setShowOnboarding(true);
        } else {
          router.replace('/');
        }
      })
      .catch(() => {
        toast.error(tErr('oauthFailed'));
        router.replace('/login');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">جارٍ تسجيل الدخول…</p>

      <OnboardingDialog open={showOnboarding} onComplete={() => router.replace('/')} />
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <OAuthCallback />
    </Suspense>
  );
}
