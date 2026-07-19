import { Search, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Keyboard, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import type { CarQuery } from '@/features/cars/api/cars.api';
import {
  CAR_BODY_TYPE_LABELS,
  CAR_BODY_TYPES,
  CAR_CONDITION_LABELS,
  CAR_CONDITIONS,
  CAR_FUEL_TYPE_LABELS,
  CAR_FUEL_TYPES,
  CAR_TRANSMISSION_LABELS,
  CAR_TRANSMISSIONS,
} from '@/features/cars/lib/carConstants';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { LISTING_TYPE_LABELS, LISTING_TYPES, SORT_OPTIONS } from '@/shared/lib/constants';
import {
  AmountPicker,
  MILEAGE_OPTIONS,
  PRICE_OPTIONS,
  YEAR_OPTIONS,
} from '@/shared/components/ui/AmountPicker';
import { DividedStack } from '@/shared/components/ui/DividedStack';
import { AppTextInput } from '@/shared/components/ui/AppTextInput';
import { GovernoratePicker } from '@/shared/components/ui/GovernoratePicker';

export type CarSort = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

/** The subset of the car query the filter sheet edits (search + sort live alongside). */
export type CarFilters = Pick<
  CarQuery,
  | 'listingType'
  | 'condition'
  | 'bodyType'
  | 'fuelType'
  | 'transmission'
  | 'governorate'
  | 'minYear'
  | 'maxYear'
  | 'minPrice'
  | 'maxPrice'
  | 'maxMileage'
>;

export interface CarSearchState {
  search: string;
  filters: CarFilters;
  sort: CarSort;
}

/**
 * Unified cars search + filter + sort sheet — the car counterpart of the
 * properties SearchModal. Type a make/model to search, refine with every car
 * filter (listing type, condition, body, fuel, transmission, year, price,
 * mileage, governorate), pick a sort, then apply.
 */
export function CarSearchModal({
  visible,
  onClose,
  initial,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  initial: CarSearchState;
  onApply: (next: CarSearchState) => void;
}) {
  const c = useThemeColors();

  const [search, setSearch] = useState(initial.search);
  const [f, setF] = useState<CarFilters>(initial.filters);
  const [sort, setSort] = useState<CarSort>(initial.sort);

  // Re-seed the draft from the live state each time the sheet opens.
  useEffect(() => {
    if (visible) {
      setSearch(initial.search);
      setF(initial.filters);
      setSort(initial.sort);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const set = <K extends keyof CarFilters>(key: K, value: CarFilters[K]) =>
    setF((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));

  const reset = () => {
    setSearch('');
    setF({});
    setSort('newest');
  };

  const apply = () => {
    Keyboard.dismiss();
    onApply({ search: search.trim(), filters: f, sort });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <Pressable onPress={onClose} hitSlop={8}>
            <X size={24} color={c.foreground} />
          </Pressable>
          <Text className="text-base font-cairo-bold text-foreground">{S.searchAndFilter}</Text>
          <Pressable onPress={reset} hitSlop={8}>
            <Text className="text-sm font-cairo-semibold text-primary">{S.reset}</Text>
          </Pressable>
        </View>

        {/* Search bar (make / model, bilingual) */}
        <View className="px-4 pt-3">
          <View className="flex-row items-center bg-secondary border border-border rounded-xl px-3 h-12">
            <Search size={20} color={c.muted} />
            <AppTextInput
              value={search}
              onChangeText={setSearch}
              autoFocus
              placeholder={S.carsSearchPlaceholder}
              placeholderTextColor={c.muted}
              className="flex-1 mx-2 text-foreground font-cairo text-right"
              textAlign="right"
              returnKeyType="search"
              onSubmitEditing={apply}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <X size={18} color={c.muted} />
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView
          contentContainerClassName="px-4 py-4 gap-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <DividedStack dividerClassName="h-0.5 bg-muted-foreground/30 -mx-4">
          <Section title={S.sortTitle}>
            {SORT_OPTIONS.map((o) => (
              <Chip key={o.value} label={o.label} active={sort === o.value} onPress={() => setSort(o.value)} />
            ))}
          </Section>

          <Section title={S.fListingType}>
            {LISTING_TYPES.map((v) => (
              <Chip key={v} label={LISTING_TYPE_LABELS[v]} active={f.listingType === v} onPress={() => set('listingType', v)} />
            ))}
          </Section>

          <Section title={S.fCondition}>
            {CAR_CONDITIONS.map((v) => (
              <Chip key={v} label={CAR_CONDITION_LABELS[v]} active={f.condition === v} onPress={() => set('condition', v)} />
            ))}
          </Section>

          <Section title={S.fBodyType}>
            {CAR_BODY_TYPES.map((v) => (
              <Chip key={v} label={CAR_BODY_TYPE_LABELS[v]} active={f.bodyType === v} onPress={() => set('bodyType', v)} />
            ))}
          </Section>

          <Section title={S.fFuel}>
            {CAR_FUEL_TYPES.map((v) => (
              <Chip key={v} label={CAR_FUEL_TYPE_LABELS[v]} active={f.fuelType === v} onPress={() => set('fuelType', v)} />
            ))}
          </Section>

          <Section title={S.fTransmission}>
            {CAR_TRANSMISSIONS.map((v) => (
              <Chip key={v} label={CAR_TRANSMISSION_LABELS[v]} active={f.transmission === v} onPress={() => set('transmission', v)} />
            ))}
          </Section>

          {/* Year range */}
          <View className="gap-3">
            <Heading title={S.fYear} />
            <View className="flex-row-reverse gap-3">
              <View className="flex-1">
                <AmountPicker
                  value={f.minYear}
                  onChange={(n) => setF((p) => ({ ...p, minYear: n }))}
                  options={YEAR_OPTIONS}
                  placeholder={S.fMinYear}
                  title={S.yearPickerTitle}
                  plain
                  maxBound={f.maxYear}
                />
              </View>
              <View className="flex-1">
                <AmountPicker
                  value={f.maxYear}
                  onChange={(n) => setF((p) => ({ ...p, maxYear: n }))}
                  options={YEAR_OPTIONS}
                  placeholder={S.fMaxYear}
                  title={S.yearPickerTitle}
                  plain
                  minBound={f.minYear}
                />
              </View>
            </View>
          </View>

          {/* Price range */}
          <View className="gap-3">
            <Heading title={S.fPrice} />
            <View className="flex-row-reverse gap-3">
              <View className="flex-1">
                <AmountPicker
                  value={f.minPrice}
                  onChange={(n) => setF((p) => ({ ...p, minPrice: n }))}
                  options={PRICE_OPTIONS}
                  placeholder={S.fMinPrice}
                  title={S.pricePickerTitle}
                  suffix="ج.م"
                  maxBound={f.maxPrice}
                />
              </View>
              <View className="flex-1">
                <AmountPicker
                  value={f.maxPrice}
                  onChange={(n) => setF((p) => ({ ...p, maxPrice: n }))}
                  options={PRICE_OPTIONS}
                  placeholder={S.fMaxPrice}
                  title={S.pricePickerTitle}
                  suffix="ج.م"
                  minBound={f.minPrice}
                />
              </View>
            </View>
          </View>

          {/* Max mileage */}
          <View className="gap-3">
            <Heading title={S.fMaxMileage} />
            <AmountPicker
              value={f.maxMileage}
              onChange={(n) => setF((p) => ({ ...p, maxMileage: n }))}
              options={MILEAGE_OPTIONS}
              placeholder={S.fMaxMileage}
              title={S.mileagePickerTitle}
              suffix="كم"
            />
          </View>

          <Section title={S.fGovernorate}>
            <GovernoratePicker
              value={f.governorate}
              onChange={(g) => setF((prev) => ({ ...prev, governorate: g }))}
            />
          </Section>
          </DividedStack>
        </ScrollView>

        {/* Apply */}
        <View className="px-4 py-3 border-t border-border">
          <Pressable
            onPress={apply}
            className="bg-accent rounded-xl h-12 flex-row items-center justify-center gap-2 active:opacity-90">
            <Search size={18} color="#FFFFFF" />
            <Text className="text-white font-cairo-bold text-base">{S.showResults}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-4 py-2.5 border ${active ? 'bg-accent border-accent' : 'bg-card border-border'} active:opacity-80`}>
      <Text className={`text-sm ${active ? 'font-cairo-bold text-white' : 'font-cairo-medium text-foreground'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Bold, clearly-marked filter heading with a brand accent bar (RTL-leading). */
export function Heading({ title }: { title: string }) {
  return (
    <View className="flex-row items-center justify-end gap-2">
      <Text className="text-[15px] font-cairo-bold text-foreground text-right">{title}</Text>
      <View className="w-1.5 h-[18px] rounded-full bg-accent" />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Heading title={title} />
      <View className="flex-row flex-wrap gap-2 justify-end">{children}</View>
    </View>
  );
}
