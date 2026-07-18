import { Check, ChevronDown, MapPin, Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { GOVERNORATES } from '@/shared/lib/constants';

/**
 * Governorate selector — a single field-like button that opens a full-screen
 * sheet listing every governorate (searchable), instead of spilling all 27
 * chips inline. Reused by the search filters and the add-listing form so both
 * pick a governorate the same way. It's a full page sheet (not a nested bottom
 * sheet) so nothing from the screen behind — like the search modal's "show
 * results" bar — bleeds over the bottom of the list.
 */
export function GovernoratePicker({
  value,
  onChange,
  placeholder,
}: {
  value?: string;
  onChange: (g: string) => void;
  placeholder?: string;
}) {
  const c = useThemeColors();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim();
    return q ? GOVERNORATES.filter((g) => g.includes(q)) : GOVERNORATES;
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const pick = (g: string) => {
    onChange(g);
    close();
  };

  return (
    <>
      {/* Trigger — looks like a form field, shows the current choice */}
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center bg-secondary border border-border rounded-xl px-4 h-12 active:opacity-80">
        <MapPin size={18} color={value ? c.accent : c.muted} />
        <Text
          className={`flex-1 mx-2 text-right ${value ? 'font-cairo' : 'font-cairo-medium'}`}
          style={{ color: value ? c.foreground : c.muted }}
          numberOfLines={1}>
          {value || placeholder || S.govPickerPlaceholder}
        </Text>
        <ChevronDown size={18} color={c.muted} />
      </Pressable>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
            <Pressable onPress={close} hitSlop={8}>
              <X size={22} color={c.foreground} />
            </Pressable>
            <Text className="text-base font-cairo-bold text-foreground">{S.govPickerTitle}</Text>
            <View style={{ width: 22 }} />
          </View>

          {/* Search */}
          <View className="px-5 pt-3 pb-1">
            <View className="flex-row items-center bg-secondary border border-border rounded-xl px-3 h-11">
              <Search size={18} color={c.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={S.govPickerSearch}
                placeholderTextColor={c.muted}
                className="flex-1 mx-2 text-foreground font-cairo text-right"
                textAlign="right"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <X size={16} color={c.muted} />
                </Pressable>
              )}
            </View>
          </View>

          <FlatList
            data={results}
            keyExtractor={(g) => g}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            ItemSeparatorComponent={() => <View className="h-px bg-border/60 mx-5" />}
            ListEmptyComponent={
              <Text className="text-center font-cairo py-8" style={{ color: c.muted }}>
                {S.govPickerEmpty}
              </Text>
            }
            renderItem={({ item }) => {
              const active = item === value;
              return (
                <Pressable
                  onPress={() => pick(item)}
                  className="flex-row items-center justify-between px-5 py-3.5 active:bg-secondary">
                  {active ? <Check size={20} color={c.accent} /> : <View style={{ width: 20 }} />}
                  <Text
                    className={`text-[15px] text-right ${active ? 'font-cairo-bold text-accent' : 'font-cairo-medium text-foreground'}`}>
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}
