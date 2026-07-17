import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowRight, Check, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import {
  DEPOSIT_LABELS,
  DEPOSIT_OPTIONS,
  FINISHING_LABELS,
  FINISHING_TYPES,
  LISTING_TYPE_LABELS,
  LISTING_TYPES,
  PROPERTY_CATEGORIES,
  PROPERTY_SERVICES,
  PROPERTY_TYPES,
  SERVICE_LABELS,
  CATEGORY_LABELS,
  TYPE_LABELS,
} from '@/shared/lib/constants';
import { AmountPicker, AREA_OPTIONS, COUNT_OPTIONS, PRICE_OPTIONS } from '@/shared/components/ui/AmountPicker';
import { GovernoratePicker } from '@/shared/components/ui/GovernoratePicker';
import type { Property, PropertyImage } from '@/shared/types/property';
import { propertiesApi, type PropertyInput } from '../api/properties.api';
import { uploadsApi, type LocalImage } from '../api/uploads.api';
import { ImagePickerRow } from './ImagePickerRow';
import { LocationPicker } from './LocationPicker';

const DURATIONS = [30, 60, 90, 180, 365];

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

const inputCls = 'bg-secondary rounded-xl px-4 h-12 text-foreground font-cairo text-right';
const toNum = (t: string): number | undefined => {
  const n = parseInt(t.replace(/[^\d]/g, ''), 10);
  return Number.isNaN(n) ? undefined : n;
};
/** Local EG number (01…) → Cloudinary/server format 201XXXXXXXXX. */
function normalizeWhatsapp(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('20')) return d;
  if (d.startsWith('0')) return `20${d.slice(1)}`;
  return `20${d}`;
}

