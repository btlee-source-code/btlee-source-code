import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Car as CarIcon,
  Fuel,
  Gauge,
  Palette,
  Settings2,
  Star,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { carsApi } from '@/features/cars/api/cars.api';
import { ShareCarButton } from '@/features/cars/detail/components/ShareCarButton';
import { SimilarCars } from '@/features/cars/detail/components/SimilarCars';
import {
  CAR_BODY_TYPE_LABELS,
  CAR_CONDITION_LABELS,
  CAR_FUEL_TYPE_LABELS,
  CAR_TRANSMISSION_LABELS,
} from '@/features/cars/lib/carConstants';
// Reuse the property detail's generic gallery viewer + map.
import { ImageViewer } from '@/features/properties/detail/components/ImageViewer';
import { PropertyMap } from '@/features/properties/detail/components/PropertyMap';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { WhatsAppIcon } from '@/shared/components/icons/WhatsAppIcon';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { useFetch } from '@/shared/hooks/useFetch';
import { LISTING_TYPE_LABELS } from '@/shared/lib/constants';
import { formatPrice, whatsappLink } from '@/shared/lib/format';
import { blurPlaceholder } from '@/shared/lib/images';
import { shadows } from '@/shared/lib/shadows';

export function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { data: car, isLoading, error, refetch } = useFetch(
    useCallback(() => carsApi.detail(id), [id]),
    id
  );
  const [imgIndex, setImgIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const c = useThemeColors();

  const galleryHeight = Math.round(width * 0.78);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <Skeleton className="w-full" style={{ height: galleryHeight }} />
        <View className="px-5 pt-5 gap-3 items-end">
          <Skeleton className="h-6 w-3/4 rounded-full" />
          <Skeleton className="h-4 w-1/2 rounded-full" />
          <Skeleton className="h-5 w-2/5 rounded-full mt-2" />
          <Skeleton className="h-28 w-full rounded-2xl mt-3" />
        </View>
      </View>
    );
  }

  if (error || !car) {
    return (
      <View className="flex-1 items-center justify-center bg-background gap-3 px-8">
        <Text className="text-lg font-cairo-bold text-foreground">{S.errorTitle}</Text>
        <Text className="text-sm text-muted-foreground font-cairo text-center">{S.carsErrorDesc}</Text>
        <PressableScale haptic onPress={refetch} className="bg-primary rounded-full px-7 h-11 items-center justify-center">
          <Text className="text-primary-foreground font-cairo-semibold">{S.retry}</Text>
        </PressableScale>
      </View>
    );
  }

  const images = car.images ?? [];
  const hasRating = car.ratingCount > 0;
  const title = `${car.make} ${car.model} ${car.year}`;
  const openWhatsApp = () => {
    const msg = `مرحباً، مهتم بالعربية ${car.make} ${car.model} رقم ${car.seq ?? ''} على Bt Lee`;
    Linking.openURL(whatsappLink(car.whatsappNumber, msg)).catch(() => {});
  };

  // Spec rows — built once so separators can skip the last row.
  const specRows: { key: string; icon: React.ReactNode; label: string; value: string }[] = [
    { key: 'year', icon: <Calendar size={19} color={c.muted} />, label: S.carYearLabel, value: String(car.year) },
    { key: 'condition', icon: <BadgeCheck size={19} color={c.muted} />, label: S.carConditionLabel, value: CAR_CONDITION_LABELS[car.condition] },
  ];
  if (car.mileage != null)
    specRows.push({
      key: 'mileage',
      icon: <Gauge size={19} color={c.muted} />,
      label: S.carMileageLabel,
      value: `${formatPrice(car.mileage)} ${S.kmUnit}`,
    });
  specRows.push({ key: 'transmission', icon: <Settings2 size={19} color={c.muted} />, label: S.carTransmissionLabel, value: CAR_TRANSMISSION_LABELS[car.transmission] });
  specRows.push({ key: 'fuel', icon: <Fuel size={19} color={c.muted} />, label: S.carFuelLabel, value: CAR_FUEL_TYPE_LABELS[car.fuelType] });
  specRows.push({ key: 'body', icon: <CarIcon size={19} color={c.muted} />, label: S.carBodyTypeLabel, value: CAR_BODY_TYPE_LABELS[car.bodyType] });
  if (car.color)
    specRows.push({ key: 'color', icon: <Palette size={19} color={c.muted} />, label: S.carColorLabel, value: car.color });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32">
        {/* Full-bleed swipeable gallery */}
        <View className="bg-secondary" style={{ height: galleryHeight }}>
          {images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width))}>
              {images.map((img) => (
                <Pressable key={img.publicId} onPress={() => setViewerOpen(true)}>
                  <Image
                    source={{ uri: img.url }}
                    placeholder={blurPlaceholder(img.url) ? { uri: blurPlaceholder(img.url) } : undefined}
                    placeholderContentFit="cover"
                    style={{ width, height: galleryHeight }}
                    contentFit="cover"
                    transition={250}
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View className="flex-1 items-center justify-center">
              <CarIcon size={48} color={`${c.muted}80`} />
            </View>
          )}

          {/* Page dots */}
          {images.length > 1 && (
            <View className="absolute bottom-3 left-0 right-0 items-center" pointerEvents="none">
              <View className="flex-row items-center gap-1.5">
                {images.map((img, i) => (
                  <View
                    key={img.publicId}
                    className="rounded-full"
                    style={{
                      width: i === imgIndex ? 16 : 6,
                      height: 6,
                      backgroundColor: i === imgIndex ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                    }}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Content */}
        <View className="px-5 pt-5 gap-5">
          {/* Title block */}
          <View className="gap-1.5">
            <Text className="text-[20px] leading-8 font-cairo-bold text-foreground text-right">{title}</Text>
            <View className="flex-row items-center justify-end gap-2 mt-1">
              {hasRating && (
                <View className="flex-row items-center gap-1">
                  <Star size={13} color={c.accent} fill={c.accent} />
                  <Text className="text-[13px] font-cairo-semibold text-foreground">{car.ratingAvg.toFixed(1)}</Text>
                </View>
              )}
              {car.isFeatured && (
                <View className="rounded-full px-2.5 py-1 flex-row items-center gap-1" style={{ backgroundColor: c.accent }}>
                  <Star size={10} color="#FFFFFF" fill="#FFFFFF" />
                  <Text className="text-[11px] font-cairo-bold text-white">{S.featured}</Text>
                </View>
              )}
              <View className="rounded-full bg-secondary px-3 py-1">
                <Text className="text-xs font-cairo-semibold text-secondary-foreground">
                  {LISTING_TYPE_LABELS[car.listingType]}
                </Text>
              </View>
              <Text className="text-sm text-muted-foreground font-cairo">
                {car.area_name}، {car.governorate}
              </Text>
            </View>
          </View>

          <View className="h-px bg-border" />

          {/* Price + listing meta */}
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-xs text-muted-foreground font-cairo">
              {car.seq ? `${S.listingNumber} #${car.seq} · ` : ''}
              {car.viewCount} {S.views}
            </Text>
            <View className="flex-row items-baseline gap-1.5 flex-shrink">
              {car.price != null ? (
                <>
                  {car.listingType === 'rent' && (
                    <Text className="text-sm text-muted-foreground font-cairo">{S.perMonth}</Text>
                  )}
                  <Text className="text-sm text-muted-foreground font-cairo">{S.currency}</Text>
                  <Text className="text-[24px] font-cairo-bold text-foreground">{formatPrice(car.price)}</Text>
                </>
              ) : (
                <Text className="text-xl font-cairo-bold text-foreground">{S.priceOnRequest}</Text>
              )}
            </View>
          </View>

          <View className="h-px bg-border" />

          {/* Details */}
          <View className="gap-1">
            <Text className="text-base font-cairo-bold text-foreground text-right mb-1">{S.detailsLabel}</Text>
            {specRows.map((row, i) => (
              <View
                key={row.key}
                className={`flex-row items-center justify-between py-3 ${
                  i === specRows.length - 1 ? '' : 'border-b border-border'
                }`}>
                <Text className="text-sm font-cairo-semibold text-foreground">{row.value}</Text>
                <View className="flex-row items-center gap-2.5">
                  <Text className="text-sm text-muted-foreground font-cairo">{row.label}</Text>
                  {row.icon}
                </View>
              </View>
            ))}
          </View>

          <View className="h-px bg-border" />

          {/* Description */}
          <View className="gap-2">
            <Text className="text-base font-cairo-bold text-foreground text-right">{S.descriptionLabel}</Text>
            <Text className="text-[15px] text-foreground/90 font-cairo leading-7 text-right">{car.description}</Text>
          </View>

          {/* Owner */}
          <View className="flex-row items-center gap-3 pt-4 border-t border-border">
            <View className="flex-1">
              <Text className="font-cairo-semibold text-foreground text-right">{car.owner?.name ?? 'البائع'}</Text>
            </View>
            {car.owner?.avatar ? (
              <Image source={{ uri: car.owner.avatar }} style={{ width: 44, height: 44, borderRadius: 22 }} contentFit="cover" />
            ) : (
              <View className="h-11 w-11 rounded-full bg-secondary items-center justify-center">
                <Text className="text-primary font-cairo-bold">{car.owner?.name?.charAt(0) ?? '؟'}</Text>
              </View>
            )}
          </View>

          {/* Location map (only when a pin was set) */}
          {car.location?.coordinates && (
            <PropertyMap lng={car.location.coordinates[0]} lat={car.location.coordinates[1]} />
          )}

          {/* Similar cars */}
          <SimilarCars id={car._id} />
        </View>
      </ScrollView>

      {/* Floating controls over the gallery: share (left) + back (right, RTL) */}
      <View
        className="absolute left-4 right-4 flex-row items-center justify-between"
        style={{ top: insets.top + 10 }}
        pointerEvents="box-none">
        <ShareCarButton car={car} />
        <Pressable
          onPress={() => router.back()}
          hitSlop={6}
          className="h-10 w-10 rounded-full items-center justify-center active:opacity-80"
          style={[{ backgroundColor: 'rgba(255,255,255,0.95)' }, shadows.sm]}>
          <ArrowRight size={20} color="#1C1C1C" />
        </Pressable>
      </View>

      {/* Sticky bottom bar: WhatsApp CTA (left) + price (right, RTL) */}
      <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between gap-3 px-5 pt-3 pb-3 bg-background border-t border-border">
        <PressableScale
          haptic
          onPress={openWhatsApp}
          containerClassName={car.price == null ? 'flex-1' : ''}
          className="rounded-full h-[50px] flex-row items-center justify-center gap-2 px-6"
          style={[{ backgroundColor: '#25D366' }, shadows.md]}>
          <WhatsAppIcon size={20} color="#FFFFFF" />
          <Text className="text-white font-cairo-bold text-[15px]">{S.carContactSeller}</Text>
        </PressableScale>
        {car.price != null && (
          <View className="flex-1 items-end">
            <View className="flex-row items-baseline gap-1">
              <Text className="text-xs text-muted-foreground font-cairo">
                {S.currency}
                {car.listingType === 'rent' ? ` ${S.perMonth}` : ''}
              </Text>
              <Text className="text-lg font-cairo-bold text-foreground">{formatPrice(car.price)}</Text>
            </View>
          </View>
        )}
      </View>

      <ImageViewer
        images={images}
        initialIndex={imgIndex}
        visible={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </SafeAreaView>
  );
}
