'use client';
/**
 * Swipeable gallery of every app screen. Built on embla (already a dependency
 * for the property gallery); the carousel runs in the reading direction of the
 * active locale so swipes feel native in Arabic.
 */
import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Mockup } from './Mockup';
import { SectionHeader } from './SectionHeader';
import { SCREENS } from './mockups';

export function ScreenGallery() {
  const t = useTranslations('download.gallery');
  const locale = useLocale() === 'ar' ? 'ar' : 'en';
  const captions = t.raw('captions') as string[];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: locale === 'ar' ? 'rtl' : 'ltr',
    align: 'center',
    loop: true,
    containScroll: false,
  });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="overflow-hidden bg-background py-24 lg:py-32">
      <SectionHeader title={t('title')} subtitle={t('subtitle')} className="mb-14" />

      <div ref={emblaRef}>
        <div className="flex touch-pan-y">
          {SCREENS.map((name, i) => (
            <div
              key={name}
              className="min-w-0 shrink-0 grow-0 basis-[62%] px-3 sm:basis-[40%] lg:basis-[24%] xl:basis-[20%]"
            >
              <div
                className={cn(
                  'transition-all duration-500',
                  selected === i ? 'scale-100 opacity-100' : 'scale-90 opacity-50',
                )}
              >
                <Mockup screen={name} />
                <p className="mt-5 text-center text-sm font-semibold text-foreground/80">
                  {captions[i]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center gap-3">
        {/* The row flips in RTL, so "previous" lands on the right and has to
            point right — hence ChevronLeft plus the RTL rotation. */}
        <GalleryButton onClick={scrollPrev} label={t('prev')}>
          <ChevronLeft className="size-5 rtl:rotate-180" />
        </GalleryButton>

        <div className="flex items-center gap-1.5">
          {SCREENS.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={captions[i]}
              aria-current={selected === i}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                selected === i ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-primary/40',
              )}
            />
          ))}
        </div>

        <GalleryButton onClick={scrollNext} label={t('next')}>
          <ChevronRight className="size-5 rtl:rotate-180" />
        </GalleryButton>
      </div>
    </section>
  );
}

function GalleryButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
    >
      {children}
    </button>
  );
}
