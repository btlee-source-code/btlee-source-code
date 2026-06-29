'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Heart, Search } from 'lucide-react';
import { Link, useRouter } from '@/config/navigation';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { useFetch } from '@/shared/hooks/useFetch';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { wishlistApi } from '@/features/wishlist/api/wishlist.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PropertyCard } from '@/features/properties/components/PropertyCard';

export default function WishlistPage() {
  const t = useTranslations('wishlist');
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  usePageTitle(t('title'));

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push('/login');
  }, [isHydrated, isAuthenticated, router]);

  const { data: items, isLoading } = useFetch(
    () => wishlistApi.get(),
    [],
    { enabled: isAuthenticated }
  );

  if (!isHydrated) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
            <Heart className="size-7 text-red-500 fill-red-500" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((p) => (
              <PropertyCard key={p._id} property={p} initialInWishlist />
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center border-dashed">
            <Heart className="size-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground">{t('empty')}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-5">{t('emptyDesc')}</p>
            <Button asChild>
              <Link href="/properties">
                <Search className="size-4" />
                تصفح العقارات
              </Link>
            </Button>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
