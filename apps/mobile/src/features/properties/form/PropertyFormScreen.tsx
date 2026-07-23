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
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { HttpError } from '@/shared/api/httpClient';
import { ResponsivePage } from '@/shared/components/layout/ResponsivePage';
import {
  DEPOSIT_LABELS,
  DEPOSIT_OPTIONS,
  FINISHING_LABELS,
  FINISHING_TYPES,
  LISTING_TYPE_LABELS,
  LISTING_TYPES,
  MAX_IMAGES,
  PROPERTY_CATEGORIES,
  PROPERTY_SERVICES,
  PROPERTY_TYPES,
  SERVICE_LABELS,
  CATEGORY_LABELS,
  TYPE_LABELS,
} from '@/shared/lib/constants';
import { AmountPicker, AREA_OPTIONS, COUNT_OPTIONS } from '@/shared/components/ui/AmountPicker';
import { DividedStack } from '@/shared/components/ui/DividedStack';
import { toast } from '@/shared/components/ui/Toast';
import { GovernoratePicker } from '@/shared/components/ui/GovernoratePicker';
import { AppTextInput } from '@/shared/components/ui/AppTextInput';
import { FormField as Field } from '@/shared/components/ui/FormField';
import { ResponsiveFieldRow } from '@/shared/components/ui/ResponsiveFieldRow';
import { useFormErrorScroll } from '@/shared/hooks/useFormErrorScroll';
import type { Property, PropertyImage } from '@/shared/types/property';
import { propertiesApi, type PropertyInput } from '../api/properties.api';
import { uploadsApi, type LocalImage } from '../api/uploads.api';
import { ImagePickerRow } from './ImagePickerRow';
import { LocationPicker } from './LocationPicker';

const DURATIONS = [30, 60, 90, 180, 365];

type PropertyFieldKey =
  | 'images'
  | 'listingType'
  | 'type'
  | 'category'
  | 'bedrooms'
  | 'bathrooms'
  | 'floor'
  | 'area'
  | 'price'
  | 'finishing'
  | 'governorate'
  | 'areaName'
  | 'description'
  | 'whatsapp';

type PropertyFieldErrors = Partial<Record<PropertyFieldKey, string>>;

const PROPERTY_FIELD_ORDER: readonly PropertyFieldKey[] = [
  'images',
  'listingType',
  'type',
  'category',
  'bedrooms',
  'bathrooms',
  'floor',
  'area',
  'price',
  'finishing',
  'governorate',
  'areaName',
  'description',
  'whatsapp',
];

