import { useRouter } from 'expo-router';
import { FileX2, Home, ListChecks } from 'lucide-react-native';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { shadows } from '@/shared/lib/shadows';
import { ResponsivePage } from './ResponsivePage';

type ListingKind = 'property' | 'car';

/**
 * A friendly destination for stale listing links, including links kept in old
 * notifications after their property or car has been deleted.
 */
export function DeletedListingState({ kind }: { kind: ListingKind }) {
  const router = useRouter();
  const c = useThemeColors();
  const myListingsRoute = kind === 'car' ? '/my-cars' : '/my-properties';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ResponsivePage
        size="compact"
        style={{ justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 28 }}>
        <Animated.View
          entering={FadeInDown.springify().damping(16)}
          className="w-full items-center rounded-[28px] border border-border bg-card px-6 py-8"
          style={shadows.md}>
          <View
            className="h-24 w-24 items-center justify-center rounded-full border"
            style={{
              backgroundColor: `${c.destructive}12`,
              borderColor: `${c.destructive}33`,
            }}>
            <View
              className="h-[68px] w-[68px] items-center justify-center rounded-full bg-card"
              style={shadows.sm}>
              <FileX2 size={34} color={c.destructive} strokeWidth={1.7} />
            </View>
          </View>

          <Text className="mt-5 text-sm font-cairo-semibold text-destructive text-center">
            {S.deletedListingEyebrow}
          </Text>
          <Text className="mt-1 text-2xl font-cairo-bold text-foreground text-center">
            {S.deletedListingTitle}
          </Text>
          <Text className="mt-2 text-sm leading-7 font-cairo text-muted-foreground text-center">
            {S.deletedListingDescription}
          </Text>

          <View className="mt-6 w-full gap-3">
            <PressableScale
              haptic
              onPress={() => router.replace(myListingsRoute)}
              containerClassName="w-full"
              className="min-h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2">
              <ListChecks size={18} color={c.primaryForeground} />
              <Text
                numberOfLines={2}
                maxFontSizeMultiplier={1.2}
                className="font-cairo-bold text-primary-foreground text-center">
                {S.deletedListingMyListings}
              </Text>
            </PressableScale>

            <PressableScale
              haptic
              onPress={() => router.replace('/')}
              containerClassName="w-full"
              className="min-h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-secondary px-5 py-2">
              <Home size={18} color={c.foreground} />
              <Text
                numberOfLines={2}
                maxFontSizeMultiplier={1.2}
                className="font-cairo-semibold text-foreground text-center">
                {S.deletedListingHome}
              </Text>
            </PressableScale>
          </View>
        </Animated.View>
      </ResponsivePage>
    </SafeAreaView>
  );
}
