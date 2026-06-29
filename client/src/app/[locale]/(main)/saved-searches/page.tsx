'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { BookmarkPlus, Trash2 } from 'lucide-react';
import { useRouter } from '@/config/navigation';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useFetch } from '@/shared/hooks/useFetch';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { savedSearchesApi } from '@/features/saved-searches/api/savedSearches.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { formatDate } from '@/shared/lib/utils';

export default function SavedSearchesPage() {
  const t = useTranslations('savedSearches');
  const router = useRouter();
  usePageTitle(t('title'));
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push('/login');
  }, [isHydrated, isAuthenticated, router]);

  const { data: items, isLoading, refetch } = useFetch(
    () => savedSearchesApi.list(),
    [],
    { enabled: isAuthenticated }
  );

  async function remove(id: string) {
    try {
      await savedSearchesApi.remove(id);
      toast.success('تم الحذف');
      refetch();
    } catch {
      toast.error('فشل');
    }
  }

  if (!isHydrated) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
            <BookmarkPlus className="size-7 text-primary" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="space-y-3">
            {items.map((s) => (
              <Card key={s._id} className="border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{s.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {s.governorate && <Badge variant="outline">{s.governorate}</Badge>}
                      {s.type && <Badge variant="outline">{s.type}</Badge>}
                      {s.listingType && <Badge variant="outline">{s.listingType}</Badge>}
                      {s.minPrice && <Badge variant="outline">من {s.minPrice}</Badge>}
                      {s.maxPrice && <Badge variant="outline">حتى {s.maxPrice}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(s.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(s._id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center border-dashed">
            <BookmarkPlus className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('empty')}</p>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
