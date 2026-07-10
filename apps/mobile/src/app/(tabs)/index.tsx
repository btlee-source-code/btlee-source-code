import { useRouter } from 'expo-router';
import { Building2, ChevronLeft, Factory, Home, Hotel, Moon, Plus, Search, Store, Sun, Tent } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { PropertySection } from '@/features/home/components/PropertySection';
import { NotificationsBell } from '@/features/notifications/components/NotificationsBell';
import { propertiesApi } from '@/features/properties/api/properties.api';
import { useTheme, useThemeColors } from '@/features/theme/hooks/useTheme';
import { Logo } from '@/shared/components/layout/Logo';
import { TYPE_LABELS } from '@/shared/lib/constants';
import type { PropertyType } from '@/shared/types/property';

const CATEGORIES: { type: PropertyType; Icon: typeof Building2 }[] = [
  { type: 'apartment', Icon: Building2 },
  { type: 'villa', Icon: Home },
  { type: 'chalet', Icon: Tent },
  { type: 'shop', Icon: Store },
  { type: 'building', Icon: Hotel },
  { type: 'factory', Icon: Factory },
];

export default function HomeScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const { isDark, toggle } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pt-3 pb-8 gap-6" showsVerticalScrollIndicator={false}>
        {/* Header: logo + theme toggle + notifications */}
        <View className="flex-row items-center justify-between">
          <Logo height={30} />
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={toggle}
              hitSlop={6}
              className="h-10 w-10 rounded-full bg-secondary items-center justify-center active:opacity-80">
              {isDark ? <Sun size={19} color={c.foreground} /> : <Moon size={19} color={c.foreground} />}
            </Pressable>
            <NotificationsBell />
          </View>
        </View>

        {/* Greeting + prominent search */}
        <View className="gap-3">
          <View className="gap-1">
            <Text className="text-2xl font-cairo-bold text-foreground text-right">{S.heroTitle} 🏠</Text>
            <Text className="text-sm text-muted-foreground font-cairo text-right">{S.heroSubtitle}</Text>
          </View>
          <Pressable
            onPress={() => router.push({ pathname: '/properties', params: { openSearch: '1' } })}
            className="flex-row items-center bg-secondary rounded-2xl px-4 h-14 active:opacity-90">
            <Search size={22} color={c.muted} />
            <Text className="flex-1 mx-3 text-muted-foreground font-cairo text-right" numberOfLines={1}>
              {S.searchPlaceholder}
            </Text>
          </Pressable>
        </View>

        {/* Quick actions */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => router.push('/add-property')}
            className="flex-1 bg-primary rounded-2xl p-4 gap-2 active:opacity-90">
            <View className="h-9 w-9 rounded-full bg-white/15 items-center justify-center">
              <Plus size={20} color={c.primaryForeground} />
            </View>
            <Text className="text-primary-foreground font-cairo-bold text-right">{S.addNew}</Text>
            <Text className="text-primary-foreground/70 font-cairo text-xs text-right">{S.addListingSub}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/properties')}
            className="flex-1 bg-accent rounded-2xl p-4 gap-2 active:opacity-90">
            <View className="h-9 w-9 rounded-full bg-white/15 items-center justify-center">
              <Building2 size={20} color={c.accentForeground} />
            </View>
            <Text className="text-accent-foreground font-cairo-bold text-right">{S.browseProps}</Text>
            <Text className="text-accent-foreground/70 font-cairo text-xs text-right">{S.browsePropsSub}</Text>
          </Pressable>
        </View>

        {/* Explore by type */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={() => router.push('/properties')} hitSlop={6}>
              <Text className="text-primary font-cairo-semibold text-sm">{S.viewAll}</Text>
            </Pressable>
            <Text className="text-lg font-cairo-bold text-foreground text-right">{S.exploreByType}</Text>
          </View>
          <View className="flex-row flex-wrap gap-3 justify-between">
            {CATEGORIES.map(({ type, Icon }) => (
              <Pressable
                key={type}
                onPress={() => router.push({ pathname: '/properties', params: { type } })}
                className="items-center gap-2 bg-card border border-border rounded-2xl py-3.5 active:opacity-80"
                style={{ width: '31%' }}>
                <View className="h-11 w-11 rounded-full bg-secondary items-center justify-center">
                  <Icon size={22} color={c.primary} />
                </View>
                <Text className="text-xs font-cairo-medium text-foreground">{TYPE_LABELS[type]}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Featured + latest carousels (public endpoints) */}
        <PropertySection title={S.featuredTitle} fetcher={propertiesApi.featured} cacheKey="home-featured" />
        <PropertySection title={S.latestTitle} fetcher={propertiesApi.latest} cacheKey="home-latest" />

        {/* List-your-property banner */}
        <Pressable
          onPress={() => router.push('/add-property')}
          className="bg-secondary rounded-2xl p-4 flex-row items-center gap-3 active:opacity-90">
          <View className="h-12 w-12 rounded-full bg-primary items-center justify-center">
            <Plus size={24} color={c.primaryForeground} />
          </View>
          <View className="flex-1">
            <Text className="font-cairo-bold text-foreground text-right">{S.listYourProperty}</Text>
            <Text className="text-xs text-muted-foreground font-cairo text-right">{S.listYourPropertySub}</Text>
          </View>
          <ChevronLeft size={20} color={c.muted} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
