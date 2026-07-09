import { Heart } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';

export default function WishlistTab() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 items-center justify-center px-10 gap-3">
        <View className="h-20 w-20 rounded-full bg-secondary items-center justify-center">
          <Heart size={34} color="#C4922A" />
        </View>
        <Text className="text-lg font-cairo-bold text-foreground text-center">{S.wishlistEmptyTitle}</Text>
        <Text className="text-sm text-muted-foreground font-cairo text-center">{S.wishlistEmptyDesc}</Text>
      </View>
    </SafeAreaView>
  );
}
