import { Image } from 'expo-image';
import { CarFront, Check, ChevronDown, ChevronLeft, Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Keyboard, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useLocale } from '@/features/i18n/hooks/useLocale';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { ResponsivePage } from '@/shared/components/layout/ResponsivePage';
import { AppTextInput } from '@/shared/components/ui/AppTextInput';
import { shadows } from '@/shared/lib/shadows';
import {
  CAR_MAKE_OPTIONS,
  POPULAR_CAR_MAKES,
  getCarMakeLabel,
  getCarMakeSearchText,
  normalizeCarMakeSearch,
} from '../lib/carMakeOptions';
import { getCarMakeLogo } from '../lib/carMakeLogos';

function MakeLogo({ make, small = false }: { make: string; small?: boolean }) {
  const c = useThemeColors();
  const logo = getCarMakeLogo(make);
  const size = small ? 34 : 48;
  const imageSize = small ? 30 : 42;

  return (
    <View
      className="items-center justify-center overflow-hidden bg-white border border-black/5"
      style={{
        width: size,
        height: size,
        borderRadius: small ? 11 : 15,
      }}>
      {logo ? (
        <Image
          source={logo}
          contentFit="contain"
          transition={120}
          style={{ width: imageSize, height: imageSize }}
        />
      ) : (
        <CarFront size={small ? 18 : 23} color={c.muted} strokeWidth={1.8} />
      )}
    </View>
  );
}

