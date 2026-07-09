import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import {
  ArrowUpDown,
  Bath,
  BedDouble,
  Building2,
  Layers,
  MapPin,
  Maximize2,
  MessageCircle,
  Paintbrush,
  Star,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useFetch } from '@/shared/hooks/useFetch';
import {
  DEPOSIT_LABELS,
  FINISHING_LABELS,
  LISTING_TYPE_LABELS,
  SERVICE_LABELS,
  TYPE_LABELS,
} from '@/shared/lib/constants';
import { formatPrice, whatsappLink } from '@/shared/lib/format';
import { propertiesApi } from '../api/properties.api';

const PRIMARY = '#1A3C34';
const MUTED = '#737373';
const GOLD = '#C4922A';
const { width } = Dimensions.get('window');

export function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: property, isLoading, error, refetch } = useFetch(
    useCallback(() => propertiesApi.detail(id), [id]),
    id
  );
  const [imgIndex, setImgIndex] = useState(0);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={PRIMARY} />
      </View>
    );
  }

  if (error || !property) {
    return (
      <View className="flex-1 items-center justify-center bg-background gap-3 px-8">
        <Text className="text-lg font-cairo-bold text-foreground">{S.errorTitle}</Text>
        <Text className="text-sm text-muted-foreground font-cairo text-center">{S.errorDesc}</Text>
        <Pressable onPress={refetch} className="bg-primary rounded-lg px-5 py-2.5 active:opacity-90">
          <Text className="text-primary-foreground font-cairo-semibold">{S.retry}</Text>
        </Pressable>
      </View>
    );
  }

  const images = property.images ?? [];
  const openWhatsApp = () => {
    const msg = `مرحباً، مهتم بالعقار رقم ${property.seq ?? ''} على Bt Lee`;
    Linking.openURL(whatsappLink(property.whatsappNumber, msg)).catch(() => {});
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-28">
        {/* Image gallery */}
        <View className="bg-secondary" style={{ height: width * 0.72 }}>
          {images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) =>
                setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width))
              }>
              {images.map((img) => (
                <Image
                  key={img.publicId}
                  source={{ uri: img.url }}
                  style={{ width, height: width * 0.72 }}
                  contentFit="cover"
                  transition={200}
                />
              ))}
            </ScrollView>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Building2 size={48} color={`${MUTED}80`} />
            </View>
          )}

          {/* Image counter + listing-type pill */}
          {images.length > 1 && (
            <View className="absolute bottom-3 left-3 rounded-full px-2.5 py-1" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
              <Text className="text-white text-xs font-cairo-medium">
                {imgIndex + 1} / {images.length}
              </Text>
            </View>
          )}
          <View className="absolute top-3 right-3 rounded-full px-3 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
            <Text className="text-primary text-xs font-cairo-semibold">
              {LISTING_TYPE_LABELS[property.listingType]}
            </Text>
          </View>
        </View>

        <View className="px-5 pt-4 gap-4">
          {/* Price + rating */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-baseline gap-1.5 flex-shrink">
              {property.price != null ? (
                <>
                  <Text className="text-2xl font-cairo-bold text-primary">{formatPrice(property.price)}</Text>
                  <Text className="text-sm text-muted-foreground font-cairo">{S.currency}</Text>
                  {property.listingType === 'rent' && (
                    <Text className="text-sm text-muted-foreground font-cairo">{S.perMonth}</Text>
                  )}
                </>
              ) : (
                <Text className="text-xl font-cairo-bold text-primary">{S.priceOnRequest}</Text>
              )}
            </View>
            {property.ratingCount > 0 && (
              <View className="flex-row items-center gap-1">
                <Star size={18} color={GOLD} fill={GOLD} />
                <Text className="text-base font-cairo-semibold text-foreground">{property.ratingAvg.toFixed(1)}</Text>
                <Text className="text-xs text-muted-foreground font-cairo">({property.ratingCount})</Text>
              </View>
            )}
          </View>

          {/* Title + location */}
          <View className="gap-1">
            <Text className="text-lg font-cairo-bold text-foreground text-right">
              {TYPE_LABELS[property.type]} {S.in} {property.area_name}
            </Text>
            <View className="flex-row items-center gap-1 justify-end">
              <Text className="text-sm text-muted-foreground font-cairo">
                {property.area_name}، {property.governorate}
              </Text>
              <MapPin size={15} color={MUTED} />
            </View>
          </View>

          {/* Specs */}
          <View className="flex-row flex-wrap gap-3 pt-3 border-t border-border">
            <Spec icon={<BedDouble size={18} color={PRIMARY} />} label={S.bedrooms} value={String(property.bedrooms)} />
            <Spec icon={<Bath size={18} color={PRIMARY} />} label={S.bathrooms} value={String(property.bathrooms)} />
            {property.area != null && (
              <Spec icon={<Maximize2 size={18} color={PRIMARY} />} label={S.area} value={`${property.area} ${S.areaUnit}`} />
            )}
            {property.floor != null && (
              <Spec icon={<Layers size={18} color={PRIMARY} />} label={S.floor} value={String(property.floor)} />
            )}
            <Spec
              icon={<Paintbrush size={18} color={PRIMARY} />}
              label={S.finishingLabel}
              value={FINISHING_LABELS[property.finishing]}
            />
            {property.deposit && (
              <Spec
                icon={<ArrowUpDown size={18} color={PRIMARY} />}
                label={S.depositLabel}
                value={DEPOSIT_LABELS[property.deposit]}
              />
            )}
          </View>

          {/* Services */}
          {property.services.length > 0 && (
            <View className="gap-2">
              <Text className="text-base font-cairo-bold text-foreground text-right">{S.servicesLabel}</Text>
              <View className="flex-row flex-wrap gap-2 justify-end">
                {property.services.map((svc) => (
                  <View key={svc} className="bg-secondary rounded-full px-3 py-1.5">
                    <Text className="text-secondary-foreground font-cairo-medium text-xs">{SERVICE_LABELS[svc]}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          <View className="gap-2">
            <Text className="text-base font-cairo-bold text-foreground text-right">{S.descriptionLabel}</Text>
            <Text className="text-sm text-foreground font-cairo leading-6 text-right">{property.description}</Text>
          </View>

          {/* Owner + meta */}
          <View className="flex-row items-center gap-3 pt-3 border-t border-border">
            {property.owner?.avatar ? (
              <Image source={{ uri: property.owner.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} contentFit="cover" />
            ) : (
              <View className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
                <Text className="text-primary font-cairo-bold">{property.owner?.name?.charAt(0) ?? '؟'}</Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="font-cairo-semibold text-foreground text-right">{property.owner?.name ?? 'صاحب العقار'}</Text>
              <Text className="text-xs text-muted-foreground font-cairo text-right">
                {property.seq ? `${S.listingNumber} #${property.seq} · ` : ''}
                {property.viewCount} {S.views}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky WhatsApp CTA */}
      <View className="absolute bottom-0 left-0 right-0 px-5 py-3 bg-background border-t border-border">
        <Pressable
          onPress={openWhatsApp}
          className="bg-primary rounded-xl py-3.5 flex-row items-center justify-center gap-2 active:opacity-90">
          <MessageCircle size={20} color="#FFFFFF" />
          <Text className="text-primary-foreground font-cairo-bold text-base">{S.contactOwner}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="bg-secondary rounded-lg px-3 py-2.5 flex-row items-center gap-2 min-w-[30%]">
      {icon}
      <View>
        <Text className="text-[11px] text-muted-foreground font-cairo">{label}</Text>
        <Text className="text-sm text-foreground font-cairo-semibold">{value}</Text>
      </View>
    </View>
  );
}
