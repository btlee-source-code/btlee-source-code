'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useFetch } from '@/shared/hooks/useFetch';
import { adminApi } from '@/features/admin/api/admin.api';
import { useAdminAuth } from '@/features/admin/hooks/useAdminAuth';
import { formatPrice } from '@/shared/lib/utils';
import { toast } from 'sonner';
import type { Property } from '@/shared/types/property';

export default function FeaturedPage() {
  const { isAuthenticated, isHydrated } = useAdminAuth();

  const { data, isLoading, refetch } = useFetch(
    () => adminApi.listProperties({ status: 'approved', limit: 100 }),
    [],
    { enabled: isAuthenticated }
  );

  if (!isHydrated || !isAuthenticated) return null;

  async function toggle(id: string, isFeatured: boolean) {
    await adminApi.setFeatured(id, !isFeatured);
    toast.success(isFeatured ? 'تم الإلغاء' : 'تم الإضافة للمميزة');
    refetch();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">العقارات المميزة</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-6">
          اختر العقارات التي ستظهر في قسم &quot;مميزة&quot; بالصفحة الرئيسية
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 sm:h-48 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {(data as Property[])?.map((p) => (
              <Card
                key={p._id}
                className={`border-border p-3 ${p.isFeatured ? 'ring-2 ring-amber-400' : ''}`}
              >
                <div className="flex gap-3">
                  <div className="relative w-24 sm:w-28 aspect-[4/3] rounded-lg overflow-hidden bg-secondary shrink-0">
                    <Image
                      src={p.images[0]?.url ?? ''}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-1">{p.area_name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate">{p.governorate}</span>
                    </p>
                    <p className="text-sm font-bold text-primary mt-1 tabular-nums">
                      {p.price != null ? `${formatPrice(p.price)} ج.م` : 'السعر عند التواصل'}
                    </p>
                  </div>
                </div>
                <Button
                  variant={p.isFeatured ? 'accent' : 'outline'}
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => toggle(p._id, p.isFeatured)}
                >
                  <Star className={`size-4 ${p.isFeatured ? 'fill-current' : ''}`} />
                  {p.isFeatured ? 'إلغاء التميز' : 'إضافة للمميزة'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
