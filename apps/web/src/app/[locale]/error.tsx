'use client';
/**
 * Route-segment error boundary — catches render/runtime errors in any page
 * under this locale and shows a friendly retry screen instead of a blank or
 * raw crash in production.
 */
import { useEffect } from 'react';
import { RotateCw, Home } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for monitoring/console; the user only sees a clean UI.
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-6xl">😕</p>
      <h1 className="mt-4 text-2xl font-bold text-foreground">حصل خطأ غير متوقع</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        نأسف على ذلك — حاول تحميل الصفحة مرة أخرى، ولو استمرت المشكلة ارجع للرئيسية.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>
          <RotateCw className="size-4" />
          إعادة المحاولة
        </Button>
        <Button asChild variant="outline">
          <a href="/">
            <Home className="size-4" />
            الرجوع للرئيسية
          </a>
        </Button>
      </div>
    </div>
  );
}
