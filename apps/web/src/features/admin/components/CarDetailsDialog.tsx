'use client';
/**
 * Admin-only rich car review dialog — mirrors PropertyDetailsDialog. Shows the
 * full listing (all images, owner contact, every spec, description, location,
 * meta) so an admin can approve/reject without leaving the cars list.
 */
import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  MapPin, Eye, Check, X, Loader2, Calendar, Clock, Hash,
  User, Mail, Phone, ExternalLink, MessageCircle,
  Gauge, Settings2, Fuel, Car, BadgeCheck, Palette, Tag,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import { StarRating } from '@/shared/components/ui/star-rating';
import { Link } from '@/config/navigation';
import { adminApi } from '@/features/admin/api/admin.api';
import {
  CAR_BODY_TYPE_LABELS, CAR_CONDITION_LABELS, CAR_FUEL_LABELS,
  CAR_LISTING_TYPE_LABELS, CAR_TRANSMISSION_LABELS,
} from '@/features/admin/lib/carLabels';
import { formatPrice, formatDate, whatsappLink } from '@/shared/lib/utils';
import { toast } from 'sonner';
import type { Car as CarType } from '@/shared/types/car';

const statusVariant: Record<string, 'pending' | 'approved' | 'rejected' | 'sold' | 'default'> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  sold: 'sold',
  rented: 'sold',
  expired: 'default',
};