const PROPERTY_SERVER_FIELD_MAP: Record<string, PropertyFieldKey> = {
  images: 'images',
  listingType: 'listingType',
  type: 'type',
  category: 'category',
  bedrooms: 'bedrooms',
  bathrooms: 'bathrooms',
  floor: 'floor',
  area: 'area',
  price: 'price',
  finishing: 'finishing',
  governorate: 'governorate',
  area_name: 'areaName',
  description: 'description',
  whatsappNumber: 'whatsapp',
};

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-4 py-2.5 border ${active ? 'bg-accent border-accent' : 'bg-card border-border'} active:opacity-80`}>
      <Text className={`text-sm ${active ? 'font-cairo-bold text-white' : 'font-cairo-medium text-foreground'}`}>{label}</Text>
    </Pressable>
  );
}

const inputCls = 'bg-secondary border border-border rounded-xl px-4 h-12 text-foreground font-cairo text-right';
const toNum = (t: string): number | undefined => {
  const normalized = t
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[^\d]/g, '');
  const n = parseInt(normalized, 10);
  return Number.isNaN(n) ? undefined : n;
};
/** Local EG number (01…) → Cloudinary/server format 201XXXXXXXXX. */
function normalizeWhatsapp(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('20')) return d;
  if (d.startsWith('0')) return `20${d.slice(1)}`;
  return `20${d}`;
}

function propertyFieldLabel(key: PropertyFieldKey): string {
  const labels: Record<PropertyFieldKey, string> = {
    images: S.fImages,
    listingType: S.fListingType,
    type: S.fType,
    category: S.fCategory,
    bedrooms: S.fBedrooms,
    bathrooms: S.fBathrooms,
    floor: S.fFloor,
    area: S.fAreaM,
    price: S.fPriceOne,
    finishing: S.fFinishing,
    governorate: S.fGovernorate,
    areaName: S.fAreaName,
    description: S.fDescription,
    whatsapp: S.fWhatsapp,
  };
  return labels[key];
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

  const [fieldErrors, setFieldErrors] = useState<PropertyFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'saving'>('idle');
  const c = useThemeColors();
  const { scrollRef, setFieldRef, handleScroll, scrollToFirstError } =
    useFormErrorScroll<PropertyFieldKey>();

  const toggleService = (s: string) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const clearFieldError = (key: PropertyFieldKey) => {
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const showFieldErrors = (errors: PropertyFieldErrors, toastMessage?: string) => {
    const firstErrorKey = PROPERTY_FIELD_ORDER.find((key) => Boolean(errors[key]));
    const firstError = firstErrorKey ? errors[firstErrorKey] : undefined;
    setFieldErrors(errors);
    scrollToFirstError(errors, PROPERTY_FIELD_ORDER);
    toast.error(toastMessage ?? firstError ?? S.listingSubmitError);
  };

  const validate = (): PropertyFieldErrors => {
    const errors: PropertyFieldErrors = {};
    const trimmedAreaName = areaName.trim();
    const trimmedDescription = description.trim();

    const imageCount = keptImages.length + newImages.length;
    if (imageCount < 1) errors.images = S.imagesRequired;
    else if (imageCount > MAX_IMAGES) errors.images = S.maxImagesError(MAX_IMAGES);
    if (!listingType) errors.listingType = S.selectFieldError(S.fListingType);
    if (!type) errors.type = S.selectFieldError(S.fType);
    if (!category) errors.category = S.selectFieldError(S.fCategory);

    if (bedrooms == null) {
      errors.bedrooms = S.selectFieldError(S.fBedrooms);
    } else if (bedrooms < 0 || bedrooms > 50) {
      errors.bedrooms = S.numberRangeError(S.fBedrooms, 0, 50);
    }
    if (bathrooms == null) {
      errors.bathrooms = S.selectFieldError(S.fBathrooms);
    } else if (bathrooms < 0 || bathrooms > 50) {
      errors.bathrooms = S.numberRangeError(S.fBathrooms, 0, 50);
    }
    if (type === 'apartment') {
      if (floor == null) errors.floor = S.enterFieldError(S.fFloor);
      else if (floor < 0 || floor > 200) {
        errors.floor = S.numberRangeError(S.fFloor, 0, 200);
      }
    }
    if (area != null && area <= 0) errors.area = S.positiveNumberError(S.fAreaM);
    if (price != null && price <= 0) errors.price = S.positiveNumberError(S.fPriceOne);
    if (!finishing) errors.finishing = S.selectFieldError(S.fFinishing);
    if (!governorate) errors.governorate = S.selectFieldError(S.fGovernorate);

    if (!trimmedAreaName) errors.areaName = S.enterFieldError(S.fAreaName);
    else if (trimmedAreaName.length > 120) {
      errors.areaName = S.fieldMaxCharsError(S.fAreaName, 120);
    }

    if (trimmedDescription.length < 10) {
      errors.description = S.fieldMinCharsError(S.fDescription, 10);
    } else if (trimmedDescription.length > 500) {
      errors.description = S.fieldMaxCharsError(S.fDescription, 500);
    }

    if (!isEdit && !/^01[0125][0-9]{8}$/.test(whatsapp.replace(/\D/g, ''))) {
      errors.whatsapp = S.validWhatsappError;
    }

    return errors;
  };

  const getServerFieldErrors = (error: unknown): PropertyFieldErrors => {
    if (!(error instanceof HttpError) || error.status !== 422 || !error.details) return {};
    if (typeof error.details !== 'object' || Array.isArray(error.details)) return {};

    const errors: PropertyFieldErrors = {};
    for (const serverKey of Object.keys(error.details as Record<string, unknown>)) {
      const fieldKey = PROPERTY_SERVER_FIELD_MAP[serverKey];
      if (!fieldKey) continue;
      if (fieldKey === 'images') {
        errors.images =
          keptImages.length + newImages.length > MAX_IMAGES
            ? S.maxImagesError(MAX_IMAGES)
            : S.imagesRequired;
      }
      else if (fieldKey === 'whatsapp') errors.whatsapp = S.validWhatsappError;
      else errors[fieldKey] = S.invalidFieldError(propertyFieldLabel(fieldKey));
    }
    return errors;
  };

  const onSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      showFieldErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setFieldErrors({});
    let activePhase: 'uploading' | 'saving' = 'uploading';

    try {
      setPhase('uploading');
      const uploaded = newImages.length ? await uploadsApi.images(newImages) : [];
      const images = [...keptImages, ...uploaded];

      activePhase = 'saving';
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

      toast.success(S.toastListingSubmitted);
      router.replace('/my-properties');
    } catch (e) {
      if (activePhase === 'uploading') {
        showFieldErrors({ images: S.imagesUploadError }, S.imagesUploadError);
      } else {
        const serverErrors = getServerFieldErrors(e);
        if (Object.keys(serverErrors).length > 0) showFieldErrors(serverErrors);
        else toast.error(S.listingSubmitError);
      }
    } finally {
      setSubmitting(false);
      setPhase('idle');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ResponsivePage size="form">
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowRight size={24} color={c.primary} />
        </Pressable>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          className="flex-1 mx-2 text-center text-lg font-cairo-bold text-foreground">
          {isEdit ? S.editPropertyTitle : S.addPropertyTitle}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerClassName="px-5 py-4 gap-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          <DividedStack>
          <Field
            ref={(node) => setFieldRef('images', node)}
            label={S.fImages}
            error={fieldErrors.images}>
            {keptImages.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginBottom: 10 }}>
                {keptImages.map((img) => (
                  <View key={img.publicId} className="h-24 w-24 rounded-xl overflow-hidden">
                    <Image source={{ uri: img.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    <Pressable
                      onPress={() => {
                        const images = keptImages.filter((item) => item.publicId !== img.publicId);
                        setKeptImages(images);
                        clearFieldError('images');
                      }}
                      hitSlop={6}
                      className="absolute top-1 left-1 h-6 w-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                      <X size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}
            <ImagePickerRow
              value={newImages}
              existingCount={keptImages.length}
              onChange={(images) => {
                setNewImages(images);
                clearFieldError('images');
              }}
            />
          </Field>

          <Field
            ref={(node) => setFieldRef('listingType', node)}
            label={S.fListingType}
            error={fieldErrors.listingType}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {LISTING_TYPES.map((v) => (
                <Chip
                  key={v}
                  label={LISTING_TYPE_LABELS[v]}
                  active={listingType === v}
                  onPress={() => {
                    setListingType(v);
                    clearFieldError('listingType');
                  }}
                />
              ))}
            </View>
          </Field>

          <Field
            ref={(node) => setFieldRef('type', node)}
            label={S.fType}
            error={fieldErrors.type}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {PROPERTY_TYPES.map((v) => (
                <Chip
                  key={v}
                  label={TYPE_LABELS[v]}
                  active={type === v}
                  onPress={() => {
                    setType(v);
                    clearFieldError('type');
                    if (v !== 'apartment') clearFieldError('floor');
                  }}
                />
              ))}
            </View>
          </Field>

          <Field
            ref={(node) => setFieldRef('category', node)}
            label={S.fCategory}
            error={fieldErrors.category}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {PROPERTY_CATEGORIES.map((v) => (
                <Chip
                  key={v}
                  label={CATEGORY_LABELS[v]}
                  active={category === v}
                  onPress={() => {
                    setCategory(v);
                    clearFieldError('category');
                  }}
                />
              ))}
            </View>
          </Field>

          <ResponsiveFieldRow>
            <Field
              ref={(node) => setFieldRef('bedrooms', node)}
              label={S.fBedrooms}
              error={fieldErrors.bedrooms}>
              <AmountPicker
                value={bedrooms}
                onChange={(value) => {
                  setBedrooms(value);
                  clearFieldError('bedrooms');
                }}
                options={COUNT_OPTIONS}
                placeholder={S.countPickerPlaceholder}
                title={S.fBedrooms}
                clearable={false}
              />
            </Field>
            <Field
              ref={(node) => setFieldRef('bathrooms', node)}
              label={S.fBathrooms}
              error={fieldErrors.bathrooms}>
              <AmountPicker
                value={bathrooms}
                onChange={(value) => {
                  setBathrooms(value);
                  clearFieldError('bathrooms');
                }}
                options={COUNT_OPTIONS}
                placeholder={S.countPickerPlaceholder}
                title={S.fBathrooms}
                clearable={false}
              />
            </Field>
          </ResponsiveFieldRow>

          <ResponsiveFieldRow>
            {type === 'apartment' && (
              <Field
                ref={(node) => setFieldRef('floor', node)}
                label={S.fFloor}
                error={fieldErrors.floor}>
                <AppTextInput
                  keyboardType="numeric"
                  value={floor != null ? String(floor) : ''}
                  onChangeText={(value) => {
                    setFloor(toNum(value));
                    clearFieldError('floor');
                  }}
                  placeholder={S.phFloor}
                  className={inputCls}
                  textAlign="right"
                  placeholderTextColor={c.muted}
                />
              </Field>
            )}
            <Field
              ref={(node) => setFieldRef('area', node)}
              label={`${S.fAreaM} ${S.optional}`}
              error={fieldErrors.area}>
              <AmountPicker
                value={area}
                onChange={(value) => {
                  setArea(value);
                  clearFieldError('area');
                }}
                options={AREA_OPTIONS}
                placeholder={S.areaPickerPlaceholder}
                title={S.areaPickerTitle}
                suffix="م²"
                clearLabel={S.amountPickerNone}
              />
            </Field>
          </ResponsiveFieldRow>

          <Field
            ref={(node) => setFieldRef('price', node)}
            label={`${S.fPriceOne} ${S.optional}`}
            error={fieldErrors.price}>
            <AppTextInput
              value={price != null ? String(price) : ''}
              onChangeText={(value) => {
                setPrice(toNum(value));
                clearFieldError('price');
              }}
              keyboardType="numeric"
              placeholder={S.priceInputPlaceholder}
              className={inputCls}
              textAlign="right"
              placeholderTextColor={c.muted}
            />
          </Field>

          <Field
            ref={(node) => setFieldRef('finishing', node)}
            label={S.fFinishing}
            error={fieldErrors.finishing}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {FINISHING_TYPES.map((v) => (
                <Chip
                  key={v}
                  label={FINISHING_LABELS[v]}
                  active={finishing === v}
                  onPress={() => {
                    setFinishing(v);
                    clearFieldError('finishing');
                  }}
                />
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

          <Field
            ref={(node) => setFieldRef('governorate', node)}
            label={S.fGovernorate}
            error={fieldErrors.governorate}>
            <GovernoratePicker
              value={governorate || undefined}
              onChange={(value) => {
                setGovernorate(value);
                clearFieldError('governorate');
              }}
            />
          </Field>

          <Field
            ref={(node) => setFieldRef('areaName', node)}
            label={S.fAreaName}
            error={fieldErrors.areaName}>
            <AppTextInput
              value={areaName}
              onChangeText={(value) => {
                setAreaName(value);
                clearFieldError('areaName');
              }}
              maxLength={120}
              placeholder={S.phAreaName}
              className={inputCls}
              textAlign="right"
              placeholderTextColor={c.muted}
            />
          </Field>

          <Field label={`${S.fLocation} ${S.optional}`}>
            <LocationPicker value={coordinates} onChange={setCoordinates} />
          </Field>

          <Field
            ref={(node) => setFieldRef('description', node)}
            label={S.fDescription}
            hint={S.descriptionHint}
            error={fieldErrors.description}>
            <AppTextInput
              value={description}
              onChangeText={(value) => {
                setDescription(value);
                clearFieldError('description');
              }}
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
            <Field
              ref={(node) => setFieldRef('whatsapp', node)}
              label={S.fWhatsapp}
              hint={S.whatsappHint}
              error={fieldErrors.whatsapp}>
              <AppTextInput
                value={whatsapp}
                onChangeText={(value) => {
                  setWhatsapp(value);
                  clearFieldError('whatsapp');
                }}
                maxLength={11}
                keyboardType="phone-pad"
                placeholder="01xxxxxxxxx"
                className={inputCls}
                textAlign="right"
                placeholderTextColor={c.muted}
              />
            </Field>
          )}

          <Field label={S.fDuration}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {DURATIONS.map((d) => (
                <Chip key={d} label={`${d} ${S.days}`} active={durationDays === d} onPress={() => setDurationDays(d)} />
              ))}
            </View>
          </Field>
          </DividedStack>

          <View className="h-2" />
        </ScrollView>
      </KeyboardAvoidingView>

      <View className="px-5 py-3 border-t border-border">
        <Pressable onPress={onSubmit} disabled={submitting} className="bg-accent rounded-xl h-12 flex-row items-center justify-center gap-2 active:opacity-90">
          {submitting ? (
            <>
              <ActivityIndicator color="#FFFFFF" />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                className="flex-shrink text-white font-cairo-semibold">
                {phase === 'uploading' ? S.uploadingImages : S.publishing}
              </Text>
            </>
          ) : (
            <>
              <Check size={20} color="#FFFFFF" />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                className="flex-shrink text-white font-cairo-bold text-base">
                {isEdit ? S.submitEdit : S.submitAdd}
              </Text>
            </>
          )}
        </Pressable>
      </View>
      </ResponsivePage>
    </SafeAreaView>
  );
}
