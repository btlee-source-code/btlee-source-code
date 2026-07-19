import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { HttpError } from '@/shared/api/httpClient';
import { AppTextInput } from '@/shared/components/ui/AppTextInput';
import { BottomSheet } from '@/shared/components/ui/BottomSheet';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { toast } from '@/shared/components/ui/Toast';
import { successHaptic } from '@/shared/lib/haptics';
import { MAX_DESCRIPTION_LENGTH, REPORT_REASONS, REPORT_REASON_LABELS, type ReportReason } from '@/shared/lib/constants';
import { reportsApi } from '../api/reports.api';

/**
 * Bottom-sheet report form for a listing — pass `propertyId` OR `carId`.
 * Caller renders the trigger only for authenticated users.
 */
export function ReportSheet({
  visible,
  onClose,
  propertyId,
  carId,
}: {
  visible: boolean;
  onClose: () => void;
  propertyId?: string;
  carId?: string;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const c = useThemeColors();

  const close = () => {
    setReason(null);
    setDetails('');
    setError(null);
    onClose();
  };

  const onSubmit = async () => {
    if (!reason) {
      setError(S.reportChooseReason);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const trimmed = details.trim() || undefined;
      if (carId) {
        await reportsApi.createCar({ carId, reason, details: trimmed });
      } else if (propertyId) {
        await reportsApi.create({ propertyId, reason, details: trimmed });
      }
      close();
      successHaptic();
      toast.success(S.reportSuccess);
    } catch (e) {
      setError(e instanceof HttpError ? e.message : S.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={close} title={S.reportTitle}>
      <View className="gap-4 pt-2">
        {/* Reasons */}
        <View className="gap-2">
          {REPORT_REASONS.map((r) => {
            const selected = reason === r;
            return (
              <Pressable
                key={r}
                onPress={() => {
                  setReason(r);
                  setError(null);
                }}
                className={`flex-row items-center justify-between rounded-2xl border px-4 py-3.5 active:opacity-90 ${
                  selected ? 'border-primary bg-primary/5' : 'border-border'
                }`}>
                {selected ? <Check size={18} color={c.primary} /> : <View style={{ width: 18 }} />}
                <Text className={`font-cairo-medium text-right ${selected ? 'text-primary' : 'text-foreground'}`}>
                  {REPORT_REASON_LABELS[r]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Optional details */}
        <AppTextInput
          placeholder={S.reportDetailsPlaceholder}
          placeholderTextColor={c.muted}
          value={details}
          onChangeText={setDetails}
          maxLength={MAX_DESCRIPTION_LENGTH}
          multiline
          textAlign="right"
          className="bg-card border border-border rounded-2xl px-4 py-3 text-foreground font-cairo text-right"
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        {error ? <Text className="text-xs text-destructive font-cairo text-right">{error}</Text> : null}

        {/* Submit */}
        <PressableScale
          haptic
          onPress={onSubmit}
          disabled={submitting}
          className="bg-destructive rounded-full h-[50px] flex-row items-center justify-center">
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              className="text-white font-cairo-bold">
              {S.reportSubmit}
            </Text>
          )}
        </PressableScale>
      </View>
    </BottomSheet>
  );
}