export function CarMakePicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (make: string) => void;
}) {
  const c = useThemeColors();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedCanonical = CAR_MAKE_OPTIONS.find(
    (make) => make.toLocaleLowerCase() === value?.toLocaleLowerCase()
  );

  const options = useMemo(() => {
    const all: string[] = [...CAR_MAKE_OPTIONS];
    if (value && !selectedCanonical) all.unshift(value);

    const normalizedQuery = normalizeCarMakeSearch(query);
    const filtered = normalizedQuery
      ? all.filter((make) => {
          const known = CAR_MAKE_OPTIONS.find((item) => item === make);
          const searchable = known ? getCarMakeSearchText(known) : make;
          return normalizeCarMakeSearch(searchable).includes(normalizedQuery);
        })
      : all;

    return filtered.sort((a, b) =>
      getCarMakeLabel(a, locale).localeCompare(getCarMakeLabel(b, locale), locale)
    );
  }, [locale, query, selectedCanonical, value]);

  const close = () => {
    Keyboard.dismiss();
    setQuery('');
    setOpen(false);
  };

  const pick = (make: string) => {
    onChange(make);
    close();
  };

  const selectedLabel = value ? getCarMakeLabel(value, locale) : null;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={S.carMakePickerPlaceholder}
        onPress={() => setOpen(true)}
        className="flex-row items-center bg-secondary border border-border rounded-xl px-3 h-12 active:opacity-80">
        <ChevronDown size={18} color={c.muted} />
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          maxFontSizeMultiplier={1.15}
          className={`flex-1 mx-3 text-right ${
            value ? 'font-cairo-semibold text-foreground' : 'font-cairo-medium text-muted-foreground'
          }`}>
          {selectedLabel ?? S.carMakePickerPlaceholder}
        </Text>
        {value ? (
          <MakeLogo make={selectedCanonical ?? value} small />
        ) : (
          <View className="h-[34px] w-[34px] rounded-[11px] bg-primary/10 border border-primary/20 items-center justify-center">
            <CarFront size={19} color={c.primary} strokeWidth={1.8} />
          </View>
        )}
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}>
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
          <ResponsivePage size="form">
          <View className="flex-row items-center border-b border-border px-4 py-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={S.cancel}
              onPress={close}
              hitSlop={8}
              className="h-10 w-10 rounded-full bg-secondary items-center justify-center active:opacity-70">
              <X size={20} color={c.foreground} />
            </Pressable>
            <View className="flex-1 items-end px-3">
              <Text className="text-lg font-cairo-bold text-foreground text-right">
                {S.carMakePickerTitle}
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                className="text-xs font-cairo text-muted-foreground text-right">
                {S.carMakePickerSubtitle}
              </Text>
            </View>
            <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
              <CarFront size={21} color={c.primary} strokeWidth={1.8} />
            </View>
          </View>

          <View className="px-4 pt-4 pb-3">
            <View
              className="flex-row items-center bg-card border border-border rounded-2xl px-4 h-[52px]"
              style={shadows.sm}>
              <Search size={20} color={query ? c.primary : c.muted} />
              <AppTextInput
                value={query}
                onChangeText={setQuery}
                placeholder={S.carMakePickerSearch}
                placeholderTextColor={c.muted}
                textAlign="right"
                returnKeyType="search"
                className="flex-1 mx-3 text-foreground font-cairo text-right"
                style={{ minWidth: 0, fontSize: 13 }}
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <X size={17} color={c.muted} />
                </Pressable>
              ) : null}
            </View>
          </View>

          <FlatList
            data={options}
            keyExtractor={(make) => make}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            ListHeaderComponent={
              <>
                {!query ? (
                  <View className="pb-5">
                    <Text className="text-sm font-cairo-bold text-foreground text-right mb-2.5">
                      {S.carMakePickerPopular}
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      contentContainerStyle={{ gap: 8 }}>
                      {POPULAR_CAR_MAKES.map((make) => {
                        const selected = make === selectedCanonical;
                        return (
                          <Pressable
                            key={make}
                            onPress={() => pick(make)}
                            className="flex-row items-center gap-2 rounded-2xl border px-3 py-2 active:opacity-80 bg-card border-border">
                            {selected ? (
                              <View className="h-5 w-5 rounded-full bg-primary items-center justify-center">
                                <Check
                                  size={12}
                                  color={c.primaryForeground}
                                  strokeWidth={2.8}
                                />
                              </View>
                            ) : null}
                            <Text
                              numberOfLines={1}
                              className="text-sm font-cairo-semibold text-foreground">
                              {getCarMakeLabel(make, locale)}
                            </Text>
                            <MakeLogo make={make} small />
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : null}

                <View className="flex-row items-center justify-between pb-2">
                  <View className="min-w-8 h-7 px-2 rounded-full bg-primary/10 items-center justify-center">
                    <Text className="text-xs font-cairo-bold text-primary">{options.length}</Text>
                  </View>
                  <Text className="text-sm font-cairo-bold text-foreground">
                    {S.carMakePickerAll}
                  </Text>
                </View>
              </>
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-16 gap-3">
                <View className="h-16 w-16 rounded-2xl bg-secondary items-center justify-center">
                  <Search size={26} color={c.muted} />
                </View>
                <Text className="font-cairo-semibold text-muted-foreground text-center">
                  {S.carMakePickerEmpty}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const selected =
                item.toLocaleLowerCase() === (selectedCanonical ?? value)?.toLocaleLowerCase();
              const label = getCarMakeLabel(item, locale);
              const showEnglish = locale === 'ar' && label !== item;

              return (
                <Pressable
                  onPress={() => pick(item)}
                  className="min-h-[66px] flex-row items-center rounded-2xl border px-3.5 mb-2 active:opacity-80 bg-card border-border">
                  {selected ? (
                    <View className="h-8 w-8 rounded-full bg-primary items-center justify-center">
                      <Check size={17} color={c.primaryForeground} strokeWidth={2.8} />
                    </View>
                  ) : (
                    <View className="h-8 w-8 items-center justify-center">
                      <ChevronLeft size={18} color={c.muted} />
                    </View>
                  )}

                  <View className="flex-1 mx-3">
                    <Text
                      numberOfLines={1}
                      className="text-[15px] text-right font-cairo-semibold text-foreground">
                      {label}
                    </Text>
                    {showEnglish ? (
                      <Text className="text-[11px] font-cairo text-muted-foreground text-right">
                        {item}
                      </Text>
                    ) : null}
                  </View>

                  <MakeLogo make={item} />
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
