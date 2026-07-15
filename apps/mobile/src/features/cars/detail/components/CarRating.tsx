import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { S } from '@/config/strings';
import { carRatingsApi } from '@/features/cars/api/carRatings.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { StarRating } from '@/shared/components/ui/StarRating';
import type { Car } from '@/shared/types/car';

/**
 * Average rating + interactive star input for a car — the car counterpart of
 * PropertyRating. Hidden picker for the listing owner (server also blocks
 * self-rating); guests get a sign-in prompt. Seeds avg/count from the car doc
 * and preloads the user's own rating when authenticated.
 */
export function CarRating({ car }: { car: Car }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [avg, setAvg] = useState(car.ratingAvg);
  const [count, setCount] = useState(car.ratingCount);
  const [myRating, setMyRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const isOwner = !!user && user.id === car.owner?._id;

  useEffect(() => {
    let active = true;
    if (isAuthenticated && !isOwner) {
      carRatingsApi
        .mine(car._id)
        .then((r) => {
          if (active && r.myRating != null) setMyRating(r.myRating);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [isAuthenticated, isOwner, car._id]);

  const onRate = async (value: number) => {
    if (!isAuthenticated) {
      Alert.alert(S.loginToRate, undefined, [
        { text: S.signInTitle, onPress: () => router.push('/login') },
        { text: S.cancel, style: 'cancel' },
      ]);
      return;
    }
    const prev = myRating;
    setMyRating(value);
    setSubmitting(true);
    try {
      const res = await carRatingsApi.rate(car._id, value);
      setAvg(res.ratingAvg);
      setCount(res.ratingCount);
      setMyRating(res.myRating);
    } catch (e) {
      setMyRating(prev);
      Alert.alert(e instanceof Error ? e.message : S.genericError);
    } finally {
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
            {myRating > 0 ? S.yourRating : S.rateThis}
          </Text>
          <StarRating value={myRating} onChange={onRate} disabled={submitting} size={28} />
        </View>
      )}
    </View>
  );
}
