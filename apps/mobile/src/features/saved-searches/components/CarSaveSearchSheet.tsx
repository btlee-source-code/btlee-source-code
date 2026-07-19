import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { S } from '@/config/strings';
import { AppTextInput } from '@/shared/components/ui/AppTextInput';
import type { CarFilters } from '@/features/cars/list/CarSearchModal';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { HttpError } from '@/shared/api/httpClient';
import { BottomSheet } from '@/shared/components/ui/BottomSheet';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { toast } from '@/shared/components/ui/Toast';
import { successHaptic } from '@/shared/lib/haptics';
import { savedSearchesApi, type CarSavedSearchInput } from '../api/savedSearches.api';

/** Names + saves the current CAR search/filters — the car counterpart of SaveSearchSheet. */
export function CarSaveSearchSheet({
  visible,
  onClose,
  filters,
  search,
}: {
  visible: boolean;
  onClose: () => void;
  filters: CarFilters;
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
    const payload: CarSavedSearchInput = {
      name: name.trim(),
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(filters.listingType ? { listingType: filters.listingType } : {}),
      ...(filters.governorate ? { governorate: filters.governorate } : {}),
      ...(filters.minPrice != null ? { minPrice: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { maxPrice: filters.maxPrice } : {}),
      ...(filters.condition ? { condition: filters.condition } : {}),
      ...(filters.bodyType ? { bodyType: filters.bodyType } : {}),
      ...(filters.fuelType ? { fuelType: filters.fuelType } : {}),
      ...(filters.transmission ? { transmission: filters.transmission } : {}),
      ...(filters.minYear != null ? { minYear: filters.minYear } : {}),
      ...(filters.maxYear != null ? { maxYear: filters.maxYear } : {}),
      ...(filters.maxMileage != null ? { maxMileage: filters.maxMileage } : {}),
    };
    try {
      await savedSearchesApi.createCar(payload);
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
            <Text className="text-primary-foreground font-cairo-bold">{S.saveSearch}</Text>
          )}
        </PressableScale>
      </View>
    </BottomSheet>
  );
}
