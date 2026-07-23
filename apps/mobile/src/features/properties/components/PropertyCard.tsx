import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart, Home, Star } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import {
  LISTING_TYPE_LABELS,
  TYPE_LABELS,
  propertyTypeHasRooms,
} from '@/shared/lib/constants';
import { formatPrice } from '@/shared/lib/format';
import { blurPlaceholder } from '@/shared/lib/images';
import { shadows } from '@/shared/lib/shadows';
import { useAppSelector } from '@/shared/store/hooks';
import type { Property } from '@/shared/types/property';

/**
 * Listing card — photo-led inside a crisp bordered surface (hairline border +
 * soft shadow) so the card stands out from the canvas. Covers blur-up from a
 * tiny Cloudinary placeholder, the wishlist heart pops with a spring when
 * toggled, and the whole card squishes under the finger.
 */
export function PropertyCard({ property }: { property: Property }) {
  const router = useRouter();
  const cover = property.images?.[0]?.url;
  const hasRating = property.ratingCount > 0;
  const saved = useAppSelector((s) => s.wishlist.ids.includes(property._id));
  const { toggle } = useWishlist();
  const c = useThemeColors();

  // Heart pop — overshoots then settles (playful).
  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));
  const onHeart = () => {
    heartScale.value = withSequence(
      withSpring(saved ? 0.75 : 1.45, { damping: 9, stiffness: 400 }),
      withSpring(1, { damping: 11, stiffness: 300 })
    );
    toggle(property._id, saved);
  };

  const specs = [
    ...(propertyTypeHasRooms(property.type)
      ? [
          `${property.bedrooms} ${S.roomsShort}`,
          `${property.bathrooms} ${S.bathsShort}`,
        ]
      : []),
    property.area != null ? `${property.area} ${S.areaUnit}` : null,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <PressableScale
      scaleTo={0.98}
      onPress={() => router.push(`/properties/${property._id}`)}
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
            <Home size={36} color={`${c.muted}66`} />
          </View>
        )}

        {/* Pills — RTL start (top-right). Fixed colors: they sit on a photo. */}
        <View className="absolute top-3 right-3 flex-row items-center gap-1.5">
          <View className="rounded-full bg-white/95 px-3 py-[5px]">
            <Text className="text-[11px] font-cairo-bold" style={{ color: '#1A3C34' }}>
              {LISTING_TYPE_LABELS[property.listingType]}
            </Text>
          </View>
          {property.isFeatured && (
            <View
              className="rounded-full px-2.5 py-[5px] flex-row items-center gap-1"
              style={{ backgroundColor: '#FDB803' }}>
              <Star size={10} color="#1C1C1C" fill="#1C1C1C" />
              <Text className="text-[11px] font-cairo-bold" style={{ color: '#1C1C1C' }}>{S.featured}</Text>
            </View>
          )}
        </View>

        {/* Wishlist heart — floats free (no chrome), pops on toggle */}
        <Pressable
          onPress={onHeart}
          hitSlop={10}
          className="absolute top-2.5 left-2.5 h-9 w-9 items-center justify-center">
          <Animated.View style={heartStyle}>
            <Heart
              size={24}
              color="#FFFFFF"
              strokeWidth={2.2}
              fill={saved ? '#E11D48' : 'rgba(28,28,28,0.45)'}
            />
          </Animated.View>
        </Pressable>
      </View>

      {/* Text block */}
      <View className="px-3.5 pt-2.5 pb-3.5 gap-[2px]">
        {/* Title + rating */}
        <View className="flex-row items-center gap-2">
          {hasRating ? (
            <View className="flex-row items-center gap-1">
              <Star size={13} color={c.accent} fill={c.accent} />
              <Text className="text-[13px] font-cairo-semibold text-foreground">
                {property.ratingAvg.toFixed(1)}
              </Text>
            </View>
          ) : (
            <Text className="text-xs text-muted-foreground font-cairo-medium">{S.new}</Text>
          )}
          <Text
            numberOfLines={1}
            className="flex-1 text-[15px] font-cairo-semibold text-foreground text-right">
            {TYPE_LABELS[property.type]} {S.in} {property.area_name}
          </Text>
        </View>

        <Text numberOfLines={1} className="text-[13px] text-muted-foreground font-cairo text-right">
          {property.governorate}
        </Text>
        <Text numberOfLines={1} className="text-[13px] text-muted-foreground font-cairo text-right">
          {specs}
        </Text>

        {/* Price — bold foreground, units muted */}
        <View className="flex-row items-baseline justify-end gap-1 mt-1">
          {property.price != null ? (
            <>
              {property.listingType === 'rent' && (
                <Text className="text-xs text-muted-foreground font-cairo">{S.perMonth}</Text>
              )}
              <Text className="text-xs text-muted-foreground font-cairo">{S.currency}</Text>
              <Text className="text-[16px] font-cairo-bold text-foreground">{formatPrice(property.price)}</Text>
            </>
          ) : (
            <Text className="text-[15px] font-cairo-bold text-foreground">{S.priceOnRequest}</Text>
          )}
        </View>
      </View>
    </PressableScale>
  );
}
