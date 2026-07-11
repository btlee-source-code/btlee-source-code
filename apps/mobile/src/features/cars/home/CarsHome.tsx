import { useRouter } from 'expo-router';
import { Car, CarFront, Caravan, Search, SlidersHorizontal, Truck } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { carsApi } from '@/features/cars/api/cars.api';
import { CarSection } from '@/features/cars/components/CarSection';
import { CAR_BODY_TYPE_LABELS } from '@/features/cars/lib/carConstants';
import { AnimatedSearchHint } from '@/features/home/components/AnimatedSearchHint';
import { HomeTopBar } from '@/features/home/components/HomeTopBar';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { RailArrows } from '@/shared/components/ui/RailArrows';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { useTabPressScrollToTop } from '@/shared/hooks/useTabPressScrollToTop';
import { shadows } from '@/shared/lib/shadows';
import type { CarBodyType } from '@/shared/types/car';

const CATEGORIES: { type: CarBodyType; Icon: typeof Car }[] = [
  { type: 'sedan', Icon: Car },
  { type: 'suv', Icon: CarFront },
  { type: 'hatchback', Icon: Car },
  { type: 'pickup', Icon: Truck },
  { type: 'minivan', Icon: Caravan },
  { type: 'crossover', Icon: CarFront },
];

// Curated cars carousels — each hides itself when empty (safe to always render).
const rentFetcher = () => carsApi.list({ listingType: 'rent', limit: 10 }).then((r) => r.data);
const saleFetcher = () => carsApi.list({ listingType: 'sale', limit: 10 }).then((r) => r.data);

export function CarsHome() {
  const router = useRouter();
  const c = useThemeColors();

  const railRef = useRef<ScrollView>(null);
  const railX = useRef(0);
  const stepRail = (dir: 1 | -1) =>
    railRef.current?.scrollTo({ x: Math.max(0, railX.current + dir * 200), animated: true });

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
        <View className="px-6 pt-7 items-center">
          <Text className="text-[26px] leading-[38px] font-cairo-bold text-foreground text-center">
            {S.carsHeroLead} <Text className="text-accent">{S.carsHeroEmphasis}</Text>
          </Text>
          <Text className="text-sm leading-6 text-muted-foreground font-cairo text-center mt-1.5">
            {S.carsHeroSubtitle}
          </Text>
        </View>

        {/* Search — opens the cars list (search tab) */}
        <View className="px-5 mt-6">
          <PressableScale
            haptic
            scaleTo={0.98}
            onPress={() => router.push('/properties')}
            className="flex-row items-center gap-3 bg-card border border-border rounded-2xl pl-3.5 pr-4 py-3.5"
            style={shadows.sm}>
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

        {/* Body-type rail */}
        <View className="mt-8 gap-4">
          <SectionHeader title={S.carsExploreByType} onViewAll={() => router.push('/properties')} />
          <View>
            <ScrollView
              ref={railRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => (railX.current = e.nativeEvent.contentOffset.x)}
              scrollEventThrottle={32}
              contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 4, gap: 10 }}>
              {CATEGORIES.map(({ type, Icon }) => (
                <Pressable
                  key={type}
                  onPress={() => router.push({ pathname: '/properties', params: { bodyType: type } })}
                  className="items-center justify-center gap-2 min-w-[86px] h-[84px] rounded-2xl border border-border bg-card px-4 active:bg-secondary"
                  style={shadows.sm}>
                  <Icon size={23} color={c.accent} strokeWidth={1.6} />
                  <Text className="text-xs font-cairo-semibold text-foreground">{CAR_BODY_TYPE_LABELS[type]}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <RailArrows top={4 + (84 - 36) / 2} onStep={stepRail} />
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
