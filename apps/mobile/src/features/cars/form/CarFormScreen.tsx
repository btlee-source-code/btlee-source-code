import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowRight, Check, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import type { Car, CarImage } from '@/shared/types/car';
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
import { LISTING_TYPES, LISTING_TYPE_LABELS } from '@/shared/lib/constants';
import {
  AmountPicker,
  MILEAGE_OPTIONS,
  PRICE_OPTIONS,
  YEAR_OPTIONS,
} from '@/shared/components/ui/AmountPicker';
import { GovernoratePicker } from '@/shared/components/ui/GovernoratePicker';
import { toast } from '@/shared/components/ui/Toast';

const DURATIONS = [30, 60, 90, 180, 365];
const CURRENT_YEAR = new Date().getFullYear();

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-4 py-2.5 border ${active ? 'bg-accent border-accent' : 'bg-card border-border'} active:opacity-80`}>
      <Text className={`text-sm ${active ? 'font-cairo-bold text-white' : 'font-cairo-medium text-foreground'}`}>{label}</Text>
    </Pressable>
  );
}

/**
 * Form field: a bold, clearly-marked heading with a brand-accent (gold) bar on
 * the RTL-leading side — matching the search filter sheet — over its control.
 */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <View className="gap-2.5">
      <View className="flex-row items-center justify-end gap-2">
        <Text className="text-[15px] font-cairo-bold text-foreground text-right">{label}</Text>
        <View className="w-1.5 h-[18px] rounded-full bg-accent" />
      </View>
      {children}
      {hint ? <Text className="text-xs text-muted-foreground font-cairo text-right">{hint}</Text> : null}
    </View>
  );
}

const inputCls = 'bg-secondary border border-border rounded-xl px-4 h-12 text-foreground font-cairo text-right';
function normalizeWhatsapp(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('20')) return d;
  if (d.startsWith('0')) return `20${d.slice(1)}`;
  return `20${d}`;
}

export function CarFormScreen({ initial }: { initial?: Car } = {}) {
  const router = useRouter();
  const c = useThemeColors();
  const isEdit = !!initial;

  const [listingType, setListingType] = useState(initial?.listingType ?? '');
  const [condition, setCondition] = useState(initial?.condition ?? '');
  const [make, setMake] = useState(initial?.make ?? '');
  const [model, setModel] = useState(initial?.model ?? '');
  const [year, setYear] = useState<number | undefined>(initial?.year ?? undefined);
  const [mileage, setMileage] = useState<number | undefined>(initial?.mileage ?? undefined);
  const [transmission, setTransmission] = useState(initial?.transmission ?? '');
  const [fuelType, setFuelType] = useState(initial?.fuelType ?? '');
  const [bodyType, setBodyType] = useState(initial?.bodyType ?? '');
  const [color, setColor] = useState(initial?.color ?? '');
  const [price, setPrice] = useState<number | undefined>(initial?.price ?? undefined);
  const [governorate, setGovernorate] = useState(initial?.governorate ?? '');
  const [areaName, setAreaName] = useState(initial?.area_name ?? '');
  const [coordinates, setCoordinates] = useState<[number, number] | undefined>(
    initial?.location?.coordinates ?? undefined
  );
  const [description, setDescription] = useState(initial?.description ?? '');
  const [whatsapp, setWhatsapp] = useState('');
  const [durationDays, setDurationDays] = useState(initial?.durationDays ?? 30);
  const [keptImages, setKeptImages] = useState<CarImage[]>(initial?.images ?? []);
  const [newImages, setNewImages] = useState<LocalImage[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'saving'>('idle');

  const validate = (): string | null => {
    if (!listingType || !condition || !transmission || !fuelType || !bodyType || !governorate) return S.fillRequired;
    if (!make.trim() || !model.trim() || !areaName.trim()) return S.fillRequired;
    if (year == null || year < 1950 || year > CURRENT_YEAR + 1) return S.fillRequired;
    if (description.trim().length < 10) return S.descriptionHint;
    if (!isEdit && !/^01[0125][0-9]{8}$/.test(whatsapp.replace(/\D/g, ''))) return S.whatsappHint;
    if (keptImages.length + newImages.length < 1) return S.imagesRequired;
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
      const uploaded = newImages.length ? await uploadsApi.images(newImages) : [];
      const images = [...keptImages, ...uploaded];

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
        whatsappNumber: isEdit ? initial!.whatsappNumber : normalizeWhatsapp(whatsapp),
        durationDays,
      };

      if (isEdit) await carsApi.update(initial!._id, body);
      else await carsApi.create(body);

      toast.success(S.toastListingSubmitted);
      router.replace('/my-cars');
    } catch (e) {
      setError(e instanceof Error ? e.message : S.genericError);
      toast.error(S.toastListingFailed);
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
        <Text className="text-lg font-cairo-bold text-foreground">{isEdit ? S.editCarTitle : S.addCarTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="px-5 py-4 gap-5" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label={S.fCarImages}>
            {keptImages.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginBottom: 10 }}>
                {keptImages.map((img) => (
                  <View key={img.publicId} className="h-24 w-24 rounded-xl overflow-hidden">
                    <Image source={{ uri: img.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    <Pressable
                      onPress={() => setKeptImages((k) => k.filter((x) => x.publicId !== img.publicId))}
                      hitSlop={6}
                      className="absolute top-1 left-1 h-6 w-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                      <X size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}
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
                <TextInput value={make} onChangeText={setMake} placeholder={S.phMake} className={inputCls} textAlign="right" placeholderTextColor={c.muted} />
              </Field>
            </View>
            <View className="flex-1">
              <Field label={S.fModel} hint={S.modelHint}>
                <TextInput value={model} onChangeText={setModel} placeholder={S.phModel} className={inputCls} textAlign="right" placeholderTextColor={c.muted} />
              </Field>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label={S.fYear}>
                <AmountPicker
                  value={year}
                  onChange={setYear}
                  options={YEAR_OPTIONS}
                  placeholder={S.yearPickerPlaceholder}
                  title={S.yearPickerTitle}
                  plain
                  clearable={false}
                />
              </Field>
            </View>
            <View className="flex-1">
              <Field label={`${S.fMileage} ${S.optional}`}>
                <AmountPicker
                  value={mileage}
                  onChange={setMileage}
                  options={MILEAGE_OPTIONS}
                  placeholder={S.mileagePickerPlaceholder}
                  title={S.mileagePickerTitle}
                  suffix="كم"
                  clearLabel={S.amountPickerNone}
                />
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
                <TextInput value={color} onChangeText={setColor} placeholder={S.phColor} className={inputCls} textAlign="right" placeholderTextColor={c.muted} />
              </Field>
            </View>
            <View className="flex-1">
              <Field label={`${S.fPriceOne} ${S.optional}`}>
                <AmountPicker
                  value={price}
                  onChange={setPrice}
                  options={PRICE_OPTIONS}
                  placeholder={S.pricePickerPlaceholder}
                  title={S.pricePickerTitle}
                  suffix="ج.م"
                  clearLabel={S.amountPickerNone}
                />
              </Field>
            </View>
          </View>

          <Field label={S.fGovernorate}>
            <GovernoratePicker value={governorate || undefined} onChange={setGovernorate} />
          </Field>

          <Field label={S.fAreaName}>
            <TextInput value={areaName} onChangeText={setAreaName} placeholder={S.phAreaName} className={inputCls} textAlign="right" placeholderTextColor={c.muted} />
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
              placeholder={S.phDescription}
              className="bg-secondary border border-border rounded-xl px-4 py-3 text-foreground font-cairo text-right"
              style={{ minHeight: 100, textAlignVertical: 'top' }}
              textAlign="right"
              placeholderTextColor={c.muted}
            />
          </Field>

          {!isEdit && (
            <Field label={S.fWhatsapp} hint={S.whatsappHint}>
              <TextInput value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" placeholder="01xxxxxxxxx" className={inputCls} textAlign="right" placeholderTextColor={c.muted} />
            </Field>
          )}

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
        <Pressable onPress={onSubmit} disabled={submitting} className="bg-accent rounded-xl h-12 flex-row items-center justify-center gap-2 active:opacity-90">
          {submitting ? (
            <>
              <ActivityIndicator color="#FFFFFF" />
              <Text className="text-white font-cairo-semibold">
                {phase === 'uploading' ? S.uploadingImages : S.publishing}
              </Text>
            </>
          ) : (
            <>
              <Check size={20} color="#FFFFFF" />
              <Text className="text-white font-cairo-bold text-base">{isEdit ? S.submitEdit : S.submitAdd}</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
