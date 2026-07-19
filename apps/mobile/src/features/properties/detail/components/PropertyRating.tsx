import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { RatingInput, StarRating } from '@/shared/components/ui/StarRating';
import type { Property } from '@/shared/types/property';
import { ratingsApi } from '../../api/ratings.api';

/**
 * Average rating + interactive star input. The picker is hidden for the listing
 * owner (the server also blocks self-rating). Guests get a sign-in prompt.
 * Seeds avg/count from the property (denormalized on the doc) and preloads the
 * user's own rating when authenticated.
 */
export function PropertyRating({ property }: { property: Property }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [avg, setAvg] = useState(property.ratingAvg);
  const [count, setCount] = useState(property.ratingCount);
  const [myRating, setMyRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [checkedRatingKey, setCheckedRatingKey] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const isOwner = !!user && user.id === property.owner?._id;
  const ratingCheckKey = isAuthenticated && !isOwner && user ? `${user.id}:${property._id}` : null;
  const checkingExisting = ratingCheckKey !== null && checkedRatingKey !== ratingCheckKey;
  const displayedRating = isAuthenticated ? myRating : 0;

  useEffect(() => {
    let active = true;
    if (ratingCheckKey) {
      ratingsApi
        .mine(property._id)
        .then((r) => {
          if (active) setMyRating(r.myRating ?? 0);
        })
        .catch(() => {})
        .finally(() => {
          if (active) setCheckedRatingKey(ratingCheckKey);
        });
    }
    return () => {
      active = false;
    };
  }, [property._id, ratingCheckKey]);

  const onRate = async (value: number) => {
    if (submittingRef.current || checkingExisting) return;
    if (!isAuthenticated) {
      Alert.alert(S.loginToRate, undefined, [
        { text: S.signInTitle, onPress: () => router.push('/login') },
        { text: S.cancel, style: 'cancel' },
      ]);
      return;
    }
    if (myRating > 0) return;

    submittingRef.current = true;
    const prev = myRating;
    setMyRating(value);
    setSubmitting(true);
    try {
      const res = await ratingsApi.rate(property._id, value);
      setAvg(res.ratingAvg);
      setCount(res.ratingCount);
      setMyRating(res.myRating);
    } catch (e) {
      setMyRating(prev);
      Alert.alert(e instanceof Error ? e.message : S.genericError);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <View className="gap-3 pt-4 border-t border-border">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl font-cairo-bold text-foreground">{avg.toFixed(1)}</Text>
          <StarRating value={avg} size={18} />
        </View>
        <Text className="text-base font-cairo-bold text-foreground text-right">{S.ratingsTitle}</Text>
      </View>
      <Text className="text-xs text-muted-foreground font-cairo text-right">
        {count > 0 ? S.ratingsCount(count) : S.noRatings}
      </Text>

      {!isOwner && (
        <View className="gap-2 items-end pt-1">
          <Text className="text-sm font-cairo-medium text-foreground text-right">
            {displayedRating > 0 ? S.ratingSubmitted(displayedRating) : S.rateThis}
          </Text>
          <RatingInput
            value={displayedRating}
            onChange={onRate}
            disabled={submitting || checkingExisting || displayedRating > 0}
            size={28}
          />
        </View>
      )}
    </View>
  );
}
