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
import { LISTING_TYPES, LISTING_TYPE_LABELS, MAX_IMAGES } from '@/shared/lib/constants';
import {
  AmountPicker,
  MILEAGE_FORM_OPTIONS,
  YEAR_OPTIONS,
} from '@/shared/components/ui/AmountPicker';
import { DividedStack } from '@/shared/components/ui/DividedStack';
import { GovernoratePicker } from '@/shared/components/ui/GovernoratePicker';
import { AppTextInput } from '@/shared/components/ui/AppTextInput';
import { FormField as Field } from '@/shared/components/ui/FormField';
import { ResponsiveFieldRow } from '@/shared/components/ui/ResponsiveFieldRow';
import { toast } from '@/shared/components/ui/Toast';
import { HttpError } from '@/shared/api/httpClient';
import { ResponsivePage } from '@/shared/components/layout/ResponsivePage';
import { useFormErrorScroll } from '@/shared/hooks/useFormErrorScroll';
import { CarMakePicker } from './CarMakePicker';

const DURATIONS = [30, 60, 90, 180, 365];
const CURRENT_YEAR = new Date().getFullYear();

type CarFieldKey =
  | 'images'
  | 'listingType'
  | 'condition'
  | 'make'
  | 'model'
  | 'year'
  | 'mileage'
  | 'transmission'
  | 'fuelType'
  | 'bodyType'
  | 'color'
  | 'price'
  | 'governorate'
  | 'areaName'
  | 'description'
  | 'whatsapp';

type CarFieldErrors = Partial<Record<CarFieldKey, string>>;

const CAR_FIELD_ORDER: readonly CarFieldKey[] = [
  'images',
  'listingType',
  'condition',
  'make',
  'model',
  'year',
  'mileage',
  'transmission',
  'fuelType',
  'bodyType',
  'color',
  'price',
  'governorate',
  'areaName',
  'description',
  'whatsapp',
];

const CAR_SERVER_FIELD_MAP: Record<string, CarFieldKey> = {
  images: 'images',
  listingType: 'listingType',
  condition: 'condition',
  make: 'make',
  model: 'model',
  year: 'year',
  mileage: 'mileage',
  transmission: 'transmission',
  fuelType: 'fuelType',
  bodyType: 'bodyType',
  color: 'color',
  price: 'price',
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
function normalizeWhatsapp(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('20')) return d;
  if (d.startsWith('0')) return `20${d.slice(1)}`;
  return `20${d}`;
}

