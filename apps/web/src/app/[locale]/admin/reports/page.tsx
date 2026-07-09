'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle, XCircle, ExternalLink, Flag } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/shared/components/ui/tabs';
import { Link } from '@/config/navigation';
import { useFetch } from '@/shared/hooks/useFetch';
import { adminApi } from '@/features/admin/api/admin.api';
import { useAdminAuth } from '@/features/admin/hooks/useAdminAuth';
import { formatDate } from '@/shared/lib/utils';
import { toast } from 'sonner';

const reasonLabels: Record<string, string> = {
  fake_listing: 'إعلان مزيف',
  wrong_info: 'معلومات خاطئة',
  duplicate: 'إعلان مكرر',
  inappropriate: 'محتوى غير لائق',
  spam: 'سبام',
  other: 'سبب آخر',
};

export default function AdminReportsPage() {
  const { isAuthenticated, isHydrated } = useAdminAuth();
  const [tab, setTab] = useState<'open' | 'reviewed' | 'dismissed'>('open');

  const { data, isLoading, refetch } = useFetch(
    () => adminApi.listReports(tab),
    [tab],
    { enabled: isAuthenticated }
  );

  if (!isHydrated || !isAuthenticated) return null;

  async function update(id: string, status: 'reviewed' | 'dismissed') {
    await adminApi.updateReport(id, status);
    toast.success(status === 'reviewed' ? 'تم تأشيره كمُراجَع' : 'تم رفض البلاغ');
    refetch();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-5 sm:mb-6 flex items-center gap-2">
          <Flag className="size-5 sm:size-6" />
          التقارير
        </h1>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'open' | 'reviewed' | 'dismissed')}>
          <div className="overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
            <TabsList className="inline-flex w-max">
              <TabsTrigger value="open">مفتوحة</TabsTrigger>
              <TabsTrigger value="reviewed">تمت مراجعتها</TabsTrigger>
              <TabsTrigger value="dismissed">مرفوضة</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={tab} className="mt-5 sm:mt-6">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-40 sm:h-32 rounded-xl bg-secondary animate-pulse" />
                ))}
              </div>
            ) : data?.length === 0 ? (
              <Card className="p-10 sm:p-16 text-center text-muted-foreground border-dashed">
                لا توجد تقارير
              </Card>
            ) : (
              <div className="space-y-3">
                {data?.map((r) => (
                  <Card key={r._id} className="border-border p-3 sm:p-4 overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <div className="relative w-full sm:w-28 aspect-[16/9] sm:aspect-[4/3] rounded-lg overflow-hidden shrink-0 bg-secondary">
                        <Image
                          src={r.property.images[0]?.url ?? ''}
                          alt=""
                          fill
                          sizes="(min-width: 640px) 120px, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm truncate">{r.property.area_name}</h3>
                            <p className="text-xs text-muted-foreground truncate">{r.property.governorate}</p>
                          </div>
                          <Badge variant="rejected" className="shrink-0">
                            {reasonLabels[r.reason] ?? r.reason}
                          </Badge>
                        </div>
                        {r.details && (
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            {r.details}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground mt-2 truncate">
                          مبلغ بواسطة {r.reporter.name} • {formatDate(r.createdAt)}
                        </div>
                        {r.status === 'open' && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/properties/${r.property._id}` as never} target="_blank">
                                <ExternalLink className="size-3.5" />
                                عرض العقار
                              </Link>
                            </Button>
                            <Button
                              onClick={() => update(r._id, 'reviewed')}
                              variant="outline"
                              size="sm"
                              className="text-emerald-700"
                            >
                              <CheckCircle className="size-4" />
                              تم المراجعة
                            </Button>
                            <Button
                              onClick={() => update(r._id, 'dismissed')}
                              variant="ghost"
                              size="sm"
                            >
                              <XCircle className="size-4" />
                              رفض البلاغ
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
