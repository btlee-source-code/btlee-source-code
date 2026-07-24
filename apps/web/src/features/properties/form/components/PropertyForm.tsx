'use client';
/**
 * Add/Edit Property Form
 * Reused by both Add and Edit pages — switches mode via initialValues + onSubmit.
 */
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useForm, Controller, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Flame, Droplets, Zap, ArrowUpDown, Car, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { ImageUploader } from './ImageUploader';
import { LocationPicker } from './LocationPicker';
import {
  PROPERTY_TYPES,
  PROPERTY_CATEGORIES,
  PROPERTY_SERVICES,
  DEPOSIT_OPTIONS,
  FINISHING_TYPES,
  GOVERNORATES,
  LISTING_TYPES,
  MAX_DESCRIPTION_LENGTH,
  MIN_DURATION_DAYS,
  MAX_DURATION_DAYS,
  propertyTypeHasFinishing,
  propertyTypeHasRooms,
} from '@/shared/lib/constants';
import type { PropertyService } from '@/shared/lib/constants';
import type { PropertyImage } from '@/shared/types/property';
import { HttpError } from '@/shared/api/httpClient';

// Icon shown on each utility toggle chip (gas / water / electricity / wifi).
const SERVICE_ICONS: Record<PropertyService, typeof Flame> = {
  gas: Flame,
  water: Droplets,
  electricity: Zap,
  wifi: Wifi,
};

const DURATIONS = [30, 60, 90, 180, 365] as const;
const ADVERTISABLE_PROPERTY_TYPES = PROPERTY_TYPES.filter((type) => type !== 'building');
const GENERAL_PROPERTY_CATEGORIES = PROPERTY_CATEGORIES.filter(
  (category) => category !== 'industrial' && category !== 'agricultural'
);
const SHOP_SERVICES = PROPERTY_SERVICES.filter((service) => service !== 'wifi');

function fixedCategoryForPropertyType(type: string) {
  if (type === 'shop') return 'commercial' as const;
  if (type === 'factory') return 'industrial' as const;
  if (type === 'land') return 'agricultural' as const;
  return undefined;
}

/**
 * Builds the property schema with localized messages. Most fields rely on the
 * global Zod error map (translated automatically); only the few that need
 * domain-specific wording pass an explicit message.
 */
// Treats blank/empty inputs as "not provided" so optional number fields stay
// undefined instead of coercing "" → 0 (which would fail .positive()).
const blankToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);

// ── Egyptian WhatsApp number normalization ──────────────────────────────────
// We store the international form WhatsApp needs: "20" + the 10-digit local part
// (e.g. 01070010209 → 201070010209). The UI shows a fixed "+20" prefix and the
// user types only the local part, but these helpers also rescue any format the
// user might paste (local "01…", international "201…/+20…", or "0020…").
function egLocalPart(value: string): string {
  let d = (value ?? '').replace(/\D/g, '');
  d = d.replace(/^00/, ''); // drop an international "00" prefix
  if (d.startsWith('20')) d = d.slice(2); // drop the country code
  d = d.replace(/^0+/, ''); // drop the local trunk zero
  return d.slice(0, 10); // EG mobile local part is 10 digits (1XXXXXXXXX)
}

function toEgInternational(value: string): string {
  const local = egLocalPart(value);
  return local ? `20${local}` : '';
}

// The natural local form users type (with the leading 0), e.g. 01070010209 —
// used to seed the field in edit mode from a stored international number.
function egDisplayLocal(value: string): string {
  const local = egLocalPart(value);
  return local ? `0${local}` : '';
}

const EG_INTERNATIONAL_RE = /^201\d{9}$/;