export function CarDetailsDialog({
  car,
  onAction,
}: {
  car: CarType;
  onAction: () => void;
}) {
  const tProp = useTranslations('property');
  const [open, setOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const images = car.images ?? [];
  const coords = car.location?.coordinates; // [lng, lat]

  async function approve() {
    setSubmitting(true);
    try {
      await adminApi.reviewCar(car._id, 'approved');
      toast.success('تم قبول الإعلان');
      setOpen(false);
      onAction();
    } catch {
      toast.error('تعذّر قبول الإعلان');
    } finally {
      setSubmitting(false);
    }
  }

  async function reject() {
    if (rejectionReason.trim().length < 5) {
      toast.error('سبب الرفض 5 أحرف على الأقل');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.reviewCar(car._id, 'rejected', rejectionReason);
      toast.success('تم رفض الإعلان');
      setOpen(false);
      onAction();
    } catch {
      toast.error('تعذّر رفض الإعلان');
    } finally {
      setSubmitting(false);
    }
  }

  const specs = [
    { icon: Calendar, label: 'سنة الصنع', value: String(car.year) },
    { icon: BadgeCheck, label: 'الحالة', value: CAR_CONDITION_LABELS[car.condition] },
    {
      icon: Gauge,
      label: 'الكيلومترات',
      value: car.mileage != null ? `${formatPrice(car.mileage)} كم` : '—',
    },
    { icon: Settings2, label: 'ناقل الحركة', value: CAR_TRANSMISSION_LABELS[car.transmission] },
    { icon: Fuel, label: 'الوقود', value: CAR_FUEL_LABELS[car.fuelType] },
    { icon: Car, label: 'نوع الهيكل', value: CAR_BODY_TYPE_LABELS[car.bodyType] },
    { icon: Tag, label: 'نوع الصفقة', value: CAR_LISTING_TYPE_LABELS[car.listingType] },
    { icon: Palette, label: 'اللون', value: car.color || '—' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="size-4" />
          عرض التفاصيل
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl w-[calc(100vw-1.5rem)] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between gap-3 pe-6">
            <DialogTitle className="text-base sm:text-lg truncate">
              {car.make} {car.model} {car.year}
            </DialogTitle>
            <Badge variant={statusVariant[car.status]} className="shrink-0">
              {tProp(`status.${car.status}`)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="px-5 py-4 space-y-6">
          {/* Gallery */}
          {images.length > 0 && (
            <div className="space-y-2">
              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-secondary">
                <Image
                  src={images[activeImage]?.url ?? images[0].url}
                  alt={`${car.make} ${car.model}`}
                  fill
                  sizes="(min-width: 768px) 700px, 100vw"
                  className="object-cover"
                />
                <span className="absolute bottom-2 end-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white tabular-nums">
                  {activeImage + 1} / {images.length}
                </span>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {images.map((img, i) => (
                    <button
                      key={img.publicId}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`relative size-16 shrink-0 rounded-lg overflow-hidden border-2 transition ${i === activeImage ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                    >
                      <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary tabular-nums">
              {car.price != null ? `${formatPrice(car.price)} ${tProp('currency')}` : 'السعر عند التواصل'}
            </span>
            {car.price != null && car.listingType === 'rent' && (
              <span className="text-sm text-muted-foreground">/ شهرياً</span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <StarRating value={car.ratingAvg ?? 0} size={16} />
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {(car.ratingAvg ?? 0).toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              {(car.ratingCount ?? 0) > 0 ? `(${car.ratingCount} تقييم)` : 'بدون تقييمات'}
            </span>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {specs.map((s, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <s.icon className="size-3.5" />
                  {s.label}
                </div>
                <p className="mt-1 font-semibold text-sm text-foreground truncate">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              <MapPin className="size-4" /> الموقع
            </h4>
            <p className="text-sm text-muted-foreground">
              {car.governorate} — {car.area_name}
            </p>
            {coords && (
              <a
                href={`https://www.google.com/maps?q=${coords[1]},${coords[0]}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="size-3.5" />
                فتح الموقع على الخريطة
              </a>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground">{tProp('description')}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {car.description}
            </p>
          </div>

          {/* Owner */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              <User className="size-4" /> بيانات المعلن
            </h4>
            <div className="flex items-center gap-3">
              <Avatar className="size-11">
                {car.owner?.avatar && <AvatarImage src={car.owner.avatar} alt="" />}
                <AvatarFallback>{car.owner?.name?.charAt(0) ?? '؟'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {car.owner?.name ?? 'غير معروف'}
                </p>
                {car.owner?.email && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Mail className="size-3 shrink-0" /> {car.owner.email}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={whatsappLink(car.whatsappNumber)} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" /> واتساب
                </a>
              </Button>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground self-center">
                <Phone className="size-3.5" /> {car.whatsappNumber}
              </span>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <Meta icon={Calendar} label="تاريخ النشر" value={formatDate(car.createdAt)} />
            <Meta icon={Clock} label="مدة الإعلان" value={`${car.durationDays} يوم`} />
            <Meta icon={Eye} label={tProp('views')} value={String(car.viewCount)} />
            <Meta
              icon={Hash}
              label={tProp('listingNumber')}
              value={car.seq != null ? `#${car.seq}` : `#${car._id.slice(-6)}`}
            />
          </div>

          {/* Rejection reason */}
          {car.status === 'rejected' && car.rejectionReason && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              <span className="font-semibold">سبب الرفض: </span>
              {car.rejectionReason}
            </div>
          )}

          {rejecting && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">سبب الرفض (سيظهر للمعلن)</label>
              <Textarea
                placeholder="اكتب سبب الرفض..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <DialogFooter className="px-5 py-4 border-t border-border flex-col sm:flex-row gap-2 sm:justify-between">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href={`/cars/${car._id}` as never} target="_blank">
              <ExternalLink className="size-4" /> فتح صفحة الإعلان
            </Link>
          </Button>

          {car.status === 'pending' && (
            <div className="flex flex-col sm:flex-row gap-2">
              {!rejecting ? (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => setRejecting(true)}
                    disabled={submitting}
                  >
                    <X className="size-4" /> رفض
                  </Button>
                  <Button
                    onClick={approve}
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                    قبول الإعلان
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setRejecting(false)} disabled={submitting}>
                    إلغاء
                  </Button>
                  <Button variant="destructive" onClick={reject} disabled={submitting}>
                    {submitting && <Loader2 className="size-4 animate-spin" />}
                    تأكيد الرفض
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border p-2.5">
      <div className="flex items-center gap-1 text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <p className="mt-1 font-semibold text-foreground tabular-nums truncate">{value}</p>
    </div>
  );
}
