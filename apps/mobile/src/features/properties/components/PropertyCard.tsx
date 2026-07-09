import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Bath, BedDouble, Heart, Home, Maximize2, MapPin, Star } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { S } from '@/config/strings';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { LISTING_TYPE_LABELS, TYPE_LABELS } from '@/shared/lib/constants';
import { formatPrice } from '@/shared/lib/format';
import { useAppSelector } from '@/shared/store/hooks';
import type { Property } from '@/shared/types/property';

const MUTED = '#737373';
const GOLD = '#C4922A';
const FOREGROUND = '#1C1C1C';
const RED = '#DC2626';

/**
 * Property card — mobile parity with the web `PropertyCard.tsx`:
 * 4:3 cover, listing-type + featured pills (top-right, RTL), wishlist heart
 * (top-left), price (Arabic-Indic digits) + ج.م, rating-or-"جديد", title, city,
 * and the bed/bath/area specs row.
 */
export function PropertyCard({ property }: { property: Property }) {
  const router = useRouter();
  const cover = property.images?.[0]?.url;
  const hasRating = property.ratingCount > 0;
  const saved = useAppSelector((s) => s.wishlist.ids.includes(property._id));
  const { toggle } = useWishlist();

  return (
    <Pressable
      onPress={() => router.push(`/properties/${property._id}`)}
      className="bg-card border border-border rounded-xl overflow-hidden mb-4 active:opacity-95">
      {/* Cover */}
      <View className="relative bg-secondary" style={{ aspectRatio: 4 / 3 }}>
        {cover ? (
          <Image source={{ uri: cover }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Home size={40} color={`${MUTED}80`} />
          </View>
        )}

        {/* Listing-type + featured pills (top-right to match RTL web) */}
        <View className="absolute top-3 right-3 items-end gap-1.5">
          <View className="rounded-full px-3 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
            <Text className="text-primary text-xs font-cairo-semibold">
              {LISTING_TYPE_LABELS[property.listingType]}
            </Text>
          </View>
          {property.isFeatured && (
            <View
              className="rounded-full px-3 py-1 flex-row items-center gap-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
              <Star size={12} color={GOLD} fill={GOLD} />
              <Text className="text-primary text-xs font-cairo-semibold">{S.featured}</Text>
            </View>
          )}
        </View>

        {/* Wishlist heart (top-left to match RTL web) */}
        <Pressable
          onPress={() => toggle(property._id, saved)}
          hitSlop={6}
          className="absolute top-3 left-3 h-9 w-9 rounded-full items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
          <Heart size={16} color={saved ? RED : FOREGROUND} fill={saved ? RED : 'transparent'} />
        </Pressable>
      </View>

      {/* Content */}
      <View className="p-4 gap-2">
        {/* Price + rating */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-baseline gap-1.5 flex-shrink">
            {property.price != null ? (
              <>
                <Text className="text-xl font-cairo-bold text-primary">{formatPrice(property.price)}</Text>
                <Text className="text-xs text-muted-foreground font-cairo">{S.currency}</Text>
                {property.listingType === 'rent' && (
                  <Text className="text-xs text-muted-foreground font-cairo">{S.perMonth}</Text>
                )}
              </>
            ) : (
              <Text className="text-lg font-cairo-bold text-primary">{S.priceOnRequest}</Text>
            )}
          </View>

          {hasRating ? (
            <View className="flex-row items-center gap-1">
              <Star size={16} color={GOLD} fill={GOLD} />
              <Text className="text-sm font-cairo-semibold text-foreground">{property.ratingAvg.toFixed(1)}</Text>
              <Text className="text-xs text-muted-foreground font-cairo">({property.ratingCount})</Text>
            </View>
          ) : (
            <View className="bg-secondary rounded-full px-2 py-0.5">
              <Text className="text-[11px] text-muted-foreground font-cairo-medium">{S.new}</Text>
            </View>
          )}
        </View>

        {/* Title: "{type} في {area_name}" */}
        <Text numberOfLines={1} className="text-base font-cairo-semibold text-foreground text-right">
          {TYPE_LABELS[property.type]} {S.in} {property.area_name}
        </Text>

        {/* City */}
        <View className="flex-row items-center gap-1">
          <MapPin size={14} color={MUTED} />
          <Text numberOfLines={1} className="text-sm text-muted-foreground font-cairo">
            {property.governorate}
          </Text>
        </View>

        {/* Specs */}
        <View className="flex-row items-center gap-4 pt-2 border-t border-border">
          <View className="flex-row items-center gap-1">
            <BedDouble size={16} color={MUTED} />
            <Text className="text-sm text-muted-foreground font-cairo">{property.bedrooms}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Bath size={16} color={MUTED} />
            <Text className="text-sm text-muted-foreground font-cairo">{property.bathrooms}</Text>
          </View>
          {property.area != null && (
            <View className="flex-row items-center gap-1">
              <Maximize2 size={16} color={MUTED} />
              <Text className="text-sm text-muted-foreground font-cairo">
                {property.area} {S.areaUnit}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
