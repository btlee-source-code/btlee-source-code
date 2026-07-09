'use client';
/**
 * Property Card — the canonical preview shown across the platform
 * (home featured/latest, listing grid, wishlist, owner profile).
 */
import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Heart, MapPin, BedDouble, Bath, Maximize2, Star, Home as HomeIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from '@/config/navigation';
import { Card } from '@/shared/components/ui/card';
import { formatPrice, cn } from '@/shared/lib/utils';
import { wishlistApi } from '@/features/wishlist/api/wishlist.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import type { Property } from '@/shared/types/property';

interface PropertyCardProps {
  property: Property;
  initialInWishlist?: boolean;
  showWishlist?: boolean;
}

export function PropertyCard({
  property,
  initialInWishlist = false,
  showWishlist = true,
}: PropertyCardProps) {
  const t = useTranslations('property');
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(initialInWishlist);
  const [pending, setPending] = useState(false);

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('سجل دخولك أولاً لحفظ العقارات');
      return;
    }
    setPending(true);
    try {
      if (saved) {
        await wishlistApi.remove(property._id);
        setSaved(false);
      } else {
        await wishlistApi.add(property._id);
        setSaved(true);
      }
    } catch {
      toast.error('حدث خطأ، حاول مرة أخرى');
    } finally {
      setPending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/properties/${property._id}` as never} className="block group">
        <Card className="overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 p-0">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
            {property.images[0]?.url ? (
              <Image
                src={property.images[0].url}
                alt={property.area_name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
                <HomeIcon className="size-10" />
              </div>
            )}

            {/* Top badges — clean, unified pills with subtle backdrop */}
            <div className="absolute top-3 start-3 flex flex-col items-start gap-1.5">
              <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                {t(`listingTypes.${property.listingType}`)}
              </span>
              {property.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                  <Star className="size-3 fill-accent text-accent" />
                  مميز
                </span>
              )}
            </div>

            {/* Wishlist button */}
            {showWishlist && (
              <button
                onClick={toggleWishlist}
                disabled={pending}
                aria-label={t(saved ? 'removeFromWishlist' : 'addToWishlist')}
                className="absolute top-3 end-3 size-9 rounded-full bg-white/90 dark:bg-black/55 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all hover:scale-110 hover:bg-white dark:hover:bg-black/75 disabled:opacity-50"
              >
                <Heart
                  className={cn(
                    'size-4 transition-colors',
                    // Light mode: dark heart on a white button. Dark mode: the
                    // button turns black, so the heart is a soft deep red
                    // (not a harsh bright red) that stays legible on black.
                    saved
                      ? 'fill-red-500 text-red-500 dark:fill-red-700 dark:text-red-700'
                      : 'text-foreground dark:text-red-700'
                  )}
                />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Price + rating */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-1.5 min-w-0">
                {property.price != null ? (
                  <>
                    <span className="text-xl font-bold text-primary">{formatPrice(property.price)}</span>
                    <span className="text-xs text-muted-foreground">{t('currency')}</span>
                    {property.listingType === 'rent' && (
                      <span className="text-xs text-muted-foreground">/ شهرياً</span>
                    )}
                  </>
                ) : (
                  <span className="text-lg font-bold text-primary">{t('priceOnRequest')}</span>
                )}
              </div>

              {property.ratingCount > 0 ? (
                <div className="flex shrink-0 items-center gap-1">
                  <Star className="size-4 fill-accent text-accent" strokeWidth={1.5} />
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {property.ratingAvg.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">({property.ratingCount})</span>
                </div>
              ) : (
                <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {t('new')}
                </span>
              )}
            </div>

            {/* Type + location */}
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1">
                {t(`types.${property.type}`)} في {property.area_name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="size-3.5 shrink-0" />
                <span className="line-clamp-1">{property.governorate}</span>
              </div>
            </div>

            {/* Specs */}
            <div className="flex items-center gap-4 pt-2 border-t border-border text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <BedDouble className="size-4" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="size-4" />
                <span>{property.bathrooms}</span>
              </div>
              {property.area != null && (
                <div className="flex items-center gap-1">
                  <Maximize2 className="size-4" />
                  <span>{property.area} {t('areaUnit')}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
