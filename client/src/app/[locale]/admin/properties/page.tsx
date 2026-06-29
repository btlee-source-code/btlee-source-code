'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Check, X, Star, Trash2, Loader2 } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/shared/components/ui/tabs';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { PropertyDetailsDialog } from '@/features/admin/components/PropertyDetailsDialog';
import { useFetch } from '@/shared/hooks/useFetch';
import { adminApi } from '@/features/admin/api/admin.api';
import { useAdminAuth } from '@/features/admin/hooks/useAdminAuth';
import { formatPrice } from '@/shared/lib/utils';
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

export default function AdminPropertiesPage() {
  const { isAuthenticated, isHydrated } = useAdminAuth();
  const [status, setStatus] = useState('pending');

  const { data, isLoading, refetch } = useFetch(
    () => adminApi.listProperties({ status, limit: 50 }),
    [status],
    { enabled: isAuthenticated }
  );

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-5 sm:mb-6">إدارة العقارات</h1>

        <Tabs value={status} onValueChange={setStatus}>
          {/* Scrollable tabs on mobile */}
          <div className="overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
            <TabsList className="inline-flex w-max">
              <TabsTrigger value="pending">قيد المراجعة</TabsTrigger>
              <TabsTrigger value="approved">منشورة</TabsTrigger>
              <TabsTrigger value="rejected">مرفوضة</TabsTrigger>
              <TabsTrigger value="sold">مباعة</TabsTrigger>
              <TabsTrigger value="rented">مؤجرة</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={status} className="mt-5 sm:mt-6">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-40 sm:h-32 rounded-xl bg-secondary animate-pulse" />
                ))}
              </div>
            ) : (data as Property[])?.length === 0 ? (
              <Card className="p-10 sm:p-16 text-center text-muted-foreground border-dashed">
                لا توجد عقارات
              </Card>
            ) : (
              <div className="space-y-3">
                {(data as Property[])?.map((p) => (
                  <AdminPropertyRow key={p._id} property={p} onAction={refetch} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function AdminPropertyRow({
  property,
  onAction,
}: {
  property: Property;
  onAction: () => void;
}) {
  const tProp = useTranslations('property');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    try {
      await adminApi.deleteProperty(property._id);
      toast.success('تم حذف الإعلان');
      onAction();
    } catch {
      toast.error('تعذّر حذف الإعلان');
    } finally {
      setDeleting(false);
    }
  }

  async function approve() {
    setSubmitting(true);
    try {
      await adminApi.reviewProperty(property._id, 'approved');
      toast.success('تم القبول');
      onAction();
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
      toast.success('تم الرفض');
      onAction();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-border p-3 sm:p-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative w-full sm:w-40 aspect-[16/9] sm:aspect-[4/3] rounded-lg overflow-hidden shrink-0 bg-secondary">
          <Image
            src={property.images[0]?.url ?? ''}
            alt={property.area_name}
            fill
            sizes="(min-width: 640px) 200px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{property.area_name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{property.governorate}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                المعلن: {property.owner?.name ?? '—'}
              </p>
            </div>
            <Badge variant={statusVariant[property.status]} className="shrink-0">
              {tProp(`status.${property.status}`)}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="text-base sm:text-lg font-bold text-primary tabular-nums">
              {property.price != null ? `${formatPrice(property.price)} ج.م` : 'السعر عند التواصل'}
            </div>

            {/* Rating — so the admin sees how each listing is rated */}
            {(property.ratingCount ?? 0) > 0 ? (
              <span className="flex shrink-0 items-center gap-1">
                <Star className="size-4 fill-accent text-accent" />
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {property.ratingAvg.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">({property.ratingCount} تقييم)</span>
              </span>
            ) : (
              <span className="shrink-0 text-xs text-muted-foreground">بدون تقييم</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <PropertyDetailsDialog property={property} onAction={onAction} />

            {property.status === 'pending' && (
              <>
                <Button
                  onClick={approve}
                  disabled={submitting}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Check className="size-4" />
                  قبول
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <X className="size-4" />
                      رفض
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md w-[calc(100vw-2rem)]">
                    <DialogHeader>
                      <DialogTitle>رفض الإعلان</DialogTitle>
                    </DialogHeader>
                    <Textarea
                      placeholder="اكتب سبب الرفض (سيظهر للمستخدم)..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                    />
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button onClick={reject} variant="destructive" disabled={submitting} className="w-full sm:w-auto">
                        تأكيد الرفض
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {property.status === 'approved' && (
              <Button
                onClick={async () => {
                  await adminApi.setFeatured(property._id, !property.isFeatured);
                  toast.success(property.isFeatured ? 'تم الإلغاء' : 'تم إضافته للمميزة');
                  onAction();
                }}
                variant="outline"
                size="sm"
                className={property.isFeatured ? 'text-amber-600 border-amber-300' : ''}
              >
                <Star className={`size-4 ${property.isFeatured ? 'fill-current' : ''}`} />
                {property.isFeatured ? 'مميز' : 'إضافة للمميزة'}
              </Button>
            )}

            {/* Delete — available for any status, pushed to the row's end */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="sm:ms-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  حذف
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-[calc(100vw-2rem)]">
                <DialogHeader>
                  <DialogTitle>حذف الإعلان</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  هل أنت متأكد من حذف إعلان &quot;{property.area_name}&quot;؟ سيتم حذف
                  الإعلان وصوره نهائياً ولا يمكن التراجع عن هذا الإجراء.
                </p>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    onClick={remove}
                    variant="destructive"
                    disabled={deleting}
                    className="w-full sm:w-auto"
                  >
                    {deleting && <Loader2 className="size-4 animate-spin" />}
                    تأكيد الحذف
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Card>
  );
}