function carFieldLabel(key: CarFieldKey): string {
  const labels: Record<CarFieldKey, string> = {
    images: S.fCarImages,
    listingType: S.fListingType,
    condition: S.fCondition,
    make: S.fMake,
    model: S.fModel,
    year: S.fYear,
    mileage: S.fMileage,
    transmission: S.fTransmission,
    fuelType: S.fFuel,
    bodyType: S.fBodyType,
    color: S.fColor,
    price: S.fPriceOne,
    governorate: S.fGovernorate,
    areaName: S.fAreaName,
    description: S.fCarDescription,
    whatsapp: S.fWhatsapp,
  };
  return labels[key];
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

  const [fieldErrors, setFieldErrors] = useState<CarFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'saving'>('idle');
  const { scrollRef, setFieldRef, handleScroll, scrollToFirstError } =
    useFormErrorScroll<CarFieldKey>();

  const clearFieldError = (key: CarFieldKey) => {
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const showFieldErrors = (errors: CarFieldErrors, toastMessage?: string) => {
    const firstErrorKey = CAR_FIELD_ORDER.find((key) => Boolean(errors[key]));
    const firstError = firstErrorKey ? errors[firstErrorKey] : undefined;
    setFieldErrors(errors);
    scrollToFirstError(errors, CAR_FIELD_ORDER);
    toast.error(toastMessage ?? firstError ?? S.listingSubmitError);
  };

  const validate = (): CarFieldErrors => {
    const errors: CarFieldErrors = {};
    const trimmedMake = make.trim();
    const trimmedModel = model.trim();
    const trimmedColor = color.trim();
    const trimmedArea = areaName.trim();
    const trimmedDescription = description.trim();

    const imageCount = keptImages.length + newImages.length;
    if (imageCount < 1) errors.images = S.imagesRequired;
    else if (imageCount > MAX_IMAGES) errors.images = S.maxImagesError(MAX_IMAGES);
    if (!listingType) errors.listingType = S.selectFieldError(S.fListingType);
    if (!condition) errors.condition = S.selectFieldError(S.fCondition);

    if (!trimmedMake) errors.make = S.selectFieldError(S.fMake);
    else if (trimmedMake.length > 40) errors.make = S.fieldMaxCharsError(S.fMake, 40);

    if (!trimmedModel) errors.model = S.enterFieldError(S.fModel);
    else if (trimmedModel.length > 60) errors.model = S.fieldMaxCharsError(S.fModel, 60);

    if (year == null) {
      errors.year = S.selectFieldError(S.fYear);
    } else if (year < 1950 || year > CURRENT_YEAR + 1) {
      errors.year = S.numberRangeError(S.fYear, 1950, CURRENT_YEAR + 1);
    }
    if (mileage == null) {
      errors.mileage = S.selectFieldError(S.fMileage);
    } else if (mileage < 0 || mileage > 2_000_000) {
      errors.mileage = S.numberRangeError(S.fMileage, 0, 2_000_000);
    }
    if (!transmission) errors.transmission = S.selectFieldError(S.fTransmission);
    if (!fuelType) errors.fuelType = S.selectFieldError(S.fFuel);
    if (!bodyType) errors.bodyType = S.selectFieldError(S.fBodyType);
    if (trimmedColor.length > 30) errors.color = S.fieldMaxCharsError(S.fColor, 30);
    if (price != null && price <= 0) errors.price = S.positiveNumberError(S.fPriceOne);
    if (!governorate) errors.governorate = S.selectFieldError(S.fGovernorate);

    if (!trimmedArea) errors.areaName = S.enterFieldError(S.fAreaName);
    else if (trimmedArea.length > 120) errors.areaName = S.fieldMaxCharsError(S.fAreaName, 120);

    if (trimmedDescription.length < 10) {
      errors.description = S.fieldMinCharsError(S.fCarDescription, 10);
    } else if (trimmedDescription.length > 500) {
      errors.description = S.fieldMaxCharsError(S.fCarDescription, 500);
    }

    if (!isEdit && !/^01[0125][0-9]{8}$/.test(whatsapp.replace(/\D/g, ''))) {
      errors.whatsapp = S.validWhatsappError;
    }

    return errors;
  };

  const getServerFieldErrors = (error: unknown): CarFieldErrors => {
    if (!(error instanceof HttpError) || error.status !== 422 || !error.details) return {};
    if (typeof error.details !== 'object' || Array.isArray(error.details)) return {};

    const errors: CarFieldErrors = {};
    for (const serverKey of Object.keys(error.details as Record<string, unknown>)) {
      const fieldKey = CAR_SERVER_FIELD_MAP[serverKey];
      if (!fieldKey) continue;
      if (fieldKey === 'images') {
        errors.images =
          keptImages.length + newImages.length > MAX_IMAGES
            ? S.maxImagesError(MAX_IMAGES)
            : S.imagesRequired;
      }
      else if (fieldKey === 'whatsapp') errors.whatsapp = S.validWhatsappError;
      else errors[fieldKey] = S.invalidFieldError(carFieldLabel(fieldKey));
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
      const body: CarInput = {
        listingType,
        condition,
        make: make.trim(),
        model: model.trim(),
        year: year!,
        mileage: mileage!,
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
          {isEdit ? S.editCarTitle : S.addCarTitle}
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
            label={S.fCarImages}
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
            ref={(node) => setFieldRef('condition', node)}
            label={S.fCondition}
            error={fieldErrors.condition}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {CAR_CONDITIONS.map((v) => (
                <Chip
                  key={v}
                  label={CAR_CONDITION_LABELS[v]}
                  active={condition === v}
                  onPress={() => {
                    setCondition(v);
                    clearFieldError('condition');
                  }}
                />
              ))}
            </View>
          </Field>

          <ResponsiveFieldRow>
            <Field
              ref={(node) => setFieldRef('make', node)}
              label={S.fMake}
              hint={S.makeHint}
              error={fieldErrors.make}>
              <CarMakePicker
                value={make || undefined}
                onChange={(value) => {
                  setMake(value);
                  clearFieldError('make');
                }}
              />
            </Field>
            <Field
              ref={(node) => setFieldRef('model', node)}
              label={S.fModel}
              hint={S.modelHint}
              error={fieldErrors.model}>
              <AppTextInput
                value={model}
                onChangeText={(value) => {
                  setModel(value);
                  clearFieldError('model');
                }}
                maxLength={60}
                placeholder={S.phModel}
                className={inputCls}
                textAlign="right"
                placeholderTextColor={c.muted}
              />
            </Field>
          </ResponsiveFieldRow>

          <ResponsiveFieldRow>
            <Field
              ref={(node) => setFieldRef('year', node)}
              label={S.fYear}
              error={fieldErrors.year}>
              <AmountPicker
                value={year}
                onChange={(value) => {
                  setYear(value);
                  clearFieldError('year');
                }}
                options={YEAR_OPTIONS}
                placeholder={S.yearPickerPlaceholder}
                title={S.yearPickerTitle}
                plain
                clearable={false}
              />
            </Field>
            <Field
              ref={(node) => setFieldRef('mileage', node)}
              label={S.fMileage}
              error={fieldErrors.mileage}>
              <AmountPicker
                value={mileage}
                onChange={(value) => {
                  setMileage(value);
                  clearFieldError('mileage');
                }}
                options={MILEAGE_FORM_OPTIONS}
                placeholder={S.mileagePickerPlaceholder}
                title={S.mileagePickerTitle}
                suffix="كم"
                clearable={false}
              />
            </Field>
          </ResponsiveFieldRow>

          <Field
            ref={(node) => setFieldRef('transmission', node)}
            label={S.fTransmission}
            error={fieldErrors.transmission}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {CAR_TRANSMISSIONS.map((v) => (
                <Chip
                  key={v}
                  label={CAR_TRANSMISSION_LABELS[v]}
                  active={transmission === v}
                  onPress={() => {
                    setTransmission(v);
                    clearFieldError('transmission');
                  }}
                />
              ))}
            </View>
          </Field>

          <Field
            ref={(node) => setFieldRef('fuelType', node)}
            label={S.fFuel}
            error={fieldErrors.fuelType}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {CAR_FUEL_TYPES.map((v) => (
                <Chip
                  key={v}
                  label={CAR_FUEL_TYPE_LABELS[v]}
                  active={fuelType === v}
                  onPress={() => {
                    setFuelType(v);
                    clearFieldError('fuelType');
                  }}
                />
              ))}
            </View>
          </Field>

          <Field
            ref={(node) => setFieldRef('bodyType', node)}
            label={S.fBodyType}
            error={fieldErrors.bodyType}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {CAR_BODY_TYPES.map((v) => (
                <Chip
                  key={v}
                  label={CAR_BODY_TYPE_LABELS[v]}
                  active={bodyType === v}
                  onPress={() => {
                    setBodyType(v);
                    clearFieldError('bodyType');
                  }}
                />
              ))}
            </View>
          </Field>

          <ResponsiveFieldRow>
            <Field
              ref={(node) => setFieldRef('color', node)}
              label={`${S.fColor} ${S.optional}`}
              error={fieldErrors.color}>
              <AppTextInput
                value={color}
                onChangeText={(value) => {
                  setColor(value);
                  clearFieldError('color');
                }}
                maxLength={30}
                placeholder={S.phColor}
                className={inputCls}
                textAlign="right"
                placeholderTextColor={c.muted}
              />
            </Field>
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
          </ResponsiveFieldRow>

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

          <Field label={`${S.fCarLocation} ${S.optional}`}>
            <LocationPicker value={coordinates} onChange={setCoordinates} emptyHint={S.tapToSetCarLocation} />
          </Field>

          <Field
            ref={(node) => setFieldRef('description', node)}
            label={S.fCarDescription}
            hint={S.carDescriptionHint}
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
              placeholder={S.phCarDescription}
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
