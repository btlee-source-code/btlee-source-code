import { Check, ChevronDown, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';

/** Thousands separators without relying on Intl (Hermes-safe). */
const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * Numeric-range value selector — a field-like button that opens a full-screen
 * sheet of preset amounts to pick from directly (with an optional free-typed
 * value), mirroring the GovernoratePicker. Used for the price "from/to" and the
 * area filters so they're a tap-and-choose instead of manual typing.
 *
 * `minBound`/`maxBound` clamp which presets show, so a "from" picker never
 * offers a value above the chosen "to" (and vice-versa).
 */
export function AmountPicker({
  value,
  onChange,
  options,
  placeholder,
  title,
  suffix,
  minBound,
  maxBound,
  clearLabel,
  clearable = true,
}: {
  value?: number;
  onChange: (n?: number) => void;
  options: number[];
  placeholder: string;
  title: string;
  suffix?: string;
  minBound?: number;
  maxBound?: number;
  /** Label for the top "clear selection" row. Defaults to "all" (filter
   *  context); forms pass "not specified" since the value is optional there. */
  clearLabel?: string;
  /** Whether the value can be cleared. Off for required fields (e.g. bedroom
   *  count) so there's no "clear" row. */
  clearable?: boolean;
}) {
  const c = useThemeColors();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');

  const list = useMemo(() => {
    const inBounds = options.filter(
      (o) => (minBound == null || o >= minBound) && (maxBound == null || o <= maxBound),
    );
    const t = parseInt(typed.replace(/[^\d]/g, ''), 10);
    // Float a valid free-typed amount to the top so it's directly selectable.
    if (!Number.isNaN(t) && t > 0 && !inBounds.includes(t)) return [t, ...inBounds];
    return inBounds;
  }, [options, minBound, maxBound, typed]);

  const close = () => {
    setOpen(false);
    setTyped('');
  };
  const pick = (n?: number) => {
    onChange(n);
    close();
  };

  const label = (n: number) => (suffix ? `${fmt(n)} ${suffix}` : fmt(n));

  return (
    <>
      {/* Trigger — looks like the input it replaces */}
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between bg-secondary rounded-xl px-4 h-12 active:opacity-80">
        <ChevronDown size={18} color={c.muted} />
        <Text
          className={`flex-1 mr-2 text-right ${value != null ? 'font-cairo' : 'font-cairo-medium'}`}
          style={{ color: value != null ? c.foreground : c.muted }}
          numberOfLines={1}>
          {value != null ? fmt(value) : placeholder}
        </Text>
      </Pressable>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
            <Pressable onPress={close} hitSlop={8}>
              <X size={22} color={c.foreground} />
            </Pressable>
            <Text className="text-base font-cairo-bold text-foreground">{title}</Text>
            <View style={{ width: 22 }} />
          </View>

          {/* Free-typed custom amount */}
          <View className="px-5 pt-3 pb-1">
            <TextInput
              value={typed}
              onChangeText={setTyped}
              keyboardType="numeric"
              placeholder={S.amountPickerCustom}
              placeholderTextColor={c.muted}
              className="bg-secondary rounded-xl px-4 h-11 text-foreground font-cairo text-right"
              textAlign="right"
            />
          </View>

          <FlatList
            data={list}
            keyExtractor={(n) => String(n)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            ItemSeparatorComponent={() => <View className="h-px bg-border/60 mx-5" />}
            ListHeaderComponent={
              clearable ? (
                <Pressable
                  onPress={() => pick(undefined)}
                  className="flex-row items-center justify-between px-5 py-3.5 active:bg-secondary">
                  {value == null ? <Check size={20} color={c.accent} /> : <View style={{ width: 20 }} />}
                  <Text
                    className={`text-[15px] text-right ${value == null ? 'font-cairo-bold text-accent' : 'font-cairo-medium text-foreground'}`}>
                    {clearLabel ?? S.all}
                  </Text>
                </Pressable>
              ) : null
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
                    {label(item)}
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

/** Preset price steps (EGP) offered in the price picker. */
export const PRICE_OPTIONS = [
  50_000, 100_000, 150_000, 200_000, 250_000, 300_000, 400_000, 500_000, 600_000, 750_000,
  1_000_000, 1_250_000, 1_500_000, 2_000_000, 2_500_000, 3_000_000, 4_000_000, 5_000_000,
  6_000_000, 8_000_000, 10_000_000, 15_000_000, 20_000_000, 30_000_000, 50_000_000,
];

/** Preset area steps (m²) offered in the area picker. */
export const AREA_OPTIONS = [
  50, 60, 70, 80, 90, 100, 120, 150, 180, 200, 250, 300, 350, 400, 500, 600, 800, 1000, 1500, 2000,
];

/** Preset small counts (bedrooms, bathrooms, …). */
export const COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
