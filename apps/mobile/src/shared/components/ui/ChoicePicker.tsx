import { Check, ChevronDown, X } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { ResponsivePage } from '@/shared/components/layout/ResponsivePage';

/**
 * A compact categorical form field that opens a page-sheet list, matching the
 * governorate picker's interaction without rendering a large group of chips.
 */
export function ChoicePicker({
  value,
  onChange,
  options,
  labels,
  placeholder,
  title,
}: {
  value?: string;
  onChange: (value: string) => void;
  options: readonly string[];
  labels: Readonly<Record<string, string>>;
  placeholder: string;
  title: string;
}) {
  const c = useThemeColors();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const pick = (next: string) => {
    onChange(next);
    close();
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center bg-secondary border border-border rounded-xl px-4 h-12 active:opacity-80">
        <ChevronDown size={18} color={c.muted} />
        <Text
          className={`flex-1 ml-2 text-right ${value ? 'font-cairo' : 'font-cairo-medium'}`}
          style={{ color: value ? c.foreground : c.muted }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          maxFontSizeMultiplier={1.15}>
          {value ? labels[value] : placeholder}
        </Text>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}>
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
          <ResponsivePage size="compact">
            <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
              <Pressable onPress={close} hitSlop={8}>
                <X size={22} color={c.foreground} />
              </Pressable>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                className="flex-1 mx-2 text-center text-base font-cairo-bold text-foreground">
                {title}
              </Text>
              <View style={{ width: 22 }} />
            </View>

            <FlatList
              data={[...options]}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 6, paddingBottom: 24 }}
              ItemSeparatorComponent={() => <View className="h-px bg-border/60 mx-5" />}
              renderItem={({ item }) => {
                const active = item === value;
                return (
                  <Pressable
                    onPress={() => pick(item)}
                    className={`flex-row items-center justify-between px-5 py-4 active:bg-secondary ${active ? 'bg-primary/5' : ''}`}>
                    {active ? (
                      <Check size={20} color={c.accent} strokeWidth={2.5} />
                    ) : (
                      <View style={{ width: 20 }} />
                    )}
                    <Text
                      className={`text-[15px] text-right ${active ? 'font-cairo-bold text-accent' : 'font-cairo-medium text-foreground'}`}>
                      {labels[item] ?? item}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </ResponsivePage>
        </SafeAreaView>
      </Modal>
    </>
  );
}
