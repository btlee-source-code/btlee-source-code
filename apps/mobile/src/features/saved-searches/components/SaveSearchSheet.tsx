import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { S } from '@/config/strings';
import { AppTextInput } from '@/shared/components/ui/AppTextInput';
import type { Filters } from '@/features/properties/list/PropertyFilters';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { HttpError } from '@/shared/api/httpClient';
import { BottomSheet } from '@/shared/components/ui/BottomSheet';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { toast } from '@/shared/components/ui/Toast';
import { successHaptic } from '@/shared/lib/haptics';
import { savedSearchesApi, type SavedSearchInput } from '../api/savedSearches.api';

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
  const c = useThemeColors();

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
      successHaptic();
      toast.success(S.savedSearchSaved);
    } catch (e) {
      setError(e instanceof HttpError ? e.message : S.genericError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={close} title={S.saveSearch}>
      <View className="gap-4 pt-2">
        <View className="gap-1.5">
          <Text className="text-sm font-cairo-medium text-foreground text-right">{S.savedSearchName}</Text>
          <AppTextInput
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError(null);
            }}
            placeholder={S.savedSearchNamePlaceholder}
            placeholderTextColor={c.muted}
            textAlign="right"
            maxLength={100}
            className="bg-card border border-border rounded-2xl px-4 h-14 text-foreground font-cairo text-right"
          />
          {error ? <Text className="text-xs text-destructive font-cairo text-right">{error}</Text> : null}
        </View>

        <PressableScale
          haptic
          onPress={onSave}
          disabled={saving}
          className="bg-primary rounded-full h-[50px] items-center justify-center">
          {saving ? (
            <ActivityIndicator color={c.primaryForeground} />
          ) : (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              className="text-primary-foreground font-cairo-bold">
              {S.saveSearch}
            </Text>
          )}
        </PressableScale>
      </View>
    </BottomSheet>
  );
}
