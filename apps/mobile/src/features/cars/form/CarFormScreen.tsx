import { useRouter } from 'expo-router';
import { ArrowRight, Check } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { carsApi, type CarInput } from '@/features/cars/api/cars.api';
import {
  CAR_BODY_TYPES,
  CAR_BODY_TYPE_LABELS,
  CAR_CONDITIONS,
  CAR_CONDITION_LABELS,
  CAR_FUEL_TYPES,
  CAR_FUEL_TYPE_LABELS,
  CAR_TRANSMISSIONS,
  CAR_TRANSMISSION_LABELS,
} from '@/features/cars/lib/carConstants';
// Reuse the property form's generic pieces (upload flow + pickers).
import { uploadsApi, type LocalImage } from '@/features/properties/api/uploads.api';
import { ImagePickerRow } from '@/features/properties/form/ImagePickerRow';
import { LocationPicker } from '@/features/properties/form/LocationPicker';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { GOVERNORATES, LISTING_TYPES, LISTING_TYPE_LABELS } from '@/shared/lib/constants';

const DURATIONS = [30, 60, 90, 180, 365];
const CURRENT_YEAR = new Date().getFullYear();

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-4 py-2 border ${active ? 'bg-primary border-primary' : 'bg-card border-border'} active:opacity-80`}>
      <Text className={`font-cairo-medium text-sm ${active ? 'text-primary-foreground' : 'text-foreground'}`}>{label}</Text>
    </Pressable>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <View className="gap-2.5">
      <Text className="text-sm font-cairo-semibold text-foreground text-right">{label}</Text>
      {children}
      {hint ? <Text className="text-xs text-muted-foreground font-cairo text-right">{hint}</Text> : null}
    </View>
  );
}

const inputCls = 'bg-secondary rounded-xl px-4 h-12 text-foreground font-cairo text-right';
const toNum = (t: string): number | undefined => {
  const n = parseInt(t.replace(/[^\d]/g, ''), 10);
  return Number.isNaN(n) ? undefined : n;
};
function normalizeWhatsapp(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('20')) return d;
  if (d.startsWith('0')) return `20${d.slice(1)}`;
  return `20${d}`;
}

export function CarFormScreen() {
  const router = useRouter();
  const c = useThemeColors();

  const [listingType, setListingType] = useState('');
  const [condition, setCondition] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number | undefined>();
  const [mileage, setMileage] = useState<number | undefined>();
  const [transmission, setTransmission] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [color, setColor] = useState('');
  const [price, setPrice] = useState<number | undefined>();
  const [governorate, setGovernorate] = useState('');
  const [areaName, setAreaName] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number] | undefined>();
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [newImages, setNewImages] = useState<LocalImage[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'saving'>('idle');

  const validate = (): string | null => {
    if (!listingType || !condition || !transmission || !fuelType || !bodyType || !governorate) return S.fillRequired;
    if (!make.trim() || !model.trim() || !areaName.trim()) return S.fillRequired;
    if (year == null || year < 1950 || year > CURRENT_YEAR + 1) return S.fillRequired;
    if (description.trim().length < 10) return S.descriptionHint;
    if (!/^01[0125][0-9]{8}$/.test(whatsapp.replace(/\D/g, ''))) return S.whatsappHint;
    if (newImages.length < 1) return S.imagesRequired;
    return null;
  };

  const onSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      setPhase('uploading');
      const images = await uploadsApi.images(newImages);

      setPhase('saving');
      const body: CarInput = {
        listingType,
        condition,
        make: make.trim(),
        model: model.trim(),
        year: year!,
        mileage: condition === 'new' ? (mileage ?? 0) : (mileage ?? null),
        transmission,
        fuelType,
        bodyType,
        color: color.trim() || null,
        price: price ?? null,
        governorate,
        area_name: areaName.trim(),
        coordinates,
        description: description.trim(),
        images,
        whatsappNumber: normalizeWhatsapp(whatsapp),
        durationDays,
      };

      await carsApi.create(body);

      Alert.alert(S.addSuccessTitle, S.addCarSuccessDesc, [
        { text: 'تمام', onPress: () => router.back() },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : S.genericError);
    } finally {
      setSubmitting(false);
      setPhase('idle');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowRight size={24} color={c.primary} />
        </Pressable>
        <Text className="text-lg font-cairo-bold text-foreground">{S.addCarTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="px-5 py-4 gap-5" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label={S.fCarImages}>
            <ImagePickerRow value={newImages} onChange={setNewImages} />
          </Field>

          <Field label={S.fListingType}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {LISTING_TYPES.map((v) => (
                <Chip key={v} label={LISTING_TYPE_LABELS[v]} active={listingType === v} onPress={() => setListingType(v)} />
              ))}
            </View>
          </Field>

          <Field label={S.fCondition}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {CAR_CONDITIONS.map((v) => (
                <Chip key={v} label={CAR_CONDITION_LABELS[v]} active={condition === v} onPress={() => setCondition(v)} />
              ))}
            </View>
          </Field>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label={S.fMake} hint={S.makeHint}>
                <TextInput value={make} onChangeText={setMake} className={inputCls} textAlign="right" placeholderTextColor={c.muted} />
              </Field>
            </View>
            <View className="flex-1">
              <Field label={S.fModel} hint={S.modelHint}>
                <TextInput value={model} onChangeText={setModel} className={inputCls} textAlign="right" placeholderTextColor={c.muted} />
              </Field>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label={S.fYear}>
                <TextInput keyboardType="numeric" value={year != null ? String(year) : ''} onChangeText={(t) => setYear(toNum(t))} className={inputCls} textAlign="right" placeholderTextColor={c.muted} />
              </Field>
            </View>
            <View className="flex-1">
              <Field label={`${S.fMileage} ${S.optional}`}>
                <TextInput keyboardType="numeric" value={mileage != null ? String(mileage) : ''} onChangeText={(t) => setMileage(toNum(t))} className={inputCls} textAlign="right" placeholderTextColor={c.muted} />
              </Field>
            </View>
          </View>

          <Field label={S.fTransmission}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {CAR_TRANSMISSIONS.map((v) => (
                <Chip key={v} label={CAR_TRANSMISSION_LABELS[v]} active={transmission === v} onPress={() => setTransmission(v)} />
              ))}
            </View>
          </Field>

          <Field label={S.fFuel}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {CAR_FUEL_TYPES.map((v) => (
                <Chip key={v} label={CAR_FUEL_TYPE_LABELS[v]} active={fuelType === v} onPress={() => setFuelType(v)} />
              ))}
            </View>
          </Field>

          <Field label={S.fBodyType}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {CAR_BODY_TYPES.map((v) => (
                <Chip key={v} label={CAR_BODY_TYPE_LABELS[v]} active={bodyType === v} onPress={() => setBodyType(v)} />
              ))}
            </View>
          </Field>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label={`${S.fColor} ${S.optional}`}>
                <TextInput value={color} onChangeText={setColor} className={inputCls} textAlign="right" placeholderTextColor={c.muted} />
              </Field>
            </View>
            <View className="flex-1">
              <Field label={`${S.fPriceOne} ${S.optional}`}>
                <TextInput keyboardType="numeric" value={price != null ? String(price) : ''} onChangeText={(t) => setPrice(toNum(t))} className={inputCls} textAlign="right" placeholderTextColor={c.muted} />
              </Field>
            </View>
          </View>

          <Field label={S.fGovernorate}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {GOVERNORATES.map((g) => (
                <Chip key={g} label={g} active={governorate === g} onPress={() => setGovernorate(g)} />
              ))}
            </View>
          </Field>

          <Field label={S.fAreaName}>
            <TextInput value={areaName} onChangeText={setAreaName} className={inputCls} textAlign="right" placeholderTextColor={c.muted} />
          </Field>

          <Field label={`${S.fLocation} ${S.optional}`}>
            <LocationPicker value={coordinates} onChange={setCoordinates} />
          </Field>

          <Field label={S.fDescription} hint={S.descriptionHint}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
              className="bg-secondary rounded-xl px-4 py-3 text-foreground font-cairo text-right"
              style={{ minHeight: 100, textAlignVertical: 'top' }}
              textAlign="right"
              placeholderTextColor={c.muted}
            />
          </Field>

          <Field label={S.fWhatsapp} hint={S.whatsappHint}>
            <TextInput value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" placeholder="01xxxxxxxxx" className={inputCls} textAlign="right" placeholderTextColor={c.muted} />
          </Field>

          <Field label={S.fDuration}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {DURATIONS.map((d) => (
                <Chip key={d} label={`${d} ${S.days}`} active={durationDays === d} onPress={() => setDurationDays(d)} />
              ))}
            </View>
          </Field>

          {error ? (
            <View className="bg-destructive/10 rounded-lg px-3 py-2">
              <Text className="text-destructive text-sm font-cairo text-right">{error}</Text>
            </View>
          ) : null}
          <View className="h-2" />
        </ScrollView>
      </KeyboardAvoidingView>

      <View className="px-5 py-3 border-t border-border">
        <Pressable onPress={onSubmit} disabled={submitting} className="bg-primary rounded-xl h-12 flex-row items-center justify-center gap-2 active:opacity-90">
          {submitting ? (
            <>
              <ActivityIndicator color={c.primaryForeground} />
              <Text className="text-primary-foreground font-cairo-semibold">
                {phase === 'uploading' ? S.uploadingImages : S.publishing}
              </Text>
            </>
          ) : (
            <>
              <Check size={20} color={c.primaryForeground} />
              <Text className="text-primary-foreground font-cairo-bold text-base">{S.submitAdd}</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
