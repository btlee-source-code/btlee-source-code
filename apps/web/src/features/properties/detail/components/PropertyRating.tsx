'use client';
/**
 * Property rating card for the detail page — shows the average rating and lets
 * a logged-in (non-owner) visitor submit one 1–5 rating.
 */
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Card } from '@/shared/components/ui/card';
import { StarRating, StarRatingInput } from '@/shared/components/ui/star-rating';
import { ratingsApi } from '@/features/properties/api/ratings.api';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface PropertyRatingProps {
  propertyId: string;
  ratingAvg: number;
  ratingCount: number;
  ownerId: string | null;
}

export function PropertyRating({ propertyId, ratingAvg, ratingCount, ownerId }: PropertyRatingProps) {
  const t = useTranslations('property');
  const { user, isAuthenticated, isHydrated } = useAuth();

  const [avg, setAvg] = useState(ratingAvg);
  const [count, setCount] = useState(ratingCount);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  const isOwner = Boolean(user && ownerId && user.id === ownerId);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    ratingsApi
      .mine(propertyId)
      .then((r) => setMyRating(r.myRating))
      .catch(() => {});
  }, [propertyId, isAuthenticated, isHydrated]);

  async function handleRate(value: number) {
    if (pending || myRating !== null) return;
    if (!isAuthenticated) {
      toast.error('سجل دخولك أولاً لتقييم العقار');
      return;
    }
    const prev = myRating;
    setMyRating(value); // optimistic
    setPending(true);
    try {
      const res = await ratingsApi.rate(propertyId, value);
      setAvg(res.ratingAvg);
      setCount(res.ratingCount);
      setMyRating(res.myRating);
      toast.success(t('ratingThanks'));
    } catch {
      setMyRating(prev);
      toast.error('حدث خطأ، حاول مرة أخرى');
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-border p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Average */}
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold leading-none text-foreground tabular-nums">
            {avg.toFixed(1)}
          </span>
          <div className="space-y-1">
            <StarRating value={avg} size={18} />
            <p className="text-xs text-muted-foreground">
              {count > 0 ? `${count} ${t('ratingsCount')}` : t('noRatings')}
            </p>
          </div>
        </div>

        {/* Interactive picker — hidden for the listing's own owner */}
        {!isOwner && (
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <span className="text-sm font-medium text-foreground">
              {myRating ? t('yourRating') : t('rateThis')}
            </span>
            <StarRatingInput
              value={myRating ?? 0}
              onRate={handleRate}
              disabled={pending || myRating !== null}
              size={30}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