export function PropertyFormScreen({ initial }: { initial?: Property }) {
  const router = useRouter();
  const isEdit = !!initial;

  const [type, setType] = useState(initial?.type ?? '');
  const [listingType, setListingType] = useState(initial?.listingType ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [finishing, setFinishing] = useState(initial?.finishing ?? '');
  const [governorate, setGovernorate] = useState(initial?.governorate ?? '');
  const [areaName, setAreaName] = useState(initial?.area_name ?? '');
  const [coordinates, setCoordinates] = useState<[number, number] | undefined>(
    initial?.location?.coordinates ?? undefined
  );
  const [bedrooms, setBedrooms] = useState<number | undefined>(initial?.bedrooms ?? undefined);
  const [bathrooms, setBathrooms] = useState<number | undefined>(initial?.bathrooms ?? undefined);
  const [floor, setFloor] = useState<number | undefined>(initial?.floor ?? undefined);
  const [area, setArea] = useState<number | undefined>(initial?.area ?? undefined);
  const [price, setPrice] = useState<number | undefined>(initial?.price ?? undefined);
  const [services, setServices] = useState<string[]>(initial?.services ?? []);
  const [hasElevator, setHasElevator] = useState(initial?.hasElevator ?? false);
  const [hasGarage, setHasGarage] = useState(initial?.hasGarage ?? false);
  const [deposit, setDeposit] = useState<string | undefined>(initial?.deposit ?? undefined);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [whatsapp, setWhatsapp] = useState('');
  const [durationDays, setDurationDays] = useState(initial?.durationDays ?? 30);
  const [keptImages, setKeptImages] = useState<PropertyImage[]>(initial?.images ?? []);
  const [newImages, setNewImages] = useState<LocalImage[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'saving'>('idle');
  const c = useThemeColors();

  const toggleService = (s: string) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const validate = (): string | null => {
    if (!type || !listingType || !category || !finishing || !governorate || !areaName.trim())
      return S.fillRequired;
    if (bedrooms == null || bathrooms == null) return S.fillRequired;
    if (type === 'apartment' && floor == null) return S.fillRequired;
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
      const body: PropertyInput = {
        type,
        listingType,
        category,
        bedrooms: bedrooms!,
        bathrooms: bathrooms!,
        floor: type === 'apartment' ? floor ?? null : null,
        area: area ?? null,
        finishing,
        services,
        hasElevator,
        hasGarage,
        deposit: listingType === 'rent' ? deposit ?? null : null,
        price: price ?? null,
        governorate,
        area_name: areaName.trim(),
        coordinates,
        description: description.trim(),
        images,
        whatsappNumber: isEdit ? initial!.whatsappNumber : normalizeWhatsapp(whatsapp),
        durationDays,
      };

      if (isEdit) await propertiesApi.update(initial!._id, body);
      else await propertiesApi.create(body);

      Alert.alert(S.addSuccessTitle, S.addSuccessDesc, [
        { text: 'تمام', onPress: () => router.replace('/my-properties') },
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
        <Text className="text-lg font-cairo-bold text-foreground">
          {isEdit ? S.editPropertyTitle : S.addPropertyTitle}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="px-5 py-4 gap-5" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label={S.fImages}>
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

          <Field label={S.fType}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {PROPERTY_TYPES.map((v) => (
                <Chip key={v} label={TYPE_LABELS[v]} active={type === v} onPress={() => setType(v)} />
              ))}
            </View>
          </Field>

          <Field label={S.fCategory}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {PROPERTY_CATEGORIES.map((v) => (
                <Chip key={v} label={CATEGORY_LABELS[v]} active={category === v} onPress={() => setCategory(v)} />
              ))}
            </View>
          </Field>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label={S.fBedrooms}>
                <AmountPicker
                  value={bedrooms}
                  onChange={setBedrooms}
                  options={COUNT_OPTIONS}
                  placeholder={S.countPickerPlaceholder}
                  title={S.fBedrooms}
                  clearable={false}
                />
              </Field>
            </View>
            <View className="flex-1">
              <Field label={S.fBathrooms}>
                <AmountPicker
                  value={bathrooms}
                  onChange={setBathrooms}
                  options={COUNT_OPTIONS}
                  placeholder={S.countPickerPlaceholder}
                  title={S.fBathrooms}
                  clearable={false}
                />
              </Field>
            </View>
          </View>

          <View className="flex-row gap-3">
            {type === 'apartment' && (
              <View className="flex-1">
                <Field label={S.fFloor}>
                  <TextInput keyboardType="numeric" value={floor != null ? String(floor) : ''} onChangeText={(t) => setFloor(toNum(t))} className={inputCls} textAlign="right" placeholderTextColor={c.muted} />
                </Field>
              </View>
            )}
            <View className="flex-1">
              <Field label={`${S.fAreaM} ${S.optional}`}>
                <AmountPicker
                  value={area}
                  onChange={setArea}
                  options={AREA_OPTIONS}
                  placeholder={S.areaPickerPlaceholder}
                  title={S.areaPickerTitle}
                  suffix="م²"
                  clearLabel={S.amountPickerNone}
                />
              </Field>
            </View>
          </View>

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

          <Field label={S.fFinishing}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {FINISHING_TYPES.map((v) => (
                <Chip key={v} label={FINISHING_LABELS[v]} active={finishing === v} onPress={() => setFinishing(v)} />
              ))}
            </View>
          </Field>

          {listingType === 'rent' && (
            <Field label={`${S.fDeposit} ${S.optional}`}>
              <View className="flex-row flex-wrap gap-2 justify-end">
                {DEPOSIT_OPTIONS.map((v) => (
                  <Chip key={v} label={DEPOSIT_LABELS[v]} active={deposit === v} onPress={() => setDeposit(deposit === v ? undefined : v)} />
                ))}
              </View>
            </Field>
          )}

          <Field label={`${S.fServices} ${S.optional}`}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {PROPERTY_SERVICES.map((v) => (
                <Chip key={v} label={SERVICE_LABELS[v]} active={services.includes(v)} onPress={() => toggleService(v)} />
              ))}
            </View>
          </Field>

          <View className="flex-row items-center justify-between bg-secondary rounded-xl px-4 py-3">
            <Switch value={hasElevator} onValueChange={setHasElevator} trackColor={{ true: c.accent }} />
            <Text className="font-cairo-medium text-foreground">{S.fElevator}</Text>
          </View>
          <View className="flex-row items-center justify-between bg-secondary rounded-xl px-4 py-3">
            <Switch value={hasGarage} onValueChange={setHasGarage} trackColor={{ true: c.accent }} />
            <Text className="font-cairo-medium text-foreground">{S.fGarage}</Text>
          </View>

          <Field label={S.fGovernorate}>
            <GovernoratePicker value={governorate || undefined} onChange={setGovernorate} />
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
              <Text className="text-white font-cairo-bold text-base">
                {isEdit ? S.submitEdit : S.submitAdd}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
