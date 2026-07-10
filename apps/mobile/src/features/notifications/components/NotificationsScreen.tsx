import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowRight, Bell, CheckCheck } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatDate } from '@/shared/lib/format';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import type { Notification } from '@/shared/types/notification';
import { notificationsActions } from '../store/notifications.slice';
import { notificationsApi } from '../api/notifications.api';

const PRIMARY = '#1A3C34';
const MUTED = '#737373';

export function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const { data, meta } = await notificationsApi.list();
      setItems(data);
      dispatch(notificationsActions.setUnreadCount(meta.unreadCount));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, dispatch]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const onRefresh = () => {
    setRefreshing(true);
    reload();
  };

  const onMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    dispatch(notificationsActions.clearUnread());
    await notificationsApi.markAllRead().catch(() => {});
  };

  const onTap = async (n: Notification) => {
    if (!n.isRead) {
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
      dispatch(notificationsActions.decrementUnread());
      notificationsApi.markRead(n._id).catch(() => {});
    }
    // Map the web `link` path to a mobile route. `/saved-searches` and null
    // links have no mobile target yet, so they only mark-read.
    if (n.link?.startsWith('/properties/')) {
      const id = n.link.split('/properties/')[1];
      if (id) router.push(`/properties/${id}`);
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator color={PRIMARY} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowRight size={24} color={PRIMARY} />
        </Pressable>
        <Text className="text-lg font-cairo-bold text-foreground">{S.notificationsTitle}</Text>
        {isAuthenticated && unreadCount > 0 ? (
          <Pressable onPress={onMarkAll} hitSlop={8} className="flex-row items-center gap-1 active:opacity-70">
            <CheckCheck size={16} color={PRIMARY} />
            <Text className="text-xs font-cairo-medium text-primary">{S.markAllRead}</Text>
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {!isAuthenticated ? (
        <View className="flex-1 items-center justify-center px-10 gap-4">
          <Text className="text-lg font-cairo-bold text-foreground text-center">{S.profileGuestTitle}</Text>
          <Pressable onPress={() => router.push('/login')} className="bg-primary rounded-xl px-6 py-3 active:opacity-90">
            <Text className="text-primary-foreground font-cairo-semibold">{S.signInTitle}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n._id}
          contentContainerClassName="px-4 py-3"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onTap(item)}
              className={`flex-row gap-3 p-3 rounded-xl mb-2 border border-border active:opacity-90 ${
                item.isRead ? 'bg-card' : 'bg-secondary/50'
              }`}>
              <View className="pt-1.5">
                <View className={`h-2 w-2 rounded-full ${item.isRead ? 'bg-transparent' : 'bg-accent'}`} />
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-sm font-cairo-semibold text-foreground text-right" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-xs text-muted-foreground font-cairo text-right" numberOfLines={2}>
                  {item.message}
                </Text>
                <Text className="text-[11px] text-muted-foreground font-cairo text-right">{formatDate(item.createdAt)}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            loading ? (
              <View className="items-center py-20">
                <ActivityIndicator color={PRIMARY} />
              </View>
            ) : (
              <View className="items-center py-16 gap-2">
                <View className="h-16 w-16 rounded-full bg-secondary items-center justify-center mb-1">
                  <Bell size={28} color={MUTED} />
                </View>
                <Text className="text-lg font-cairo-bold text-foreground">{S.notificationsEmpty}</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
