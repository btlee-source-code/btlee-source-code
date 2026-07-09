'use client';
/**
 * Global error boundary — the last line of defense. Catches errors thrown in the
 * root layout itself (where the per-locale error.tsx can't run), so it must
 * render its own <html>/<body>. Kept dependency-free and bilingual-neutral.
 */
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          fontFamily: 'system-ui, sans-serif',
          background: '#ffffff',
          color: '#1c1c1c',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>حصل خطأ غير متوقع</h1>
        <p style={{ color: '#737373', margin: 0, maxWidth: '28rem' }}>
          Something went wrong. Please try again. — نأسف، حاول مرة أخرى.
        </p>
        <button
          onClick={reset}
          style={{
            cursor: 'pointer',
            border: 'none',
            borderRadius: '8px',
            background: '#1A3C34',
            color: '#fff',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          إعادة المحاولة / Retry
        </button>
      </body>
    </html>
  );
}
