import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Car as CarIcon, Star } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { S } from '@/config/strings';
import { CAR_TRANSMISSION_LABELS } from '@/features/cars/lib/carConstants';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { LISTING_TYPE_LABELS } from '@/shared/lib/constants';
import { formatPrice } from '@/shared/lib/format';
import { blurPlaceholder } from '@/shared/lib/images';
import { shadows } from '@/shared/lib/shadows';
import type { Car } from '@/shared/types/car';

/**
 * Car listing card — mirrors PropertyCard's photo-led surface, adapted to car
 * specs (make/model, year, mileage, transmission). Brand-tinted pills read from
 * useThemeColors so they follow the active section's palette (cars = blue).
 */
export function CarCard({ car }: { car: Car }) {
  const router = useRouter();
  const cover = car.images?.[0]?.url;
  const hasRating = car.ratingCount > 0;
  const c = useThemeColors();

  const specs = [
    String(car.year),
    car.mileage != null ? `${formatPrice(car.mileage)} ${S.kmUnit}` : null,
    CAR_TRANSMISSION_LABELS[car.transmission],
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <PressableScale
      scaleTo={0.98}
      onPress={() => router.push(`/cars/${car._id}`)}
      className="rounded-2xl border border-border bg-card overflow-hidden"
      style={shadows.sm}>
      {/* Cover */}
      <View className="relative bg-secondary" style={{ aspectRatio: 4 / 3 }}>
        {cover ? (
          <Image
            source={{ uri: cover }}
            placeholder={blurPlaceholder(cover) ? { uri: blurPlaceholder(cover) } : undefined}
            placeholderContentFit="cover"
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <CarIcon size={36} color={`${c.muted}66`} />
          </View>
        )}

        {/* Pills — RTL start (top-right). Brand-tinted from the active section. */}
        <View className="absolute top-3 right-3 flex-row items-center gap-1.5">
          <View className="rounded-full bg-white/95 px-3 py-[5px]">
            <Text className="text-[11px] font-cairo-bold" style={{ color: c.primary }}>
              {LISTING_TYPE_LABELS[car.listingType]}
            </Text>
          </View>
          {car.isFeatured && (
            <View
              className="rounded-full px-2.5 py-[5px] flex-row items-center gap-1"
              style={{ backgroundColor: c.accent }}>
              <Star size={10} color="#FFFFFF" fill="#FFFFFF" />
              <Text className="text-[11px] font-cairo-bold text-white">{S.featured}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Text block */}
      <View className="px-3.5 pt-2.5 pb-3.5 gap-[2px]">
        {/* Title + rating */}
        <View className="flex-row items-center gap-2">
          {hasRating ? (
            <View className="flex-row items-center gap-1">
              <Star size={13} color={c.accent} fill={c.accent} />
              <Text className="text-[13px] font-cairo-semibold text-foreground">
                {car.ratingAvg.toFixed(1)}
              </Text>
            </View>
          ) : (
            <Text className="text-xs text-muted-foreground font-cairo-medium">{S.new}</Text>
          )}
          <Text
            numberOfLines={1}
            className="flex-1 text-[15px] font-cairo-semibold text-foreground text-right">
            {car.make} {car.model}
          </Text>
        </View>

        <Text numberOfLines={1} className="text-[13px] text-muted-foreground font-cairo text-right">
          {car.governorate}
        </Text>
        <Text numberOfLines={1} className="text-[13px] text-muted-foreground font-cairo text-right">
          {specs}
        </Text>

        {/* Price — bold foreground, units muted */}
        <View className="flex-row items-baseline justify-end gap-1 mt-1">
          {car.price != null ? (
            <>
              {car.listingType === 'rent' && (
                <Text className="text-xs text-muted-foreground font-cairo">{S.perMonth}</Text>
              )}
              <Text className="text-xs text-muted-foreground font-cairo">{S.currency}</Text>
              <Text className="text-[16px] font-cairo-bold text-foreground">{formatPrice(car.price)}</Text>
            </>
          ) : (
            <Text className="text-[15px] font-cairo-bold text-foreground">{S.priceOnRequest}</Text>
          )}
        </View>
      </View>
    </PressableScale>
  );
}
