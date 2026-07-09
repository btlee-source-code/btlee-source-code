'use client';
/**
 * Data Deletion Instructions / حذف البيانات
 * Tells users how to delete their account/data (a requirement for the Google
 * OAuth app, and good practice generally). Content lives under the
 * `dataDeletion` namespace.
 */
import { useTranslations } from 'next-intl';
import { Trash2, Info } from 'lucide-react';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

export default function DataDeletionPage() {
  const t = useTranslations('dataDeletion');
  usePageTitle(t('title'));

  const steps = t.raw('steps') as string[];

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Trash2 className="size-7" />
          </div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">{t('title')}</h1>
          <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            {t('intro')}
          </p>
        </div>

        {/* Steps */}
        <ol className="space-y-4">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold tabular-nums text-primary">
                {i + 1}
              </span>
              <p className="leading-relaxed text-muted-foreground pt-0.5">{step}</p>
            </li>
          ))}
        </ol>

        {/* Callout */}
        <div className="mt-10 flex gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-5">
          <Info className="mt-0.5 size-5 shrink-0 text-accent" />
          <p className="text-sm font-medium leading-relaxed text-foreground">{t('note')}</p>
        </div>
      </div>
    </div>
  );
}
