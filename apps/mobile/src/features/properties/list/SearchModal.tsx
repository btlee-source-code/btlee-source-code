import { useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Keyboard, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { AmountPicker, AREA_OPTIONS, PRICE_OPTIONS } from '@/shared/components/ui/AmountPicker';
import { DividedStack } from '@/shared/components/ui/DividedStack';
import { GovernoratePicker } from '@/shared/components/ui/GovernoratePicker';
import {
  CATEGORY_LABELS,
  FINISHING_LABELS,
  FINISHING_TYPES,
  LISTING_TYPE_LABELS,
  LISTING_TYPES,
  PROPERTY_CATEGORIES,
  PROPERTY_TYPES,
  SORT_OPTIONS,
  TYPE_LABELS,
} from '@/shared/lib/constants';
import { SearchSuggestions } from '../search/SearchSuggestions';
import { useSearchSuggestions } from '../search/useSearchSuggestions';
import type { Filters } from './PropertyFilters';
import type { SortValue } from './SortSheet';

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

export interface SearchState {
  search: string;
  filters: Filters;
  sort: SortValue;
}

/**
 * Unified search + filter + sort sheet. Opening the search bar on the
 * properties screen brings this up: type to search (with live suggestions),
 * refine with every filter, pick a sort, then apply — all in one place.
 */
export function SearchModal({
  visible,
  onClose,
  initial,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  initial: SearchState;
  onApply: (next: SearchState) => void;
}) {
  const router = useRouter();
  const c = useThemeColors();

  const [search, setSearch] = useState(initial.search);
  const [f, setF] = useState<Filters>(initial.filters);
  const [sort, setSort] = useState<SortValue>(initial.sort);
  const [focused, setFocused] = useState(false);

  // Re-seed the draft from the live state each time the sheet opens.
  useEffect(() => {
    if (visible) {
      setSearch(initial.search);
      setF(initial.filters);
      setSort(initial.sort);
      setFocused(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const { data: suggestions } = useSearchSuggestions(search);
  const showSuggestions = focused && search.trim().length > 0 && suggestions != null;

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
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

        {/* Search bar */}
        <View className="px-4 pt-3" style={{ zIndex: 50 }}>
          <View style={{ zIndex: 50 }}>
            <View className="flex-row items-center bg-secondary border border-border rounded-xl px-3 h-12">
              <Search size={20} color={c.muted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                onFocus={() => setFocused(true)}
                autoFocus
                placeholder={S.searchPlaceholder}
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

            {showSuggestions && suggestions ? (
              <View style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 50 }}>
                <SearchSuggestions
                  data={suggestions}
                  onSelectArea={(label) => {
                    setSearch(label);
                    setFocused(false);
                    Keyboard.dismiss();
                  }}
                  onSelectGovernorate={(label) => {
                    setSearch('');
                    setF((prev) => ({ ...prev, governorate: label }));
                    setFocused(false);
                    Keyboard.dismiss();
                  }}
                  onSelectProperty={(id) => {
                    onClose();
                    router.push(`/properties/${id}`);
                  }}
                />
              </View>
            ) : null}
          </View>
        </View>

        <ScrollView
          contentContainerClassName="px-4 py-4 gap-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setFocused(false)}>
          <DividedStack dividerClassName="h-0.5 bg-muted-foreground/30 -mx-4">
          {/* Sort */}
          <Section title={S.sortTitle}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {SORT_OPTIONS.map((o) => (
                <Chip key={o.value} label={o.label} active={sort === o.value} onPress={() => setSort(o.value)} />
              ))}
            </View>
          </Section>

          <Section title={S.fListingType}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {LISTING_TYPES.map((v) => (
                <Chip key={v} label={LISTING_TYPE_LABELS[v]} active={f.listingType === v} onPress={() => set('listingType', v)} />
              ))}
            </View>
          </Section>

          <Section title={S.fType}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {PROPERTY_TYPES.map((v) => (
                <Chip key={v} label={TYPE_LABELS[v]} active={f.type === v} onPress={() => set('type', v)} />
              ))}
            </View>
          </Section>

          <Section title={S.fCategory}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {PROPERTY_CATEGORIES.map((v) => (
                <Chip key={v} label={CATEGORY_LABELS[v]} active={f.category === v} onPress={() => set('category', v)} />
              ))}
            </View>
          </Section>

          <Section title={S.fFinishing}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {FINISHING_TYPES.map((v) => (
                <Chip key={v} label={FINISHING_LABELS[v]} active={f.finishing === v} onPress={() => set('finishing', v)} />
              ))}
            </View>
          </Section>

          <Section title={S.fMinBedrooms}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {BEDROOM_OPTIONS.map((n) => (
                <Chip key={n} label={`${n}+`} active={f.minBedrooms === n} onPress={() => set('minBedrooms', n)} />
              ))}
            </View>
          </Section>

          <Section title={S.fPrice}>
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
          </Section>

          <Section title={S.fMinArea}>
            <AmountPicker
              value={f.minArea}
              onChange={(n) => setF((p) => ({ ...p, minArea: n }))}
              options={AREA_OPTIONS}
              placeholder={S.areaPickerPlaceholder}
              title={S.areaPickerTitle}
              suffix="م²"
            />
          </Section>

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

/**
 * Filter section: a bold, clearly-marked heading (with a brand accent bar on the
 * RTL-leading side) over its controls, generously spaced from its neighbours.
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-end gap-2">
        <Text className="text-[15px] font-cairo-bold text-foreground text-right">{title}</Text>
        <View className="w-1.5 h-[18px] rounded-full bg-accent" />
      </View>
      {children}
    </View>
  );
}
