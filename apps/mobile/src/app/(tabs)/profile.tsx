import { LogIn, User } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';

export default function ProfileTab() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 items-center justify-center px-10 gap-4">
        <View className="h-20 w-20 rounded-full bg-secondary items-center justify-center">
          <User size={34} color="#1A3C34" />
        </View>
        <Text className="text-lg font-cairo-bold text-foreground text-center">{S.profileGuestTitle}</Text>
        <Text className="text-sm text-muted-foreground font-cairo text-center">{S.profileGuestDesc}</Text>
        <Pressable
          disabled
          className="mt-1 bg-primary rounded-xl px-6 py-3 flex-row items-center gap-2 opacity-60">
          <LogIn size={18} color="#FFFFFF" />
          <Text className="text-primary-foreground font-cairo-semibold">
            تسجيل الدخول ({S.comingSoon})
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
