import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowRight,
  ArrowUpDown,
  Bath,
  BedDouble,
  Building2,
  CarFront,
  ChevronLeft,
  Flag,
  Layers,
  MapPin,
  Maximize2,
  MoveVertical,
  Paintbrush,
  Star,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  interpolate,
  Extrapolation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ReportSheet } from '@/features/reports/components/ReportSheet';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { WhatsAppIcon } from '@/shared/components/icons/WhatsAppIcon';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { useFetch } from '@/shared/hooks/useFetch';
import {
  DEPOSIT_LABELS,
  FINISHING_LABELS,
  LISTING_TYPE_LABELS,
  SERVICE_LABELS,
  TYPE_LABELS,
} from '@/shared/lib/constants';
import { formatPrice, whatsappLink } from '@/shared/lib/format';
import { blurPlaceholder } from '@/shared/lib/images';
import { shadows } from '@/shared/lib/shadows';
import { propertiesApi } from '../api/properties.api';
import { ImageViewer } from './components/ImageViewer';
import { PropertyMap } from './components/PropertyMap';
import { PropertyRating } from './components/PropertyRating';
import { ShareButton } from './components/ShareButton';
import { SimilarProperties } from './components/SimilarProperties';

export function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { data: property, isLoading, error, refetch } = useFetch(
    useCallback(() => propertiesApi.detail(id), [id]),
    id
  );
  const [imgIndex, setImgIndex] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const c = useThemeColors();

  const galleryHeight = Math.round(width * 0.78);

  // Sticky header: fades in once the gallery scrolls away; the floating
  // circles fade out in lockstep. `stuck` flips pointerEvents so only the
  // visible layer is tappable.
  const scrollY = useSharedValue(0);
  const [stuck, setStuck] = useState(false);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const fadeStart = galleryHeight - 150;
  const fadeEnd = galleryHeight - 70;
  useAnimatedReaction(
    () => scrollY.value > (fadeStart + fadeEnd) / 2,
    (now, prev) => {
      if (now !== prev) runOnJS(setStuck)(now);
    }
  );
  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [fadeStart, fadeEnd], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [fadeStart, fadeEnd], [-10, 0], Extrapolation.CLAMP) },
    ],
  }));
  const floatStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [fadeStart, fadeEnd], [1, 0], Extrapolation.CLAMP),
  }));

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <Skeleton className="w-full" style={{ height: galleryHeight }} />
        <View className="px-5 pt-5 gap-3 items-end">
          <Skeleton className="h-6 w-3/4 rounded-full" />
          <Skeleton className="h-4 w-1/2 rounded-full" />
          <Skeleton className="h-5 w-2/5 rounded-full mt-2" />
          <Skeleton className="h-28 w-full rounded-2xl mt-3" />
          <Skeleton className="h-4 w-2/3 rounded-full" />
          <Skeleton className="h-4 w-1/2 rounded-full" />
        </View>
      </View>
    );
  }

  if (error || !property) {
    return (
      <View className="flex-1 items-center justify-center bg-background gap-3 px-8">
        <Text className="text-lg font-cairo-bold text-foreground">{S.errorTitle}</Text>
        <Text className="text-sm text-muted-foreground font-cairo text-center">{S.errorDesc}</Text>
        <PressableScale haptic onPress={refetch} className="bg-primary rounded-full px-7 h-11 items-center justify-center">
          <Text className="text-primary-foreground font-cairo-semibold">{S.retry}</Text>
        </PressableScale>
      </View>
    );
  }

  const images = property.images ?? [];
  const hasRating = property.ratingCount > 0;
  const openWhatsApp = () => {
    const msg = `مرحباً، مهتم بالعقار رقم ${property.seq ?? ''} على Bt Lee`;
    Linking.openURL(whatsappLink(property.whatsappNumber, msg)).catch(() => {});
  };
  const title = `${TYPE_LABELS[property.type]} ${S.in} ${property.area_name}`;

  // Details rows — built once so separators can skip the last row.
  const specRows: { key: string; icon: React.ReactNode; label: string; value: string }[] = [
    { key: 'bed', icon: <BedDouble size={19} color={c.muted} />, label: S.bedrooms, value: String(property.bedrooms) },
    { key: 'bath', icon: <Bath size={19} color={c.muted} />, label: S.bathrooms, value: String(property.bathrooms) },
  ];
  if (property.area != null)
    specRows.push({
      key: 'area',
      icon: <Maximize2 size={19} color={c.muted} />,
      label: S.area,
      value: `${property.area} ${S.areaUnit}`,
    });
  if (property.floor != null)
    specRows.push({ key: 'floor', icon: <Layers size={19} color={c.muted} />, label: S.floor, value: String(property.floor) });
  specRows.push({
    key: 'finishing',
    icon: <Paintbrush size={19} color={c.muted} />,
    label: S.finishingLabel,
    value: FINISHING_LABELS[property.finishing],
  });
  if (property.deposit)
    specRows.push({
      key: 'deposit',
      icon: <ArrowUpDown size={19} color={c.muted} />,
      label: S.depositLabel,
      value: DEPOSIT_LABELS[property.deposit],
    });
  if (property.hasElevator)
    specRows.push({ key: 'elevator', icon: <MoveVertical size={19} color={c.muted} />, label: S.elevator, value: S.available });
  if (property.hasGarage)
    specRows.push({ key: 'garage', icon: <CarFront size={19} color={c.muted} />, label: S.garage, value: S.available });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32">
        {/* Full-bleed gallery — tap opens the fullscreen viewer */}
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
              <Building2 size={48} color={`${c.muted}80`} />
            </View>
          )}

          {/* Page dots (≤10 images) or a counter pill */}
          {images.length > 1 &&
            (images.length <= 10 ? (
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
            ) : (
              <View
                className="absolute bottom-3 left-3 rounded-full px-2.5 py-1"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
                pointerEvents="none">
                <Text className="text-white text-xs font-cairo-medium">
                  {imgIndex + 1} / {images.length}
                </Text>
              </View>
            ))}
        </View>

        {/* Content */}
        <View className="px-5 pt-5 gap-5">
          {/* Title block */}
          <View className="gap-1.5">
            <Text className="text-[20px] leading-8 font-cairo-bold text-foreground text-right">{title}</Text>
            <View className="flex-row items-center justify-end gap-1.5">
              <Text className="text-sm text-muted-foreground font-cairo">
                {property.area_name}، {property.governorate}
              </Text>
              <MapPin size={14} color={c.muted} />
            </View>
            <View className="flex-row items-center justify-end gap-2 mt-1">
              {hasRating && (
                <View className="flex-row items-center gap-1">
                  <Star size={13} color={c.accent} fill={c.accent} />
                  <Text className="text-[13px] font-cairo-semibold text-foreground">
                    {property.ratingAvg.toFixed(1)}
                  </Text>
                  <Text className="text-xs text-muted-foreground font-cairo">({property.ratingCount})</Text>
                </View>
              )}
              {property.isFeatured && (
                <View className="rounded-full px-2.5 py-1 flex-row items-center gap-1" style={{ backgroundColor: '#C4922A' }}>
                  <Star size={10} color="#FFFFFF" fill="#FFFFFF" />
                  <Text className="text-[11px] font-cairo-bold text-white">{S.featured}</Text>
                </View>
              )}
              <View className="rounded-full bg-secondary px-3 py-1">
                <Text className="text-xs font-cairo-semibold text-secondary-foreground">
                  {LISTING_TYPE_LABELS[property.listingType]}
                </Text>
              </View>
            </View>
          </View>

          <View className="h-px bg-border" />

          {/* Price + listing meta */}
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-xs text-muted-foreground font-cairo">
              {property.seq ? `${S.listingNumber} #${property.seq} · ` : ''}
              {property.viewCount} {S.views}
            </Text>
            <View className="flex-row items-baseline gap-1.5 flex-shrink">
              {property.price != null ? (
                <>
                  {property.listingType === 'rent' && (
                    <Text className="text-sm text-muted-foreground font-cairo">{S.perMonth}</Text>
                  )}
                  <Text className="text-sm text-muted-foreground font-cairo">{S.currency}</Text>
                  <Text className="text-[24px] font-cairo-bold text-foreground">{formatPrice(property.price)}</Text>
                </>
              ) : (
                <Text className="text-xl font-cairo-bold text-foreground">{S.priceOnRequest}</Text>
              )}
            </View>
          </View>

          <View className="h-px bg-border" />

          {/* Details — clean rows, hairline separated */}
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

          {/* Services */}
          {property.services.length > 0 && (
            <>
              <View className="h-px bg-border" />
              <View className="gap-2.5">
                <Text className="text-base font-cairo-bold text-foreground text-right">{S.servicesLabel}</Text>
                <View className="flex-row flex-wrap gap-2 justify-end">
                  {property.services.map((svc) => (
                    <View key={svc} className="border border-border bg-card rounded-full px-3.5 py-1.5">
                      <Text className="text-foreground font-cairo-medium text-xs">{SERVICE_LABELS[svc]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          <View className="h-px bg-border" />

          {/* Description */}
          <View className="gap-2">
            <Text className="text-base font-cairo-bold text-foreground text-right">{S.descriptionLabel}</Text>
            <Text className="text-[15px] text-foreground/90 font-cairo leading-7 text-right">
              {property.description}
            </Text>
          </View>

          {/* Location map (only when a pin was set) */}
          {property.location?.coordinates && (
            <PropertyMap lng={property.location.coordinates[0]} lat={property.location.coordinates[1]} />
          )}

          {/* Ratings */}
          <PropertyRating property={property} />

          {/* Owner — tappable → owner profile (when the owner still exists) */}
          <Pressable
            onPress={() => property.owner?._id && router.push(`/owners/${property.owner._id}`)}
            disabled={!property.owner?._id}
            className="flex-row items-center gap-3 pt-4 border-t border-border active:opacity-70">
            {property.owner?._id ? <ChevronLeft size={18} color={c.muted} /> : null}
            <View className="flex-1">
              <Text className="font-cairo-semibold text-foreground text-right">
                {property.owner?.name ?? 'صاحب العقار'}
              </Text>
              {property.owner?._id ? (
                <Text className="text-xs text-muted-foreground font-cairo text-right">{S.ownerProfile}</Text>
              ) : null}
            </View>
            {property.owner?.avatar ? (
              <Image
                source={{ uri: property.owner.avatar }}
                style={{ width: 44, height: 44, borderRadius: 22 }}
                contentFit="cover"
              />
            ) : (
              <View className="h-11 w-11 rounded-full bg-secondary items-center justify-center">
                <Text className="text-primary font-cairo-bold">{property.owner?.name?.charAt(0) ?? '؟'}</Text>
              </View>
            )}
          </Pressable>

          {/* Similar properties */}
          <SimilarProperties id={property._id} />

          {/* Report this listing (authenticated only) */}
          {isAuthenticated && (
            <Pressable
              onPress={() => setReportOpen(true)}
              className="flex-row items-center justify-center gap-2 pt-2 active:opacity-70">
              <Flag size={15} color={c.muted} />
              <Text className="text-sm text-muted-foreground font-cairo">{S.reportListing}</Text>
            </Pressable>
          )}
        </View>
      </Animated.ScrollView>

      {/* Floating controls over the gallery: share (left) + back (right, RTL) */}
      <Animated.View
        className="absolute left-4 right-4 flex-row items-center justify-between"
        style={[{ top: insets.top + 10 }, floatStyle]}
        pointerEvents={stuck ? 'none' : 'box-none'}>
        <ShareButton property={property} />
        <Pressable
          onPress={() => router.back()}
          hitSlop={6}
          className="h-10 w-10 rounded-full items-center justify-center active:opacity-80"
          style={[{ backgroundColor: 'rgba(255,255,255,0.95)' }, shadows.sm]}>
          <ArrowRight size={20} color="#1C1C1C" />
        </Pressable>
      </Animated.View>

      {/* Sticky header — appears once the gallery scrolls away */}
      <Animated.View
        className="absolute top-0 left-0 right-0 bg-background border-b border-border"
        style={[{ paddingTop: insets.top }, headerStyle]}
        pointerEvents={stuck ? 'auto' : 'none'}>
        <View className="h-[52px] flex-row items-center gap-3 px-4">
          <View className="w-9" />
          <Text numberOfLines={1} className="flex-1 text-center text-[15px] font-cairo-bold text-foreground">
            {title}
          </Text>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="h-9 w-9 rounded-full items-center justify-center active:bg-secondary">
            <ArrowRight size={21} color={c.foreground} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Sticky bottom bar: WhatsApp CTA (left) + price (right, RTL) */}
      <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between gap-3 px-5 pt-3 pb-3 bg-background border-t border-border">
        {/* WhatsApp brand color + official glyph (mirrors the web CTA) */}
        <PressableScale
          haptic
          onPress={openWhatsApp}
          containerClassName={property.price == null ? 'flex-1' : ''}
          className="rounded-full h-[50px] flex-row items-center justify-center gap-2 px-6"
          style={[{ backgroundColor: '#25D366' }, shadows.md]}>
          <WhatsAppIcon size={20} color="#FFFFFF" />
          <Text className="text-white font-cairo-bold text-[15px]">{S.contactWhatsApp}</Text>
        </PressableScale>
        {property.price != null && (
          <View className="flex-1 items-end">
            <View className="flex-row items-baseline gap-1">
              <Text className="text-xs text-muted-foreground font-cairo">
                {S.currency}
                {property.listingType === 'rent' ? ` ${S.perMonth}` : ''}
              </Text>
              <Text className="text-lg font-cairo-bold text-foreground">{formatPrice(property.price)}</Text>
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
      <ReportSheet visible={reportOpen} onClose={() => setReportOpen(false)} propertyId={property._id} />
    </SafeAreaView>
  );
}
