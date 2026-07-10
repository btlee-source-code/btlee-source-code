import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { PropertySection } from '@/features/home/components/PropertySection';
import { NotificationsBell } from '@/features/notifications/components/NotificationsBell';
import { propertiesApi } from '@/features/properties/api/properties.api';
import { Logo } from '@/shared/components/layout/Logo';
import { PROPERTY_TYPES, TYPE_LABELS } from '@/shared/lib/constants';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pt-3 pb-8 gap-6" showsVerticalScrollIndicator={false}>
        {/* Header: logo + notifications */}
        <View className="flex-row items-center justify-between">
          <Logo height={30} />
          <NotificationsBell />
        </View>

        {/* Hero */}
        <View className="bg-primary rounded-xl p-6 gap-2">
          <Text className="text-primary-foreground text-xl font-cairo-bold text-right">{S.heroTitle} 🏠</Text>
          <Text className="text-primary-foreground text-sm font-cairo opacity-80 text-right">{S.heroSubtitle}</Text>
          <Pressable
            onPress={() => router.push('/properties')}
            className="mt-3 self-end bg-accent rounded-lg px-5 py-2.5 flex-row items-center gap-2 active:opacity-90">
            <Search size={16} color="#FFFFFF" />
            <Text className="text-accent-foreground font-cairo-semibold">{S.startSearch}</Text>
          </Pressable>
        </View>

        {/* Explore by type */}
        <View className="gap-3">
          <Text className="text-lg font-cairo-bold text-foreground text-right">{S.exploreByType}</Text>
          <View className="flex-row flex-wrap gap-2 justify-end">
            {PROPERTY_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => router.push({ pathname: '/properties', params: { type } })}
                className="bg-secondary rounded-full px-4 py-2 active:opacity-80">
                <Text className="text-secondary-foreground font-cairo-medium text-sm">{TYPE_LABELS[type]}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Featured + latest carousels (public endpoints) */}
        <PropertySection title={S.featuredTitle} fetcher={propertiesApi.featured} cacheKey="home-featured" />
        <PropertySection title={S.latestTitle} fetcher={propertiesApi.latest} cacheKey="home-latest" />
      </ScrollView>
    </SafeAreaView>
  );
}
