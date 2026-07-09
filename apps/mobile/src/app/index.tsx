import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Home screen — first Bt Lee-branded screen, styled with NativeWind using the
 * same design tokens as the web (primary forest green, gold accent, Cairo).
 * Real feature screens (search, listings, detail) come next.
 */
export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pt-4 pb-8 gap-6">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-primary">Bt Lee</Text>
          <View className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
            <Text className="text-base">🔔</Text>
          </View>
        </View>

        {/* Hero */}
        <View className="bg-primary rounded-xl p-6 gap-2">
          <Text className="text-primary-foreground text-xl font-bold">لاقي بيتك الجديد 🏠</Text>
          <Text className="text-primary-foreground text-sm opacity-80">
            آلاف العقارات للبيع والإيجار في مكان واحد
          </Text>
          <Pressable className="mt-3 self-start bg-accent rounded-lg px-5 py-2.5 active:opacity-90">
            <Text className="text-accent-foreground font-semibold">ابدأ البحث</Text>
          </Pressable>
        </View>

        {/* Sections */}
        <Text className="text-lg font-bold text-foreground">الأقسام</Text>
        <View className="flex-row gap-3">
          <View className="flex-1 bg-card border border-border rounded-lg p-4 gap-1">
            <Text className="text-2xl">🏠</Text>
            <Text className="text-foreground font-semibold">عقارات</Text>
            <Text className="text-muted-foreground text-xs">شقق · فيلات · محلات</Text>
          </View>
          <View className="flex-1 bg-card border border-border rounded-lg p-4 gap-1 opacity-60">
            <Text className="text-2xl">🚗</Text>
            <Text className="text-foreground font-semibold">عربيات</Text>
            <Text className="text-muted-foreground text-xs">قريباً</Text>
          </View>
        </View>

        {/* Brand-parity proof strip */}
        <View className="bg-secondary rounded-lg p-4 gap-2">
          <Text className="text-secondary-foreground font-semibold">هوية الموقع على الموبايل ✅</Text>
          <View className="flex-row gap-2">
            <View className="h-8 flex-1 rounded-md bg-primary" />
            <View className="h-8 flex-1 rounded-md bg-accent" />
            <View className="h-8 flex-1 rounded-md bg-status-approved" />
            <View className="h-8 flex-1 rounded-md bg-muted-foreground" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
