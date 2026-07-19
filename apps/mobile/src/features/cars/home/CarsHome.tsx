import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CAR_ICONS } from '@/assets/icons3d/registry';
import { S } from '@/config/strings';
import { carsApi } from '@/features/cars/api/cars.api';
import { CarSection } from '@/features/cars/components/CarSection';
import { CAR_BODY_TYPE_LABELS } from '@/features/cars/lib/carConstants';
import { AnimatedSearchHint } from '@/features/home/components/AnimatedSearchHint';
import { CategoryChip } from '@/features/home/components/CategoryChip';
import { HomeTopBar } from '@/features/home/components/HomeTopBar';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { useTabPressScrollToTop } from '@/shared/hooks/useTabPressScrollToTop';
import { shadows } from '@/shared/lib/shadows';
import type { CarBodyType } from '@/shared/types/car';

const CATEGORIES: CarBodyType[] = ['sedan', 'suv', 'hatchback', 'pickup', 'minivan', 'crossover'];

// Curated cars carousels — each hides itself when empty (safe to always render).
const rentFetcher = () => carsApi.list({ listingType: 'rent', limit: 10 }).then((r) => r.data);
const saleFetcher = () => carsApi.list({ listingType: 'sale', limit: 10 }).then((r) => r.data);

export function CarsHome() {
  const router = useRouter();
  const c = useThemeColors();
  const { width } = useWindowDimensions();
  const compactCategories = width < 360;

  const scrollRef = useRef<ScrollView>(null);
  useTabPressScrollToTop(() => scrollRef.current?.scrollTo({ y: 0, animated: true }));

  const [refreshing, setRefreshing] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const onRefresh = () => {
    setRefreshing(true);
    setRefreshToken((t) => t + 1);
    setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-12"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.primary}
            colors={[c.primary]}
            progressBackgroundColor={c.card}
          />
        }>
        {/* Shared header: logo + section switcher + utility controls */}
        <HomeTopBar />

        {/* Hero — value phrase picked out in the section accent */}
        <View className="px-6 pt-10 items-center">
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            className="text-[26px] leading-[38px] font-cairo-bold text-foreground text-center">
            {S.carsHeroLead} <Text className="text-accent">{S.carsHeroEmphasis}</Text>
          </Text>
          <Text className="text-sm leading-6 text-muted-foreground font-cairo text-center mt-1.5">
            {S.carsHeroSubtitle}
          </Text>
        </View>

        {/* Search — opens the unified cars search + filter sheet on the search tab */}
        <View className="mt-6">
          <PressableScale
            haptic
            scaleTo={0.98}
            onPress={() => router.push({ pathname: '/properties', params: { openSearch: '1' } })}
            className="flex-row items-center gap-3 bg-card border-y px-5 py-1.5"
            style={[shadows.sm, { borderColor: `${c.accent}4D` }]}>
            <Search size={22} color={c.muted} strokeWidth={2} />
            <View className="flex-1">
              <Text className="text-[15px] font-cairo-semibold text-foreground text-right">
                {S.carsSearchPillTitle}
              </Text>
              <AnimatedSearchHint
                prefix={S.searchExamplePrefix}
                examples={S.carsSearchExamples}
                className="text-xs text-muted-foreground font-cairo text-right"
              />
            </View>
            <View className="w-px h-7 bg-border" />
            <SlidersHorizontal size={20} color={c.muted} />
          </PressableScale>
        </View>

        {/* Body-type grid — 3 across, stacked, RTL (first type reads top-right) */}
        <View className="mt-8 gap-4">
          <SectionHeader title={S.carsExploreByType} onViewAll={() => router.push('/properties')} />
          <View className="flex-row-reverse flex-wrap justify-between gap-y-4 px-5">
            {CATEGORIES.map((type, i) => (
              <View key={type} style={{ width: compactCategories ? '47%' : '30%' }}>
                <CategoryChip
                  label={CAR_BODY_TYPE_LABELS[type]}
                  icon={CAR_ICONS[type]}
                  accent={c.accent}
                  index={i}
                  onPress={() => router.push({ pathname: '/properties', params: { bodyType: type } })}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Featured */}
        <View className="mt-8">
          <CarSection title={S.carsFeaturedTitle} fetcher={carsApi.featured} cacheKey="cars-featured" refreshToken={refreshToken} />
        </View>

        {/* For sale */}
        <View className="mt-8">
          <CarSection
            title={S.carsSaleSectionTitle}
            fetcher={saleFetcher}
            cacheKey="cars-sale"
            refreshToken={refreshToken}
            viewAllParams={{ listingType: 'sale' }}
          />
        </View>

        {/* Latest */}
        <View className="mt-8">
          <CarSection title={S.carsLatestTitle} fetcher={carsApi.latest} cacheKey="cars-latest" refreshToken={refreshToken} />
        </View>

        {/* For rent */}
        <View className="mt-8">
          <CarSection
            title={S.carsRentSectionTitle}
            fetcher={rentFetcher}
            cacheKey="cars-rent"
            refreshToken={refreshToken}
            viewAllParams={{ listingType: 'rent' }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
