import { FileX2, Home, ListChecks } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/config/navigation';
import { Button } from '@/shared/components/ui/button';

export default function DeletedListingNotFound() {
  const t = useTranslations('deletedListing');

  return (
    <div className="container mx-auto flex min-h-[65vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-7 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
          <FileX2 className="size-10" strokeWidth={1.7} />
        </div>

        <p className="mt-6 text-sm font-semibold text-destructive">{t('eyebrow')}</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{t('title')}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
          {t('description')}
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="min-w-40">
            <Link href="/my-properties">
              <ListChecks className="size-4" />
              {t('myListings')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-w-40">
            <Link href="/">
              <Home className="size-4" />
              {t('home')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