function buildPropertySchema(
  tErr: (key: string, values?: Record<string, string | number>) => string
) {
  return z
    .object({
      type: z.enum(PROPERTY_TYPES),
      listingType: z.enum(LISTING_TYPES),
      category: z.enum(PROPERTY_CATEGORIES),
      bedrooms: z.preprocess(
        blankToUndefined,
        z.coerce.number().int().min(0).max(50).optional()
      ),
      bathrooms: z.preprocess(
        blankToUndefined,
        z.coerce.number().int().min(0).max(50).optional()
      ),
      floor: z.preprocess(
        blankToUndefined,
        z.coerce.number().int().min(0).max(200).nullable().optional()
      ),
      // Area and price are optional — owner may leave them blank.
      area: z
        .preprocess(blankToUndefined, z.coerce.number().positive().optional())
        .transform((value) => value ?? null),
      finishing: z.enum(FINISHING_TYPES).optional(),
      services: z.array(z.enum(PROPERTY_SERVICES)).default([]),
      hasElevator: z.boolean().default(false),
      hasGarage: z.boolean().default(false),
      deposit: z.enum(DEPOSIT_OPTIONS).nullable().optional(),
      price: z
        .preprocess(blankToUndefined, z.coerce.number().positive().optional())
        .transform((value) => value ?? null),
      governorate: z.string().min(1),
      area_name: z.string().trim().min(1).max(120),
      description: z.string().min(10).max(MAX_DESCRIPTION_LENGTH),
      // The user may type the number any way they like (with the leading 0,
      // without it, with the country code, with +, with spaces). We normalize
      // it to the canonical international form WhatsApp needs (201XXXXXXXXX),
      // then validate that shape — so what gets stored always works.
      whatsappNumber: z
        .string()
        .transform((v) => toEgInternational(v))
        .refine((v) => EG_INTERNATIONAL_RE.test(v), { message: tErr('whatsapp') }),
      durationDays: z.coerce
        .number()
        .int()
        .min(MIN_DURATION_DAYS)
        .max(MAX_DURATION_DAYS),
    })
    .superRefine((data, ctx) => {
      const fixedCategory = fixedCategoryForPropertyType(data.type);
      if (
        (fixedCategory && data.category !== fixedCategory) ||
        (!fixedCategory &&
          (data.category === 'industrial' || data.category === 'agricultural'))
      ) {
        ctx.addIssue({
          code: 'custom',
          message: tErr('required'),
          path: ['category'],
        });
      }
      if (propertyTypeHasRooms(data.type)) {
        if (data.bedrooms == null) {
          ctx.addIssue({
            code: 'custom',
            message: tErr('required'),
            path: ['bedrooms'],
          });
        }
        if (data.bathrooms == null) {
          ctx.addIssue({
            code: 'custom',
            message: tErr('required'),
            path: ['bathrooms'],
          });
        }
      }
      if (data.type === 'apartment' && data.floor == null) {
        ctx.addIssue({
          code: 'custom',
          message: tErr('floorRequired'),
          path: ['floor'],
        });
      }
      if (propertyTypeHasFinishing(data.type) && !data.finishing) {
        ctx.addIssue({
          code: 'custom',
          message: tErr('required'),
          path: ['finishing'],
        });
      }
      if (data.type === 'land') {
        if (data.services.length > 0) {
          ctx.addIssue({
            code: 'custom',
            message: tErr('required'),
            path: ['services'],
          });
        }
        if (data.hasElevator) {
          ctx.addIssue({
            code: 'custom',
            message: tErr('required'),
            path: ['hasElevator'],
          });
        }
        if (data.hasGarage) {
          ctx.addIssue({
            code: 'custom',
            message: tErr('required'),
            path: ['hasGarage'],
          });
        }
      }
      if (data.type === 'shop' && data.services.includes('wifi')) {
        ctx.addIssue({
          code: 'custom',
          message: tErr('required'),
          path: ['services'],
        });
      }
      if (data.type === 'shop' && data.hasElevator) {
        ctx.addIssue({
          code: 'custom',
          message: tErr('required'),
          path: ['hasElevator'],
        });
      }
    });
}

// Identity translator — used only to infer the form value types; the actual
// localized schema is built inside the component with the real translator.
const schemaForTypes = buildPropertySchema((k) => k);
export type PropertyFormValues = z.output<typeof schemaForTypes>;
type PropertyFormInput = z.input<typeof schemaForTypes>;
type PropertyFieldName = Extract<keyof PropertyFormInput, string>;
type PropertyErrorField = 'images' | PropertyFieldName;

