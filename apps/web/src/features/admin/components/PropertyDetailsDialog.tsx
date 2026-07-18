'use client';
/**
 * Admin-only rich property review dialog.
 * Shows the full listing — all images, owner contact, every spec, description,
 * location and meta — so an admin can make an informed approve/reject decision
 * without leaving the properties list.
 */
import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  MapPin, Eye, Check, X, Loader2, BedDouble, Bath, Maximize2,
  Building2, Paintbrush, Tag, Layers, Calendar, Clock, Hash,
  User, Mail, Phone, ExternalLink, MessageCircle,
  Flame, Droplets, Zap, ArrowUpDown, Car, Wallet, Wifi,
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
import { formatPrice, formatDate, whatsappLink } from '@/shared/lib/utils';
import { toast } from 'sonner';
import type { Property } from '@/shared/types/property';

const statusVariant: Record<string, 'pending' | 'approved' | 'rejected' | 'sold' | 'default'> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  sold: 'sold',
  rented: 'sold',
  expired: 'default',
};

export function PropertyDetailsDialog({
  property,
  onAction,
}: {
  property: Property;
  onAction: () => void;
}) {
  const tProp = useTranslations('property');
  const [open, setOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const images = property.images ?? [];
  const coords = property.location?.coordinates; // [lng, lat]

  async function approve() {
    setSubmitting(true);
    try {
      await adminApi.reviewProperty(property._id, 'approved');
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
      await adminApi.reviewProperty(property._id, 'rejected', rejectionReason);
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
    { icon: BedDouble, label: tProp('bedrooms'), value: property.bedrooms },
    { icon: Bath, label: tProp('bathrooms'), value: property.bathrooms },
    {
      icon: Maximize2,
      label: tProp('area'),
      value: property.area != null ? `${property.area} ${tProp('areaUnit')}` : '—',
    },
    {
      icon: Layers,
      label: tProp('floor'),
      value: property.floor != null ? property.floor : '—',
    },
    { icon: Paintbrush, label: tProp('finishingLabel'), value: tProp(`finishing.${property.finishing}`) },
    { icon: Building2, label: 'النوع', value: tProp(`types.${property.type}`) },
    { icon: Tag, label: 'نوع الصفقة', value: tProp(`listingTypes.${property.listingType}`) },
    { icon: Tag, label: tProp('categoryLabel'), value: tProp(`categories.${property.category}`) },
    { icon: ArrowUpDown, label: tProp('elevator'), value: property.hasElevator ? tProp('yes') : tProp('no') },
    { icon: Car, label: tProp('garage'), value: property.hasGarage ? tProp('yes') : tProp('no') },
    {
      icon: Wallet,
      label: tProp('depositLabel'),
      value: property.deposit ? tProp(`deposit.${property.deposit}`) : '—',
    },
  ];

  const serviceIcons = { gas: Flame, water: Droplets, electricity: Zap, wifi: Wifi } as const;

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
              {tProp(`types.${property.type}`)} في {property.area_name}
            </DialogTitle>
            <Badge variant={statusVariant[property.status]} className="shrink-0">
              {tProp(`status.${property.status}`)}
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
                  alt={property.area_name}
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
              {property.price != null ? `${formatPrice(property.price)} ${tProp('currency')}` : 'السعر عند التواصل'}
            </span>
            {property.price != null && property.listingType === 'rent' && (
              <span className="text-sm text-muted-foreground">/ شهرياً</span>
            )}
          </div>

          {/* Rating — how users have rated this listing */}
          <div className="flex items-center gap-2">
            <StarRating value={property.ratingAvg ?? 0} size={16} />
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {(property.ratingAvg ?? 0).toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              {(property.ratingCount ?? 0) > 0 ? `(${property.ratingCount} تقييم)` : 'بدون تقييمات'}
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

          {/* Available services */}
          {property.services?.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-foreground">{tProp('servicesLabel')}</h4>
              <div className="flex flex-wrap gap-2">
                {property.services.map((s) => {
                  const Icon = serviceIcons[s];
                  return (
                    <span
                      key={s}
                      className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                    >
                      <Icon className="size-4" />
                      {tProp(`services.${s}`)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              <MapPin className="size-4" /> الموقع
            </h4>
            <p className="text-sm text-muted-foreground">
              {property.governorate} — {property.area_name}
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
              {property.description}
            </p>
          </div>

          {/* Owner */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              <User className="size-4" /> بيانات المعلن
            </h4>
            <div className="flex items-center gap-3">
              <Avatar className="size-11">
                {property.owner?.avatar && <AvatarImage src={property.owner.avatar} alt="" />}
                <AvatarFallback>{property.owner?.name?.charAt(0) ?? '؟'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {property.owner?.name ?? 'غير معروف'}
                </p>
                {property.owner?.email && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Mail className="size-3 shrink-0" /> {property.owner.email}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={whatsappLink(property.whatsappNumber)} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" /> واتساب
                </a>
              </Button>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground self-center">
                <Phone className="size-3.5" /> {property.whatsappNumber}
              </span>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <Meta icon={Calendar} label="تاريخ النشر" value={formatDate(property.createdAt)} />
            <Meta icon={Clock} label="مدة الإعلان" value={`${property.durationDays} يوم`} />
            <Meta icon={Eye} label={tProp('views')} value={String(property.viewCount)} />
            <Meta
              icon={Hash}
              label={tProp('listingNumber')}
              value={property.seq != null ? `#${property.seq}` : `#${property._id.slice(-6)}`}
            />
          </div>

          {/* Rejection reason (shown only while rejecting) */}
          {property.status === 'rejected' && property.rejectionReason && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              <span className="font-semibold">سبب الرفض: </span>
              {property.rejectionReason}
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
            <Link href={`/properties/${property._id}` as never} target="_blank">
              <ExternalLink className="size-4" /> فتح صفحة الإعلان
            </Link>
          </Button>

          {property.status === 'pending' && (
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



