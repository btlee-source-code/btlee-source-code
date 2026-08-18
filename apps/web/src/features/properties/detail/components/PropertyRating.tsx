"use client";
/**
 * Property rating card for the detail page — shows the average rating and lets
 * a logged-in (non-owner) visitor submit one 1–5 rating.
 */
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/card";
import { RatingInput, StarRating } from "@/shared/components/ui/star-rating";
import { ratingsApi } from "@/features/properties/api/ratings.api";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface PropertyRatingProps {
  propertyId: string;
  ratingAvg: number;
  ratingCount: number;
  ownerId: string | null;
}

export function PropertyRating({
  propertyId,
  ratingAvg,
  ratingCount,
  ownerId,
}: PropertyRatingProps) {
  const t = useTranslations("property");
  const { user, isAuthenticated, isHydrated } = useAuth();

  const [avg, setAvg] = useState(ratingAvg);
  const [count, setCount] = useState(ratingCount);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [checkedRatingKey, setCheckedRatingKey] = useState<string | null>(null);
  const pendingRef = useRef(false);

  const isOwner = Boolean(user && ownerId && user.id === ownerId);
  const ratingCheckKey =
    isHydrated && isAuthenticated && user && !isOwner
      ? `${user.id}:${propertyId}`
      : null;
  const checkingExisting =
    ratingCheckKey !== null && checkedRatingKey !== ratingCheckKey;
  const displayedRating = isAuthenticated ? myRating : null;

  useEffect(() => {
    let active = true;
    if (!ratingCheckKey) return;

    ratingsApi
      .mine(propertyId)
      .then((r) => {
        if (active) setMyRating(r.myRating);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCheckedRatingKey(ratingCheckKey);
      });

    return () => {
      active = false;
    };
  }, [propertyId, ratingCheckKey]);

  async function handleRate(value: number) {
    if (pendingRef.current || checkingExisting) return;
    if (!isAuthenticated) {
      toast.error("سجل دخولك أولاً لتقييم العقار");
      return;
    }
    const prev = myRating;
    pendingRef.current = true;
    setMyRating(value); // optimistic
    setPending(true);
    try {
      const res = await ratingsApi.rate(propertyId, value);
      setAvg(res.ratingAvg);
      setCount(res.ratingCount);
      setMyRating(res.myRating);
      toast.success(t("ratingThanks"));
    } catch {
      setMyRating(prev);
      toast.error("حدث خطأ، حاول مرة أخرى");
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <Card className="border-border p-5">
      <div className="flex flex-col gap-5">
        {/* Average */}
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <span className="text-4xl font-bold leading-none text-foreground tabular-nums">
            {avg.toFixed(1)}
          </span>
          <div className="space-y-1">
            <StarRating value={avg} size={18} />
            <p className="text-xs text-muted-foreground">
              {count > 0 ? `${count} ${t("ratingsCount")}` : t("noRatings")}
            </p>
          </div>
        </div>

        {/* Interactive picker — hidden for the listing's own owner */}
        {!isOwner && (
          <div className="flex w-full flex-col gap-2 sm:ml-auto sm:mr-0 sm:max-w-md">
            <span className="text-sm font-medium text-foreground">
              {displayedRating
                ? t("ratingSubmitted", { value: displayedRating })
                : t("rateThis")}
            </span>
            <RatingInput
              value={displayedRating ?? 0}
              onRate={handleRate}
              disabled={pending || checkingExisting}
              size={30}
              methodLabel={t("ratingChooseMethod")}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
