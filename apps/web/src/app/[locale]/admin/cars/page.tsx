'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Check, X, Star, Trash2, Loader2, Car as CarIcon } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/shared/components/ui/tabs';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { CarDetailsDialog } from '@/features/admin/components/CarDetailsDialog';
import { adminApi } from '@/features/admin/api/admin.api';
import { useAdminAuth } from '@/features/admin/hooks/useAdminAuth';
import { CAR_TRANSMISSION_LABELS } from '@/features/admin/lib/carLabels';
import { formatPrice } from '@/shared/lib/utils';
import { toast } from 'sonner';
import type { Car } from '@/shared/types/car';

// Same paging convention as the properties admin page.
const PAGE_SIZE = 20;

const statusVariant: Record<string, 'pending' | 'approved' | 'rejected' | 'sold' | 'default'> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  sold: 'sold',
  rented: 'sold',
  expired: 'default',
};

export default function AdminCarsPage() {
  const { isAuthenticated, isHydrated } = useAdminAuth();
  const [status, setStatus] = useState('pending');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [cars, setCars] = useState<Car[]>([]);
  const [pagesLoaded, setPagesLoaded] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadFrom = useCallback(
    async (count: number) => {
      setIsLoading(true);
      try {
        const all: Car[] = [];
        let loaded = 0;
        let pages = 1;
        for (let p = 1; p <= count; p++) {
          const { items, meta } = await adminApi.listCarsPaged({
            status,
            page: p,
            limit: PAGE_SIZE,
          });
          all.push(...(items as Car[]));
          pages = meta?.totalPages ?? 1;
          loaded = p;
          if (p >= pages) break;
        }
        setCars(all);
        setPagesLoaded(loaded);
        setTotalPages(pages);
      } catch {
        toast.error('تعذّر تحميل العربيات');
      } finally {
        setIsLoading(false);
      }
    },
    [status]
  );

  async function loadMore() {
    const next = pagesLoaded + 1;
    setIsLoadingMore(true);
    try {
      const { items, meta } = await adminApi.listCarsPaged({
        status,
        page: next,
        limit: PAGE_SIZE,
      });
      setCars((prev) => [...prev, ...(items as Car[])]);
      setPagesLoaded(next);
      setTotalPages(meta?.totalPages ?? totalPages);
    } catch {
      toast.error('تعذّر تحميل المزيد');
    } finally {
      setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    setSelectedIds(new Set());
    loadFrom(1);
  }, [isAuthenticated, loadFrom]);

  const refetch = useCallback(() => {
    loadFrom(pagesLoaded);
  }, [loadFrom, pagesLoaded]);

  const hasMore = pagesLoaded < totalPages;

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allSelected = cars.length > 0 && selectedIds.size === cars.length;

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(cars.map((c) => c._id)));
  }

  async function bulkDelete() {
    setBulkDeleting(true);
    try {
      const { deletedCount } = await adminApi.bulkDeleteCars([...selectedIds]);
      toast.success(`تم حذف ${deletedCount} إعلان`);
      setSelectedIds(new Set());
      refetch();
    } catch {
      toast.error('تعذّر حذف الإعلانات');
    } finally {
      setBulkDeleting(false);
    }
  }

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-5 sm:mb-6">إدارة العربيات</h1>

        <Tabs value={status} onValueChange={setStatus}>
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
            ) : cars.length === 0 ? (
              <Card className="p-10 sm:p-16 text-center text-muted-foreground border-dashed">
                لا توجد عربيات
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 mb-3 rounded-lg border border-border bg-secondary/40 px-3 py-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                    <Checkbox
                      checked={allSelected ? true : selectedIds.size > 0 ? 'indeterminate' : false}
                      onCheckedChange={toggleAll}
                      aria-label="تحديد كل العربيات"
                    />
                    <span className="text-foreground">
                      {selectedIds.size > 0 ? `تم تحديد ${selectedIds.size}` : 'تحديد الكل'}
                    </span>
                  </label>

                  {selectedIds.size > 0 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="size-4" />
                          حذف المحدد ({selectedIds.size})
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md w-[calc(100vw-2rem)]">
                        <DialogHeader>
                          <DialogTitle>حذف الإعلانات المحددة</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          هل أنت متأكد من حذف {selectedIds.size} إعلان؟ سيتم حذف الإعلانات
                          وصورها نهائياً ولا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                          <Button
                            onClick={bulkDelete}
                            variant="destructive"
                            disabled={bulkDeleting}
                            className="w-full sm:w-auto"
                          >
                            {bulkDeleting && <Loader2 className="size-4 animate-spin" />}
                            تأكيد حذف {selectedIds.size} إعلان
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="space-y-3">
                  {cars.map((c) => (
                    <AdminCarRow
                      key={c._id}
                      car={c}
                      onAction={refetch}
                      selected={selectedIds.has(c._id)}
                      onToggleSelect={toggleOne}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-5 flex justify-center">
                    <Button onClick={loadMore} disabled={isLoadingMore} variant="outline" className="min-w-40">
                      {isLoadingMore && <Loader2 className="size-4 animate-spin" />}
                      عرض المزيد
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function AdminCarRow({
  car,
  onAction,
  selected,
  onToggleSelect,
}: {
  car: Car;
  onAction: () => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const tProp = useTranslations('property');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    try {
      await adminApi.deleteCar(car._id);
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
      await adminApi.reviewCar(car._id, 'approved');
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
      await adminApi.reviewCar(car._id, 'rejected', rejectionReason);
      toast.success('تم الرفض');
      onAction();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className={`border-border p-3 sm:p-4 overflow-hidden ${selected ? 'ring-2 ring-primary' : ''}`}>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative w-full sm:w-40 aspect-[16/9] sm:aspect-[4/3] rounded-lg overflow-hidden shrink-0 bg-secondary">
          {car.images[0]?.url ? (
            <Image
              src={car.images[0].url}
              alt={`${car.make} ${car.model}`}
              fill
              sizes="(min-width: 640px) 200px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CarIcon className="size-8 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute top-2 start-2 z-10">
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggleSelect(car._id)}
              className="size-5 border-2 bg-background/90 shadow-sm"
              aria-label="تحديد هذا الإعلان"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {car.make} {car.model} {car.year}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{car.governorate}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                المعلن: {car.owner?.name ?? '—'}
                {car.mileage != null ? ` · ${formatPrice(car.mileage)} كم` : ''}
                {` · ${CAR_TRANSMISSION_LABELS[car.transmission]}`}
              </p>
            </div>
            <Badge variant={statusVariant[car.status]} className="shrink-0">
              {tProp(`status.${car.status}`)}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="text-base sm:text-lg font-bold text-primary tabular-nums">
              {car.price != null ? `${formatPrice(car.price)} ج.م` : 'السعر عند التواصل'}
            </div>

            {(car.ratingCount ?? 0) > 0 ? (
              <span className="flex shrink-0 items-center gap-1">
                <Star className="size-4 fill-accent text-accent" />
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {car.ratingAvg.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">({car.ratingCount} تقييم)</span>
              </span>
            ) : (
              <span className="shrink-0 text-xs text-muted-foreground">بدون تقييم</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <CarDetailsDialog car={car} onAction={onAction} />

            {car.status === 'pending' && (
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

            {car.status === 'approved' && (
              <Button
                onClick={async () => {
                  await adminApi.setCarFeatured(car._id, !car.isFeatured);
                  toast.success(car.isFeatured ? 'تم الإلغاء' : 'تم إضافته للمميزة');
                  onAction();
                }}
                variant="outline"
                size="sm"
                className={car.isFeatured ? 'text-amber-600 border-amber-300' : ''}
              >
                <Star className={`size-4 ${car.isFeatured ? 'fill-current' : ''}`} />
                {car.isFeatured ? 'مميز' : 'إضافة للمميزة'}
              </Button>
            )}

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
                  هل أنت متأكد من حذف إعلان &quot;{car.make} {car.model}&quot;؟ سيتم حذف
                  الإعلان وصوره نهائياً ولا يمكن التراجع عن هذا الإجراء.
                </p>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button onClick={remove} variant="destructive" disabled={deleting} className="w-full sm:w-auto">
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
