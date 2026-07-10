import { useRouter } from 'expo-router';
import {
  Building2,
  Factory,
  Home,
  Hotel,
  Moon,
  Search,
  SlidersHorizontal,
  Store,
  Sun,
  Tent,
} from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { AnimatedSearchHint } from '@/features/home/components/AnimatedSearchHint';
import { PropertySection } from '@/features/home/components/PropertySection';
import { NotificationsBell } from '@/features/notifications/components/NotificationsBell';
import { propertiesApi } from '@/features/properties/api/properties.api';
import { useTheme, useThemeColors } from '@/features/theme/hooks/useTheme';
import { Logo } from '@/shared/components/layout/Logo';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { RailArrows } from '@/shared/components/ui/RailArrows';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { useTabPressScrollToTop } from '@/shared/hooks/useTabPressScrollToTop';
import { TYPE_LABELS } from '@/shared/lib/constants';
import { shadows } from '@/shared/lib/shadows';
import type { PropertyType } from '@/shared/types/property';

const CATEGORIES: { type: PropertyType; Icon: typeof Building2 }[] = [
  { type: 'apartment', Icon: Building2 },
  { type: 'villa', Icon: Home },
  { type: 'chalet', Icon: Tent },
  { type: 'shop', Icon: Store },
  { type: 'building', Icon: Hotel },
  { type: 'factory', Icon: Factory },
];

// Curated home carousels beyond featured/latest — each is a distinct, logical
// slice (listing type / city). An empty slice hides its own section, so these
// are safe to always render.
const rentFetcher = () => propertiesApi.list({ listingType: 'rent', limit: 10 }).then((r) => r.data);
const saleFetcher = () => propertiesApi.list({ listingType: 'sale', limit: 10 }).then((r) => r.data);
const cityFetcher = () => propertiesApi.list({ governorate: 'القاهرة', limit: 10 }).then((r) => r.data);

export default function HomeScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const { isDark, toggle } = useTheme();

  // Category rail scroll position — drives the arrow buttons.
  const railRef = useRef<ScrollView>(null);
  const railX = useRef(0);
  const stepRail = (dir: 1 | -1) =>
    railRef.current?.scrollTo({ x: Math.max(0, railX.current + dir * 200), animated: true });

  // Re-pressing the home tab scrolls back to the top.
  const scrollRef = useRef<ScrollView>(null);
  useTabPressScrollToTop(() => scrollRef.current?.scrollTo({ y: 0, animated: true }));

  // Pull-to-refresh: bump the token so both carousels refetch.
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
        {/* Top bar: wordmark + quiet utility controls */}
        <View className="flex-row items-center justify-between px-5 pt-3">
          <Logo height={26} />
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={toggle}
              hitSlop={6}
              className="h-10 w-10 rounded-full border border-border bg-card items-center justify-center active:opacity-70">
              {isDark ? <Sun size={18} color={c.foreground} /> : <Moon size={18} color={c.foreground} />}
            </Pressable>
            <NotificationsBell />
          </View>
        </View>

        {/* Hero — centered, with the value phrase picked out in gold */}
        <View className="px-6 pt-7 items-center">
          <Text className="text-[26px] leading-[38px] font-cairo-bold text-foreground text-center">
            {S.heroTitleLead} <Text className="text-accent">{S.heroTitleEmphasis}</Text>
          </Text>
          <Text className="text-sm leading-6 text-muted-foreground font-cairo text-center mt-1.5">
            {S.heroSubtitle}
          </Text>
        </View>

        {/* Search — a chic, understated field: a plain grey magnifier, a
            rotating example hint that seeds ideas, and a subtle filter
            shortcut (refine by price/area/rooms). */}
        <View className="px-5 mt-6">
          <PressableScale
            haptic
            scaleTo={0.98}
            onPress={() => router.push({ pathname: '/properties', params: { openSearch: '1' } })}
            className="flex-row items-center gap-3 bg-card border border-border rounded-2xl pl-3.5 pr-4 py-3.5"
            style={shadows.sm}>
            {/* Magnifier — no background, muted grey (RTL start = right) */}
            <Search size={22} color={c.muted} strokeWidth={2} />
            <View className="flex-1">
              <Text className="text-[15px] font-cairo-semibold text-foreground text-right">{S.searchPillTitle}</Text>
              <AnimatedSearchHint
                prefix={S.searchExamplePrefix}
                examples={S.searchExamples}
                className="text-xs text-muted-foreground font-cairo text-right"
              />
            </View>
            {/* Subtle divider + filter affordance (RTL end = left) */}
            <View className="w-px h-7 bg-border" />
            <SlidersHorizontal size={20} color={c.muted} />
          </PressableScale>
        </View>

        {/* Category rail */}
        <View className="mt-8 gap-4">
          <SectionHeader title={S.exploreByType} onViewAll={() => router.push('/properties')} />
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
                  onPress={() => router.push({ pathname: '/properties', params: { type } })}
                  className="items-center justify-center gap-2 min-w-[86px] h-[84px] rounded-2xl border border-border bg-card px-4 active:bg-secondary"
                  style={shadows.sm}>
                  <Icon size={23} color={c.accent} strokeWidth={1.6} />
                  <Text className="text-xs font-cairo-semibold text-foreground">{TYPE_LABELS[type]}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {/* 4px rail padding + centers the 36px button on the 84px chips */}
            <RailArrows top={4 + (84 - 36) / 2} onStep={stepRail} />
          </View>
        </View>

        {/* Featured carousel */}
        <View className="mt-8">
          <PropertySection
            title={S.featuredTitle}
            fetcher={propertiesApi.featured}
            cacheKey="home-featured"
            refreshToken={refreshToken}
          />
        </View>

        {/* For rent */}
        <View className="mt-8">
          <PropertySection
            title={S.rentSectionTitle}
            fetcher={rentFetcher}
            cacheKey="home-rent"
            refreshToken={refreshToken}
            viewAllParams={{ listingType: 'rent' }}
          />
        </View>

        {/* Latest carousel */}
        <View className="mt-8">
          <PropertySection
            title={S.latestTitle}
            fetcher={propertiesApi.latest}
            cacheKey="home-latest"
            refreshToken={refreshToken}
          />
        </View>

        {/* For sale */}
        <View className="mt-8">
          <PropertySection
            title={S.saleSectionTitle}
            fetcher={saleFetcher}
            cacheKey="home-sale"
            refreshToken={refreshToken}
            viewAllParams={{ listingType: 'sale' }}
          />
        </View>

        {/* Properties in Cairo */}
        <View className="mt-8">
          <PropertySection
            title={S.citySectionTitle}
            fetcher={cityFetcher}
            cacheKey="home-cairo"
            refreshToken={refreshToken}
            viewAllParams={{ governorate: 'القاهرة' }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
