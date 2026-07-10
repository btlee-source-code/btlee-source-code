import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { useAppSelector } from '@/shared/store/hooks';

/**
 * Header bell with a gold unread badge. The badge only appears for authenticated
 * users (guests always have unreadCount 0). Tapping opens the notifications
 * screen, which itself gates guests behind a sign-in prompt.
 */
export function NotificationsBell() {
  const router = useRouter();
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
  const c = useThemeColors();

  return (
    <Pressable
      onPress={() => router.push('/notifications')}
      hitSlop={6}
      className="h-10 w-10 rounded-full border border-border bg-card items-center justify-center active:opacity-70">
      <Bell size={18} color={c.foreground} />
      {unreadCount > 0 ? (
        <View
          className="absolute -top-1 -right-1 h-4 rounded-full bg-accent items-center justify-center px-1"
          style={{ minWidth: 16 }}>
          <Text className="text-[10px] font-cairo-bold text-accent-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
