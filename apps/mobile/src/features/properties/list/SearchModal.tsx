import { useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Keyboard, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import {
  CATEGORY_LABELS,
  FINISHING_LABELS,
  FINISHING_TYPES,
  GOVERNORATES,
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
const toNum = (t: string): number | undefined => {
  const n = parseInt(t.replace(/[^\d]/g, ''), 10);
  return Number.isNaN(n) ? undefined : n;
};

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
            <View className="flex-row items-center bg-secondary rounded-xl px-3 h-12">
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
          contentContainerClassName="px-4 py-4 gap-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setFocused(false)}>
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
            <View className="flex-row gap-3">
              <TextInput
                value={f.minPrice != null ? String(f.minPrice) : ''}
                onChangeText={(t) => setF((p) => ({ ...p, minPrice: toNum(t) }))}
                keyboardType="numeric"
                placeholder={S.fMinPrice}
                placeholderTextColor={c.muted}
                className="flex-1 bg-secondary rounded-xl px-4 h-12 text-foreground font-cairo text-right"
                textAlign="right"
              />
              <TextInput
                value={f.maxPrice != null ? String(f.maxPrice) : ''}
                onChangeText={(t) => setF((p) => ({ ...p, maxPrice: toNum(t) }))}
                keyboardType="numeric"
                placeholder={S.fMaxPrice}
                placeholderTextColor={c.muted}
                className="flex-1 bg-secondary rounded-xl px-4 h-12 text-foreground font-cairo text-right"
                textAlign="right"
              />
            </View>
          </Section>

          <Section title={S.fMinArea}>
            <TextInput
              value={f.minArea != null ? String(f.minArea) : ''}
              onChangeText={(t) => setF((p) => ({ ...p, minArea: toNum(t) }))}
              keyboardType="numeric"
              placeholder={S.fMinArea}
              placeholderTextColor={c.muted}
              className="bg-secondary rounded-xl px-4 h-12 text-foreground font-cairo text-right"
              textAlign="right"
            />
          </Section>

          <Section title={S.fGovernorate}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {GOVERNORATES.map((g) => (
                <Chip key={g} label={g} active={f.governorate === g} onPress={() => set('governorate', g)} />
              ))}
            </View>
          </Section>
        </ScrollView>

        {/* Apply */}
        <View className="px-4 py-3 border-t border-border">
          <Pressable
            onPress={apply}
            className="bg-primary rounded-xl h-12 flex-row items-center justify-center gap-2 active:opacity-90">
            <Search size={18} color={c.primaryForeground} />
            <Text className="text-primary-foreground font-cairo-bold text-base">{S.showResults}</Text>
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
      className={`rounded-full px-4 py-2 border ${active ? 'bg-primary border-primary' : 'bg-card border-border'} active:opacity-80`}>
      <Text className={`font-cairo-medium text-sm ${active ? 'text-primary-foreground' : 'text-foreground'}`}>{label}</Text>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2.5">
      <Text className="text-sm font-cairo-semibold text-foreground text-right">{title}</Text>
      {children}
    </View>
  );
}
