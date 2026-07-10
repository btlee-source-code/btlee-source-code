import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import {
  CATEGORY_LABELS,
  FINISHING_LABELS,
  FINISHING_TYPES,
  GOVERNORATES,
  LISTING_TYPE_LABELS,
  LISTING_TYPES,
  PROPERTY_CATEGORIES,
  PROPERTY_TYPES,
  TYPE_LABELS,
} from '@/shared/lib/constants';
import type { PropertyQuery } from '../api/properties.api';

/** The subset of the query that the filter sheet edits (search + sort live elsewhere). */
export type Filters = Pick<
  PropertyQuery,
  'type' | 'listingType' | 'category' | 'governorate' | 'finishing' | 'minPrice' | 'maxPrice' | 'minBedrooms' | 'minArea'
>;

const toNum = (t: string): number | undefined => {
  const n = parseInt(t.replace(/[^\d]/g, ''), 10);
  return Number.isNaN(n) ? undefined : n;
};

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
      <View className="flex-row flex-wrap gap-2 justify-end">{children}</View>
    </View>
  );
}

const priceInput =
  'flex-1 bg-secondary rounded-xl px-4 h-12 text-foreground font-cairo text-right';

export function PropertyFilters({
  visible,
  initial,
  onApply,
  onClose,
}: {
  visible: boolean;
  initial: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Filters>(initial);
  useEffect(() => {
    if (visible) setDraft(initial);
  }, [visible, initial]);

  const set = (patch: Partial<Filters>) => setDraft((d) => ({ ...d, ...patch }));
  const BEDROOMS = [1, 2, 3, 4, 5];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
          <Pressable onPress={onClose} hitSlop={8}>
            <X size={24} color="#1C1C1C" />
          </Pressable>
          <Text className="text-lg font-cairo-bold text-foreground">{S.filterTitle}</Text>
          <Pressable onPress={() => setDraft({})} hitSlop={8}>
            <Text className="text-primary font-cairo-semibold text-sm">{S.reset}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerClassName="px-5 py-4 gap-5" showsVerticalScrollIndicator={false}>
          <Section title={S.fListingType}>
            <Chip label={S.all} active={!draft.listingType} onPress={() => set({ listingType: undefined })} />
            {LISTING_TYPES.map((v) => (
              <Chip key={v} label={LISTING_TYPE_LABELS[v]} active={draft.listingType === v} onPress={() => set({ listingType: v })} />
            ))}
          </Section>

          <Section title={S.fType}>
            <Chip label={S.all} active={!draft.type} onPress={() => set({ type: undefined })} />
            {PROPERTY_TYPES.map((v) => (
              <Chip key={v} label={TYPE_LABELS[v]} active={draft.type === v} onPress={() => set({ type: v })} />
            ))}
          </Section>

          <Section title={S.fCategory}>
            <Chip label={S.all} active={!draft.category} onPress={() => set({ category: undefined })} />
            {PROPERTY_CATEGORIES.map((v) => (
              <Chip key={v} label={CATEGORY_LABELS[v]} active={draft.category === v} onPress={() => set({ category: v })} />
            ))}
          </Section>

          <Section title={S.fFinishing}>
            <Chip label={S.all} active={!draft.finishing} onPress={() => set({ finishing: undefined })} />
            {FINISHING_TYPES.map((v) => (
              <Chip key={v} label={FINISHING_LABELS[v]} active={draft.finishing === v} onPress={() => set({ finishing: v })} />
            ))}
          </Section>

          <Section title={S.fMinBedrooms}>
            <Chip label={S.all} active={!draft.minBedrooms} onPress={() => set({ minBedrooms: undefined })} />
            {BEDROOMS.map((n) => (
              <Chip key={n} label={n === 5 ? '+5' : String(n)} active={draft.minBedrooms === n} onPress={() => set({ minBedrooms: n })} />
            ))}
          </Section>

          <View className="gap-2.5">
            <Text className="text-sm font-cairo-semibold text-foreground text-right">{S.fPrice}</Text>
            <View className="flex-row gap-3">
              <TextInput
                placeholder={S.fMinPrice}
                keyboardType="numeric"
                value={draft.minPrice ? String(draft.minPrice) : ''}
                onChangeText={(t) => set({ minPrice: toNum(t) })}
                className={priceInput}
                textAlign="right"
                placeholderTextColor="#737373"
              />
              <TextInput
                placeholder={S.fMaxPrice}
                keyboardType="numeric"
                value={draft.maxPrice ? String(draft.maxPrice) : ''}
                onChangeText={(t) => set({ maxPrice: toNum(t) })}
                className={priceInput}
                textAlign="right"
                placeholderTextColor="#737373"
              />
            </View>
          </View>

          <View className="gap-2.5">
            <Text className="text-sm font-cairo-semibold text-foreground text-right">{S.fMinArea}</Text>
            <TextInput
              keyboardType="numeric"
              value={draft.minArea ? String(draft.minArea) : ''}
              onChangeText={(t) => set({ minArea: toNum(t) })}
              className="bg-secondary rounded-xl px-4 h-12 text-foreground font-cairo text-right"
              textAlign="right"
              placeholderTextColor="#737373"
            />
          </View>

          <Section title={S.fGovernorate}>
            <Chip label={S.all} active={!draft.governorate} onPress={() => set({ governorate: undefined })} />
            {GOVERNORATES.map((g) => (
              <Chip key={g} label={g} active={draft.governorate === g} onPress={() => set({ governorate: g })} />
            ))}
          </Section>
        </ScrollView>

        <View className="px-5 py-3 border-t border-border">
          <Pressable onPress={() => onApply(draft)} className="bg-primary rounded-xl h-12 items-center justify-center active:opacity-90">
            <Text className="text-primary-foreground font-cairo-bold text-base">{S.apply}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
