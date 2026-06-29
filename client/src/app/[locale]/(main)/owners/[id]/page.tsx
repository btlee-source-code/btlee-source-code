'use client';
/**
 * Owner Profile Page — shows all approved listings by a specific owner.
 */
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Card } from '@/shared/components/ui/card';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { useFetch } from '@/shared/hooks/useFetch';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { usersApi } from '@/features/account/api/users.api';
import { propertiesApi } from '@/features/properties/api/properties.api';
import { formatDate } from '@/shared/lib/utils';

export default function OwnerProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const t = useTranslations('property');

  const { data: owner, isLoading: ownerLoading } = useFetch(
    () => usersApi.publicOwner(id),
    [id]
  );

  // Tab title becomes the owner's name once loaded.
  usePageTitle(owner?.name);
  const { data: listings, isLoading: listingsLoading } = useFetch(
    () => propertiesApi.byOwner(id),
    [id]
  );

  if (ownerLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="h-32 rounded-xl bg-secondary animate-pulse" />
      </div>
    );
  }

  if (!owner) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border p-6 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="size-20 border-2 border-border">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-bold">
                {owner.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{owner.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                عضو منذ {formatDate(owner.createdAt)}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {listings?.length ?? 0} عقار منشور
              </p>
            </div>
          </div>
        </Card>

        <h2 className="text-xl font-bold text-foreground mb-5">
          {t('allListingsByOwner')}
        </h2>

        {listingsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {listings.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        ) : (
          <Card className="border-border p-16 text-center text-muted-foreground">
            لا توجد إعلانات منشورة
          </Card>
        )}
      </motion.div>
    </div>
  );
}
