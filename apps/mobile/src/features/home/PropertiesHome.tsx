import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PROPERTY_ICONS } from '@/assets/icons3d/registry';
import { S } from '@/config/strings';
import { AnimatedSearchHint } from '@/features/home/components/AnimatedSearchHint';
import { CategoryChip } from '@/features/home/components/CategoryChip';
import { HomeTopBar } from '@/features/home/components/HomeTopBar';
import { PropertySection } from '@/features/home/components/PropertySection';
import { propertiesApi } from '@/features/properties/api/properties.api';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { RailArrows } from '@/shared/components/ui/RailArrows';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { useTabPressScrollToTop } from '@/shared/hooks/useTabPressScrollToTop';
import { TYPE_LABELS } from '@/shared/lib/constants';
import { shadows } from '@/shared/lib/shadows';
import type { PropertyType } from '@/shared/types/property';

const CATEGORIES: PropertyType[] = ['apartment', 'villa', 'chalet', 'shop', 'building', 'factory'];

// Curated home carousels beyond featured/latest — each is a distinct, logical
// slice (listing type / city). An empty slice hides its own section, so these
// are safe to always render.
const rentFetcher = () => propertiesApi.list({ listingType: 'rent', limit: 10 }).then((r) => r.data);
const saleFetcher = () => propertiesApi.list({ listingType: 'sale', limit: 10 }).then((r) => r.data);
const cityFetcher = () => propertiesApi.list({ governorate: 'القاهرة', limit: 10 }).then((r) => r.data);

export function PropertiesHome() {
  const router = useRouter();
  const c = useThemeColors();

  // Category rail scroll position — drives the arrow buttons.
  const railRef = useRef<ScrollView>(null);
  const railX = useRef(0);
  const railInit = useRef(false);
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
        {/* Shared header: logo + section switcher + utility controls */}
        <HomeTopBar />

        {/* Hero — centered, with the value phrase picked out in the accent */}
        <View className="px-6 pt-7 items-center">
          <Text className="text-[26px] leading-[38px] font-cairo-bold text-foreground text-center">
            {S.heroTitleLead} <Text className="text-accent">{S.heroTitleEmphasis}</Text>
          </Text>
          <Text className="text-sm leading-6 text-muted-foreground font-cairo text-center mt-1.5">
            {S.heroSubtitle}
          </Text>
        </View>

        {/* Search — opens the unified search + filter sheet */}
        <View className="px-5 mt-6">
          <PressableScale
            haptic
            scaleTo={0.98}
            onPress={() => router.push({ pathname: '/properties', params: { openSearch: '1' } })}
            className="flex-row items-center gap-3 bg-card border rounded-2xl pl-3.5 pr-4 py-3.5"
            style={[shadows.sm, { borderColor: `${c.accent}4D` }]}>
            <Search size={22} color={c.muted} strokeWidth={2} />
            <View className="flex-1">
              <Text className="text-[15px] font-cairo-semibold text-foreground text-right">{S.searchPillTitle}</Text>
              <AnimatedSearchHint
                prefix={S.searchExamplePrefix}
                examples={S.searchExamples}
                className="text-xs text-muted-foreground font-cairo text-right"
              />
            </View>
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
              // RTL rail: render categories reversed and start at the right edge,
              // so the list reads right-to-left (first category on the right).
              onContentSizeChange={() => {
                if (railInit.current) return;
                railInit.current = true;
                railRef.current?.scrollToEnd({ animated: false });
              }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 4, gap: 10 }}>
              {[...CATEGORIES].reverse().map((type, i) => (
                <CategoryChip
                  key={type}
                  label={TYPE_LABELS[type]}
                  icon={PROPERTY_ICONS[type]}
                  accent={c.accent}
                  index={i}
                  onPress={() => router.push({ pathname: '/properties', params: { type } })}
                />
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
