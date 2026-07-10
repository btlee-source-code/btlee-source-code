import { X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { S } from '@/config/strings';
import { HttpError } from '@/shared/api/httpClient';
import type { Filters } from '@/features/properties/list/PropertyFilters';
import { savedSearchesApi, type SavedSearchInput } from '../api/savedSearches.api';

const PRIMARY = '#1A3C34';

/**
 * Names + saves the current search/filters. Web never built this UX, so mobile
 * pioneers it. `finishing`/`sort` are intentionally dropped (not in the model).
 */
export function SaveSearchSheet({
  visible,
  onClose,
  filters,
  search,
}: {
  visible: boolean;
  onClose: () => void;
  filters: Filters;
  search: string;
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setName('');
    setError(null);
    onClose();
  };

  const onSave = async () => {
    if (!name.trim()) {
      setError(S.savedSearchNameRequired);
      return;
    }
    setSaving(true);
    setError(null);
    const payload: SavedSearchInput = {
      name: name.trim(),
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.listingType ? { listingType: filters.listingType } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.governorate ? { governorate: filters.governorate } : {}),
      ...(filters.minPrice != null ? { minPrice: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { maxPrice: filters.maxPrice } : {}),
      ...(filters.minBedrooms != null ? { minBedrooms: filters.minBedrooms } : {}),
      ...(filters.minArea != null ? { minArea: filters.minArea } : {}),
    };
    try {
      await savedSearchesApi.create(payload);
      close();
      Alert.alert(S.savedSearchSaved);
    } catch (e) {
      setError(e instanceof HttpError ? e.message : S.genericError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable className="flex-1 bg-black/40" onPress={close} />
      <View className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl px-5 pt-4 pb-8 gap-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={close} hitSlop={8}>
            <X size={22} color={PRIMARY} />
          </Pressable>
          <Text className="text-base font-cairo-bold text-foreground">{S.saveSearch}</Text>
          <View style={{ width: 22 }} />
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-cairo-medium text-foreground text-right">{S.savedSearchName}</Text>
          <TextInput
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError(null);
            }}
            placeholder={S.savedSearchNamePlaceholder}
            placeholderTextColor="#737373"
            textAlign="right"
            maxLength={100}
            className="bg-secondary rounded-xl px-4 h-12 text-foreground font-cairo text-right"
          />
          {error ? <Text className="text-xs text-destructive font-cairo text-right">{error}</Text> : null}
        </View>

        <Pressable
          onPress={onSave}
          disabled={saving}
          className="bg-primary rounded-xl h-12 items-center justify-center active:opacity-90">
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-primary-foreground font-cairo-bold">{S.saveSearch}</Text>
          )}
        </Pressable>
      </View>
    </Modal>
  );
}
