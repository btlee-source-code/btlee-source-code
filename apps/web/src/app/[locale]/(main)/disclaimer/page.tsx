'use client';
/**
 * Disclaimer / إخلاء المسؤولية
 * Static legal page clarifying that Btlee is only a listing medium and is not a
 * party to — or responsible for — any deal between users. Content lives in the
 * i18n messages under the `disclaimer` namespace.
 */
import { useTranslations } from 'next-intl';
import { ShieldAlert, Info } from 'lucide-react';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

export default function DisclaimerPage() {
  const t = useTranslations('disclaimer');
  usePageTitle(t('title'));

  const sections = t.raw('sections') as { title: string; body: string }[];

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldAlert className="size-7" />
          </div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">{t('title')}</h1>
          <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            {t('intro')}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{t('updated')}</p>
        </div>

        {/* Key callout */}
        <div className="mb-10 flex gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-5">
          <Info className="mt-0.5 size-5 shrink-0 text-accent" />
          <p className="text-sm font-medium leading-relaxed text-foreground md:text-base">
            {t('highlight')}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-7">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="mb-2 flex items-center gap-2.5 text-lg font-bold text-foreground">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold tabular-nums text-primary">
                  {i + 1}
                </span>
                {s.title}
              </h2>
              <p className="leading-relaxed text-muted-foreground ps-[2.375rem]">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
