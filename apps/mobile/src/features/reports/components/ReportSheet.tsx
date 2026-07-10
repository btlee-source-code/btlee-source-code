import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { HttpError } from '@/shared/api/httpClient';
import { MAX_DESCRIPTION_LENGTH, REPORT_REASONS, REPORT_REASON_LABELS, type ReportReason } from '@/shared/lib/constants';
import { reportsApi } from '../api/reports.api';

/** Bottom-sheet report form. Caller renders the trigger only for authenticated users. */
export function ReportSheet({
  visible,
  onClose,
  propertyId,
}: {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
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
      await reportsApi.create({ propertyId, reason, details: details.trim() || undefined });
      close();
      Alert.alert(S.reportSuccess);
    } catch (e) {
      setError(e instanceof HttpError ? e.message : S.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable className="flex-1 bg-black/40" onPress={close} />
      <View className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl px-5 pt-4 pb-8 gap-4">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Pressable onPress={close} hitSlop={8}>
            <X size={22} color={c.primary} />
          </Pressable>
          <Text className="text-base font-cairo-bold text-foreground">{S.reportTitle}</Text>
          <View style={{ width: 22 }} />
        </View>

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
                className={`flex-row items-center justify-between rounded-xl border px-4 py-3 active:opacity-90 ${
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
        <TextInput
          placeholder={S.reportDetailsPlaceholder}
          placeholderTextColor={c.muted}
          value={details}
          onChangeText={setDetails}
          maxLength={MAX_DESCRIPTION_LENGTH}
          multiline
          textAlign="right"
          className="bg-secondary rounded-xl px-4 py-3 text-foreground font-cairo text-right"
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        {error ? <Text className="text-xs text-destructive font-cairo text-right">{error}</Text> : null}

        {/* Submit */}
        <Pressable
          onPress={onSubmit}
          disabled={submitting}
          className="bg-destructive rounded-xl h-12 flex-row items-center justify-center active:opacity-90">
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-cairo-bold">{S.reportSubmit}</Text>
          )}
        </Pressable>
      </View>
    </Modal>
  );
}