const PROPERTY_FIELD_ORDER: readonly PropertyErrorField[] = [
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
  'services',
  'hasElevator',
  'hasGarage',
  'deposit',
  'governorate',
  'area_name',
  'description',
  'whatsappNumber',
  'durationDays',
];

const PROPERTY_SERVER_FIELD_MAP: Record<string, PropertyErrorField> = {
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
  services: 'services',
  hasElevator: 'hasElevator',
  hasGarage: 'hasGarage',
  deposit: 'deposit',
  governorate: 'governorate',
  area_name: 'area_name',
  description: 'description',
  whatsappNumber: 'whatsappNumber',
  durationDays: 'durationDays',
};

const ERROR_CONTROL_CLASS =
  'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20';

interface PropertyFormProps {
  initialValues?: Partial<PropertyFormValues>;
  initialImages?: PropertyImage[];
  initialCoordinates?: [number, number] | null;
  onSubmit: (values: {
    form: PropertyFormValues;
    images: PropertyImage[];
    coordinates: [number, number] | null;
  }) => Promise<void>;
  submitLabel: string;
}

export function PropertyForm({
  initialValues,
  initialImages = [],
  initialCoordinates = null,
  onSubmit,
  submitLabel,
}: PropertyFormProps) {
  const t = useTranslations('addProperty');
  const tProp = useTranslations('property');
  const tErr = useTranslations('errors');
  const [images, setImages] = useState<PropertyImage[]>(initialImages);
  const [coords, setCoords] = useState<[number, number] | null>(initialCoordinates);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = Boolean(initialValues);

  const schema = useMemo(() => buildPropertySchema(tErr), [tErr]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PropertyFormInput, unknown, PropertyFormValues>({
    resolver: zodResolver(schema),
    shouldFocusError: false,
    defaultValues: {
      durationDays: 30,
      services: [],
      hasElevator: false,
      hasGarage: false,
      ...(initialValues as Partial<PropertyFormInput>),
      // Seed edit mode with the natural local form (01…) of whatever was saved.
      ...(initialValues?.whatsappNumber
        ? { whatsappNumber: egDisplayLocal(initialValues.whatsappNumber) }
        : {}),
    },
  });

  const watchType = watch('type');
  const watchCategory = watch('category');
  const watchListingType = watch('listingType');
  const watchServices = watch('services') ?? [];
  const fixedCategory = fixedCategoryForPropertyType(watchType);
  const categoryOptions = fixedCategory ? [fixedCategory] : GENERAL_PROPERTY_CATEGORIES;
  const hasRoomCounts = propertyTypeHasRooms(watchType);
  const hasFinishing = propertyTypeHasFinishing(watchType);
  const hasServicesAndAmenities = watchType !== 'land';
  const serviceOptions = watchType === 'shop' ? SHOP_SERVICES : PROPERTY_SERVICES;

  const fieldLabels: Record<PropertyErrorField, string> = {
    images: t('sectionImages'),
    listingType: t('fields.listingType'),
    type: t('fields.buildingType'),
    category: t('fields.category'),
    bedrooms: t('fields.bedrooms'),
    bathrooms: t('fields.bathrooms'),
    floor: t('fields.floor'),
    area: t('fields.area'),
    finishing: t('fields.finishing'),
    services: t('fields.services'),
    hasElevator: t('fields.elevator'),
    hasGarage: t('fields.garage'),
    deposit: t('fields.deposit'),
    price: t('fields.price'),
    governorate: t('fields.governorate'),
    area_name: t('fields.areaName'),
    description: t('sectionDescription'),
    whatsappNumber: t('fields.whatsapp'),
    durationDays: t('sectionDuration'),
  };

  // On a failed submit, bring the first invalid field into view. RHF focuses
  // native inputs, but custom controls (Select/RadioGroup/chips) aren't always
  // focusable, so the page can sit still on mobile with the error off-screen.
  // We scroll to the first rendered error message instead, which works for
  // every field type. rAF waits for the error <p>s to paint first.
  function scrollToField(field: PropertyErrorField) {
    toast.error(t('fieldErrorToast', { field: fieldLabels[field] }));
    requestAnimationFrame(() => {
      const wrapper = formRef.current?.querySelector<HTMLElement>(`[data-field="${field}"]`);
      wrapper?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      wrapper?.querySelector<HTMLElement>('input, textarea, button')?.focus({ preventScroll: true });
    });
  }

  function onInvalid(fieldErrors: FieldErrors<PropertyFormInput>) {
    const firstField = PROPERTY_FIELD_ORDER.find((field) => {
      if (field === 'images') return Boolean(imageError);
      const errorMap = fieldErrors as unknown as Record<string, unknown>;
      return Boolean(errorMap[field]);
    });
    if (firstField) scrollToField(firstField);
  }

  function onFormSubmit(event: FormEvent<HTMLFormElement>) {
    if (images.length === 0) {
      event.preventDefault();
      setImageError(t('imageRequired'));
      scrollToField('images');
      return;
    }
    void handleSubmit(submit, onInvalid)(event);
  }

  function normalizeServerErrors(error: unknown): PropertyErrorField[] {
    if (!(error instanceof HttpError) || error.status !== 422) return [];
    if (!error.details || typeof error.details !== 'object' || Array.isArray(error.details)) return [];

    const fields: PropertyErrorField[] = [];
    Object.keys(error.details as Record<string, unknown>).forEach((serverField) => {
      const field = PROPERTY_SERVER_FIELD_MAP[serverField];
      if (!field) return;
      fields.push(field);
      if (field === 'images') {
        setImageError(t('imageRequired'));
      } else {
        setError(field, {
          type: 'server',
          message:
            field === 'whatsappNumber'
              ? tErr('whatsapp')
              : t('invalidField', { field: fieldLabels[field] }),
        });
      }
    });
    return fields;
  }

  async function submit(values: PropertyFormValues) {
    setSubmitError(null);
    setImageError(null);
    // Map location is optional — `coords` may be null.
    setSubmitting(true);
    try {
      const normalizedValues: PropertyFormValues = {
        ...values,
        bedrooms: hasRoomCounts ? values.bedrooms : 0,
        bathrooms: hasRoomCounts ? values.bathrooms : 0,
        floor: watchType === 'apartment' ? values.floor ?? null : null,
        finishing: hasFinishing ? values.finishing : 'unfurnished',
        services: hasServicesAndAmenities
          ? watchType === 'shop'
            ? values.services.filter((service) => service !== 'wifi')
            : values.services
          : [],
        hasElevator: hasServicesAndAmenities && watchType !== 'shop' && values.hasElevator,
        hasGarage: hasServicesAndAmenities && values.hasGarage,
        deposit: watchListingType === 'rent' ? values.deposit ?? null : null,
        area_name: values.area_name.trim(),
      };
      await onSubmit({ form: normalizedValues, images, coordinates: coords });
    } catch (error) {
      const serverFields = normalizeServerErrors(error);
      const firstServerField = PROPERTY_FIELD_ORDER.find((field) => serverFields.includes(field));
      if (firstServerField) {
        scrollToField(firstServerField);
      } else {
        const message = tErr('generic');
        setSubmitError(message);
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onFormSubmit} className="space-y-6" noValidate>
      {/* Type Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">{t('sectionType')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5" data-field="type">
            <Label>{t('fields.buildingType')}</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    clearErrors('type');
                    const nextFixedCategory = fixedCategoryForPropertyType(value);
                    if (nextFixedCategory) {
                      setValue('category', nextFixedCategory, { shouldValidate: true });
                    } else if (
                      watchCategory === 'industrial' ||
                      watchCategory === 'agricultural'
                    ) {
                      setValue(
                        'category',
                        undefined as unknown as (typeof PROPERTY_CATEGORIES)[number],
                        { shouldValidate: true }
                      );
                    }
                    if (!propertyTypeHasRooms(value)) {
                      setValue('bedrooms', undefined, { shouldValidate: true });
                      setValue('bathrooms', undefined, { shouldValidate: true });
                      clearErrors(['bedrooms', 'bathrooms']);
                    }
                    if (!propertyTypeHasFinishing(value)) {
                      setValue('finishing', undefined, { shouldValidate: true });
                      clearErrors('finishing');
                    }
                    if (value !== 'apartment') {
                      setValue('floor', null, { shouldValidate: true });
                      clearErrors('floor');
                    }
                    if (value === 'land') {
                      setValue('services', []);
                      setValue('hasElevator', false);
                      setValue('hasGarage', false);
                    } else if (value === 'shop') {
                      setValue(
                        'services',
                        watchServices.filter((service) => service !== 'wifi')
                      );
                      setValue('hasElevator', false);
                    }
                  }}>
                  <SelectTrigger className={errors.type ? ERROR_CONTROL_CLASS : undefined}>
                    <SelectValue placeholder={t('fields.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {ADVERTISABLE_PROPERTY_TYPES.map((tp) => (
                      <SelectItem key={tp} value={tp}>
                        {tProp(`types.${tp}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2" data-field="listingType">
            <Label>{t('fields.listingType')}</Label>
            <Controller
              control={control}
              name="listingType"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    clearErrors('listingType');
                  }}
                  className="grid grid-cols-2 gap-3"
                >
                  {LISTING_TYPES.map((lt) => (
                    <label
                      key={lt}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary ${
                        errors.listingType ? 'border-destructive' : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value={lt} />
                      <span className="font-medium">{tProp(`listingTypes.${lt}`)}</span>
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
            {errors.listingType && (
              <p className="text-xs text-destructive">{errors.listingType.message}</p>
            )}
          </div>

          <div className="space-y-2" data-field="category">
            <Label>{t('fields.category')}</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    clearErrors('category');
                  }}
                  className="grid grid-cols-2 gap-3"
                >
                  {categoryOptions.map((c) => (
                    <label
                      key={c}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary ${
                        errors.category ? 'border-destructive' : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value={c} />
                      <span className="font-medium">{tProp(`categories.${c}`)}</span>
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">{t('sectionDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hasRoomCounts && (
            <>
              <div className="space-y-1.5" data-field="bedrooms">
                <Label>{t('fields.bedrooms')}</Label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  className={errors.bedrooms ? ERROR_CONTROL_CLASS : undefined}
                  {...register('bedrooms', { onChange: () => clearErrors('bedrooms') })}
                />
                {errors.bedrooms && (
                  <p className="text-xs text-destructive">{errors.bedrooms.message}</p>
                )}
              </div>

              <div className="space-y-1.5" data-field="bathrooms">
                <Label>{t('fields.bathrooms')}</Label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  className={errors.bathrooms ? ERROR_CONTROL_CLASS : undefined}
                  {...register('bathrooms', { onChange: () => clearErrors('bathrooms') })}
                />
                {errors.bathrooms && (
                  <p className="text-xs text-destructive">{errors.bathrooms.message}</p>
                )}
              </div>
            </>
          )}

          {watchType === 'apartment' && (
            <div className="space-y-1.5" data-field="floor">
              <Label>{t('fields.floor')}</Label>
              <Input
                type="number"
                min={0}
                max={200}
                className={errors.floor ? ERROR_CONTROL_CLASS : undefined}
                {...register('floor', { onChange: () => clearErrors('floor') })}
              />
              {errors.floor && (
                <p className="text-xs text-destructive">{errors.floor.message}</p>
              )}
            </div>
          )}

          <div className="space-y-1.5" data-field="area">
            <Label>
              {t('fields.area')}{' '}
              <span className="text-xs font-normal text-muted-foreground">{t('fields.optional')}</span>
            </Label>
            <Input
              type="number"
              min={1}
              inputMode="numeric"
              placeholder={t('fields.optionalPlaceholder')}
              className={errors.area ? ERROR_CONTROL_CLASS : undefined}
              {...register('area', { onChange: () => clearErrors('area') })}
            />
            {errors.area && (
              <p className="text-xs text-destructive">{errors.area.message}</p>
            )}
          </div>

          {hasFinishing && <div className="space-y-1.5" data-field="finishing">
            <Label>{t('fields.finishing')}</Label>
            <Controller
              control={control}
              name="finishing"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    clearErrors('finishing');
                  }}
                >
                  <SelectTrigger className={errors.finishing ? ERROR_CONTROL_CLASS : undefined}>
                    <SelectValue placeholder={t('fields.selectFinishing')} />
                  </SelectTrigger>
                  <SelectContent>
                    {FINISHING_TYPES.map((f) => (
                      <SelectItem key={f} value={f}>
                        {tProp(`finishing.${f}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.finishing && (
              <p className="text-xs text-destructive">{errors.finishing.message}</p>
            )}
          </div>}

          <div className="space-y-1.5" data-field="price">
            <Label>
              {t('fields.price')}{' '}
              <span className="text-xs font-normal text-muted-foreground">{t('fields.optional')}</span>
            </Label>
            <Input
              type="number"
              min={1}
              inputMode="numeric"
              placeholder={t('fields.optionalPlaceholder')}
              className={errors.price ? ERROR_CONTROL_CLASS : undefined}
              {...register('price', { onChange: () => clearErrors('price') })}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features & Services */}
      {(hasServicesAndAmenities || watchListingType === 'rent') && (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">{t('sectionFeatures')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Utilities (gas / water / electricity) — multi-select chips */}
          {hasServicesAndAmenities && (
          <>
          <div className="space-y-2" data-field="services">
            <Label>{t('fields.services')}</Label>
            <Controller
              control={control}
              name="services"
              render={({ field }) => {
                const selected = field.value ?? [];
                return (
                  <div className="flex flex-wrap gap-2">
                    {serviceOptions.map((s) => {
                      const Icon = SERVICE_ICONS[s];
                      const active = selected.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            field.onChange(
                              active
                                ? selected.filter((v) => v !== s)
                                : [...selected, s]
                            )
                          }
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            active
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:bg-secondary'
                          }`}
                        >
                          <Icon className="size-4" />
                          {tProp(`services.${s}`)}
                        </button>
                      );
                    })}
                  </div>
                );
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Elevator */}
            {watchType !== 'shop' && (
              <div className="space-y-2" data-field="hasElevator">
                <Label className="flex items-center gap-1.5">
                  <ArrowUpDown className="size-4" />
                  {t('fields.elevator')}
                </Label>
                <Controller
                  control={control}
                  name="hasElevator"
                  render={({ field }) => (
                    <RadioGroup
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(v === 'true')}
                      className="grid grid-cols-2 gap-3"
                    >
                      {[true, false].map((val) => (
                        <label
                          key={String(val)}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-secondary"
                        >
                          <RadioGroupItem value={String(val)} />
                          <span className="font-medium">
                            {val ? t('fields.yes') : t('fields.no')}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>
            )}

            {/* Garage */}
            <div className="space-y-2" data-field="hasGarage">
              <Label className="flex items-center gap-1.5">
                <Car className="size-4" />
                {t('fields.garage')}
              </Label>
              <Controller
                control={control}
                name="hasGarage"
                render={({ field }) => (
                  <RadioGroup
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(v === 'true')}
                    className="grid grid-cols-2 gap-3"
                  >
                    {[true, false].map((val) => (
                      <label
                        key={String(val)}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-secondary"
                      >
                        <RadioGroupItem value={String(val)} />
                        <span className="font-medium">
                          {val ? t('fields.yes') : t('fields.no')}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            </div>
          </div>
          </>
          )}

          {/* Required deposit — only relevant for rentals */}
          {watchListingType === 'rent' && (
            <div className="space-y-1.5" data-field="deposit">
              <Label>
                {t('fields.deposit')}{' '}
                <span className="text-xs font-normal text-muted-foreground">{t('fields.optional')}</span>
              </Label>
              <Controller
                control={control}
                name="deposit"
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('fields.selectDeposit')} />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPOSIT_OPTIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {tProp(`deposit.${d}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Location */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">{t('sectionLocation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5" data-field="governorate">
              <Label>{t('fields.governorate')}</Label>
              <Controller
                control={control}
                name="governorate"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      clearErrors('governorate');
                    }}
                  >
                    <SelectTrigger className={errors.governorate ? ERROR_CONTROL_CLASS : undefined}>
                      <SelectValue placeholder={t('fields.selectGovernorate')} />
                    </SelectTrigger>
                    <SelectContent>
                      {GOVERNORATES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.governorate && (
                <p className="text-xs text-destructive">{errors.governorate.message}</p>
              )}
            </div>

            <div className="space-y-1.5" data-field="area_name">
              <Label>{t('fields.areaName')}</Label>
              <Input
                maxLength={120}
                className={errors.area_name ? ERROR_CONTROL_CLASS : undefined}
                {...register('area_name', { onChange: () => clearErrors('area_name') })}
                placeholder={t('fields.areaNamePlaceholder')}
              />
              {errors.area_name && (
                <p className="text-xs text-destructive">{errors.area_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              {t('fields.pinLocation')}{' '}
              <span className="text-xs font-normal text-muted-foreground">{t('fields.optional')}</span>
            </Label>
            <LocationPicker value={coords} onChange={setCoords} onClear={() => setCoords(null)} />
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">{t('sectionDescription')}</CardTitle>
        </CardHeader>
        <CardContent data-field="description">
          <Textarea
            rows={5}
            maxLength={MAX_DESCRIPTION_LENGTH}
            placeholder={t('fields.descriptionPlaceholder')}
            className={errors.description ? ERROR_CONTROL_CLASS : undefined}
            {...register('description', { onChange: () => clearErrors('description') })}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {t('fields.maxChars', { max: MAX_DESCRIPTION_LENGTH })}
          </p>
        </CardContent>
      </Card>

      {/* Images */}
      <Card
        className={imageError ? 'border-destructive' : 'border-border'}
        data-field="images"
      >
        <CardHeader>
          <CardTitle className="text-lg">{t('sectionImages')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader
            value={images}
            onChange={(nextImages) => {
              setImages(nextImages);
              if (nextImages.length > 0) setImageError(null);
            }}
          />
          {imageError && <p className="mt-2 text-xs text-destructive">{imageError}</p>}
        </CardContent>
      </Card>

      {/* Contact */}
      {!isEdit && <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">{t('sectionContact')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5" data-field="whatsappNumber">
            <Label>{t('fields.whatsapp')}</Label>
            <Input
              type="tel"
              inputMode="tel"
              dir="ltr"
              autoComplete="tel"
              maxLength={18}
              placeholder="01012345678"
              className={`text-start tracking-wide ${
                errors.whatsappNumber ? ERROR_CONTROL_CLASS : ''
              }`}
              {...register('whatsappNumber', {
                onChange: () => clearErrors('whatsappNumber'),
              })}
            />

            {errors.whatsappNumber && (
              <p className="text-xs text-destructive">{errors.whatsappNumber.message}</p>
            )}
            <p className="text-xs text-muted-foreground">{t('fields.whatsappHint')}</p>
          </div>
        </CardContent>
      </Card>}

      {/* Duration */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">{t('sectionDuration')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2" data-field="durationDays">
            <Label>{t('fields.duration', { min: MIN_DURATION_DAYS, max: MAX_DURATION_DAYS })}</Label>
            <Controller
              control={control}
              name="durationDays"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((duration) => {
                    const active = Number(field.value) === duration;
                    return (
                      <button
                        key={duration}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          field.onChange(duration);
                          clearErrors('durationDays');
                        }}
                        className={`min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          active
                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                            : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary'
                        }`}
                      >
                        {t('durationOption', { days: duration })}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.durationDays && (
              <p className="text-xs text-destructive">{errors.durationDays.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Under-review notice */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
        <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900">{t('underReviewNotice')}</p>
      </div>

      {submitError && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="size-4" />
          {submitError}
        </div>
      )}

      <Button type="submit" disabled={submitting} size="lg" className="w-full md:w-auto md:min-w-48 font-semibold">
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
