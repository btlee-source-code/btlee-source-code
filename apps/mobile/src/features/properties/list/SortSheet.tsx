import { Check } from 'lucide-react-native';
import { Modal, Pressable, Text, View } from 'react-native';

import { S } from '@/config/strings';
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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onClose}>
        <Pressable className="bg-background rounded-t-3xl px-5 pt-5 pb-9 gap-1" onPress={() => {}}>
          <Text className="text-lg font-cairo-bold text-foreground text-right mb-2">{S.sortTitle}</Text>
          {SORT_OPTIONS.map((opt) => {
            const active = value === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => {
                  onSelect(opt.value);
                  onClose();
                }}
                className="flex-row items-center justify-between py-3 active:opacity-70">
                {active ? <Check size={20} color="#1A3C34" /> : <View style={{ width: 20 }} />}
                <Text className={`font-cairo-medium text-base ${active ? 'text-primary' : 'text-foreground'}`}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
