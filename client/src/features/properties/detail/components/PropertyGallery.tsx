'use client';
/**
 * Image gallery for the property detail page (Embla carousel) + a fullscreen
 * lightbox. Clicking the main image opens a popup where the user can page
 * through every photo with the left/right arrows (or keyboard / backdrop).
 */
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PropertyImage } from '@/shared/types/property';
import { cn } from '@/shared/lib/utils';

interface PropertyGalleryProps {
  images: PropertyImage[];
  alt: string;
}

export function PropertyGallery({ images, alt }: PropertyGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: 'rtl' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Lightbox state — index is independent from the inline carousel.
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const lightboxNext = useCallback(
    () => setLightboxIndex((i) => (i + 1) % images.length),
    [images.length]
  );
  const lightboxPrev = useCallback(
    () => setLightboxIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );

  // Lock body scroll + keyboard controls while the lightbox is open. On close,
  // sync the inline carousel to whatever photo we ended on.
  useEffect(() => {
    if (!lightboxOpen) return;

    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      else if (e.key === 'ArrowRight') lightboxPrev(); // RTL: right = previous
      else if (e.key === 'ArrowLeft') lightboxNext();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxOpen, lightboxNext, lightboxPrev]);

  useEffect(() => {
    if (!lightboxOpen) emblaApi?.scrollTo(lightboxIndex, true);
  }, [lightboxOpen, lightboxIndex, emblaApi]);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl bg-secondary" ref={emblaRef}>
        <div className="flex">
          {images.map((img, i) => (
            <div
              key={img.publicId}
              onClick={() => openLightbox(i)}
              className="relative aspect-[16/10] min-w-0 shrink-0 grow-0 basis-full cursor-zoom-in"
            >
              <Image
                src={img.url}
                alt={`${alt} - ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute start-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/90 dark:bg-black/55 text-foreground dark:text-white backdrop-blur-sm shadow flex items-center justify-center hover:bg-white dark:hover:bg-black/75 transition-all"
              aria-label="Previous"
            >
              <ChevronRight className="size-5 rtl:rotate-180" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute end-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/90 dark:bg-black/55 text-foreground dark:text-white backdrop-blur-sm shadow flex items-center justify-center hover:bg-white dark:hover:bg-black/75 transition-all"
              aria-label="Next"
            >
              <ChevronLeft className="size-5 rtl:rotate-180" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              {selectedIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((img, i) => (
            <button
              key={img.publicId}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-md border-2 transition-all',
                selectedIndex === i ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <Image src={img.url} alt={`thumb ${i + 1}`} fill sizes="20vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          >
            {/* Close */}
            <button
              onClick={() => setLightboxOpen(false)}
              aria-label="إغلاق"
              className="absolute top-4 end-4 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="size-6" />
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-white">
              {lightboxIndex + 1} / {images.length}
            </div>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-full max-h-[85vh] w-full max-w-5xl"
            >
              <Image
                src={images[lightboxIndex].url}
                alt={`${alt} - ${lightboxIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    lightboxPrev();
                  }}
                  aria-label="Previous"
                  className="absolute start-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:start-6"
                >
                  <ChevronRight className="size-7 rtl:rotate-180" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    lightboxNext();
                  }}
                  aria-label="Next"
                  className="absolute end-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:end-6"
                >
                  <ChevronLeft className="size-7 rtl:rotate-180" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
