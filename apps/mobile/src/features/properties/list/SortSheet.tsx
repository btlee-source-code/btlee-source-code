import { Check } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { BottomSheet } from '@/shared/components/ui/BottomSheet';
import { tapHaptic } from '@/shared/lib/haptics';
import { SORT_OPTIONS } from '@/shared/lib/constants';

export type SortValue = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

export function SortSheet({
  visible,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: SortValue;
  onSelect: (v: SortValue) => void;
  onClose: () => void;
}) {
  const c = useThemeColors();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={S.sortTitle}>
      <View className="gap-1 pt-1 pb-2">
        {SORT_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => {
                tapHaptic();
                onSelect(opt.value);
                onClose();
              }}
              className={`flex-row items-center justify-between rounded-2xl px-4 py-3.5 active:bg-secondary ${
                active ? 'bg-primary/5' : ''
              }`}>
              {active ? <Check size={20} color={c.primary} /> : <View style={{ width: 20 }} />}
              <Text className={`font-cairo-medium text-base ${active ? 'text-primary' : 'text-foreground'}`}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}
