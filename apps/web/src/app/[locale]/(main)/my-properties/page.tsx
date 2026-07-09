'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Plus, Edit, Trash2, Eye, CheckCircle, AlertCircle, MapPin,
} from 'lucide-react';
import { Link, useRouter } from '@/config/navigation';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { useFetch } from '@/shared/hooks/useFetch';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { propertiesApi } from '@/features/properties/api/properties.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { formatPrice } from '@/shared/lib/utils';
import { useState } from 'react';
import type { Property } from '@/shared/types/property';

const statusVariant: Record<string, 'default' | 'pending' | 'approved' | 'rejected' | 'sold'> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  sold: 'sold',
  rented: 'sold',
  expired: 'default',
};

export default function MyPropertiesPage() {
  const t = useTranslations('myProperties');
  const tProp = useTranslations('property');
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  usePageTitle(t('title'));

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push('/login');
  }, [isHydrated, isAuthenticated, router]);

  const { data: items, isLoading, refetch } = useFetch(
    () => propertiesApi.mine(),
    [],
    { enabled: isAuthenticated }
  );

  if (!isHydrated) return null;

  async function handleDelete(id: string) {
    try {
      await propertiesApi.remove(id);
      toast.success('تم حذف الإعلان');
      refetch();
    } catch {
      toast.error('فشل الحذف');
    }
  }

  async function handleMark(id: string, status: 'sold' | 'rented') {
    try {
      await propertiesApi.mark(id, status);
      toast.success(status === 'sold' ? 'تم تأشيره كمُباع' : 'تم تأشيره كمؤجر');
      refetch();
    } catch {
      toast.error('فشل التحديث');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
          <Button asChild variant="accent" className="font-semibold">
            <Link href="/add-property">
              <Plus className="size-4" />
              {t('addNew')}
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="space-y-4">
            {items.map((p) => (
              <MyPropertyRow
                key={p._id}
                property={p}
                statusLabel={tProp(`status.${p.status}`)}
                onDelete={() => handleDelete(p._id)}
                onMark={(s) => handleMark(p._id, s)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center border-dashed">
            <p className="text-muted-foreground mb-4">{t('noListings')}</p>
            <Button asChild variant="accent">
              <Link href="/add-property">
                <Plus className="size-4" />
                {t('addNew')}
              </Link>
            </Button>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

function MyPropertyRow({
  property,
  statusLabel,
  onDelete,
  onMark,
}: {
  property: Property;
  statusLabel: string;
  onDelete: () => void;
  onMark: (s: 'sold' | 'rented') => void;
}) {
  const t = useTranslations('myProperties');
  const tProp = useTranslations('property');
  const [markStatus, setMarkStatus] = useState<'sold' | 'rented' | ''>('');

  return (
    <Card className="border-border p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-48 aspect-[4/3] rounded-lg overflow-hidden shrink-0 bg-secondary">
          <Image
            src={property.images[0]?.url ?? ''}
            alt={property.area_name}
            fill
            sizes="200px"
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1">{property.area_name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="size-3" />
                {property.governorate}
              </p>
            </div>
            <Badge variant={statusVariant[property.status]}>{statusLabel}</Badge>
          </div>

          <div className="text-lg font-bold text-primary">
            {property.price != null ? `${formatPrice(property.price)} ج.م` : tProp('priceOnRequest')}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {property.viewCount} مشاهدة
            </span>
          </div>

          {property.status === 'rejected' && property.rejectionReason && (
            <div className="rounded-md bg-red-50 border border-red-200 p-2.5 text-xs text-red-800">
              <span className="font-semibold">{t('rejectionReason')}:</span> {property.rejectionReason}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/properties/${property._id}` as never}>
                <Eye className="size-4" />
                عرض
              </Link>
            </Button>

            {(property.status === 'pending' || property.status === 'rejected' || property.status === 'approved') && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/my-properties/${property._id}/edit` as never}>
                  <Edit className="size-4" />
                  {property.status === 'rejected' ? t('editAndResubmit') : 'تعديل'}
                </Link>
              </Button>
            )}

            {property.status === 'approved' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-violet-700 border-violet-300 hover:bg-violet-50">
                    <CheckCircle className="size-4" />
                    تأشير
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>تأشير حالة العقار</DialogTitle>
                    <DialogDescription>
                      الإعلان هيختفي من المنصة بعد التأشير وهتوصلك رسالة شكر على بريدك
                    </DialogDescription>
                  </DialogHeader>
                  <Select value={markStatus} onValueChange={(v) => setMarkStatus(v as 'sold' | 'rented')}>
                    <SelectTrigger><SelectValue placeholder="اختر الحالة" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sold">{t('markAsSold')}</SelectItem>
                      <SelectItem value="rented">{t('markAsRented')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <DialogFooter>
                    <Button disabled={!markStatus} onClick={() => markStatus && onMark(markStatus)}>
                      تأكيد
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="size-4" />
                  حذف
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('confirmDelete')}</DialogTitle>
                  <DialogDescription>هذا الإجراء لا يمكن التراجع عنه</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={onDelete}>تأكيد الحذف</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Card>
  );
}
