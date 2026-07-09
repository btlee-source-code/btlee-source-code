'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useRouter } from '@/config/navigation';
import { PropertyForm } from '@/features/properties/form/components/PropertyForm';
import { propertiesApi } from '@/features/properties/api/properties.api';
import { useFetch } from '@/shared/hooks/useFetch';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const tNav = useTranslations('nav');
  const { isAuthenticated, isHydrated } = useAuth();
  usePageTitle(tNav('editProperty'));

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push('/login');
  }, [isHydrated, isAuthenticated, router]);

  const { data: property, isLoading } = useFetch(
    () => propertiesApi.getOne(id),
    [id]
  );

  if (!isHydrated || !isAuthenticated || isLoading || !property) {
    return <div className="container mx-auto p-8">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">تعديل الإعلان</h1>

        <PropertyForm
          initialValues={{
            type: property.type,
            listingType: property.listingType,
            category: property.category,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            floor: property.floor ?? undefined,
            area: property.area ?? undefined,
            finishing: property.finishing,
            services: property.services ?? [],
            hasElevator: property.hasElevator ?? false,
            hasGarage: property.hasGarage ?? false,
            deposit: property.deposit ?? undefined,
            price: property.price ?? undefined,
            governorate: property.governorate,
            area_name: property.area_name,
            description: property.description,
            whatsappNumber: property.whatsappNumber,
            durationDays: property.durationDays,
          }}
          initialImages={property.images}
          initialCoordinates={property.location?.coordinates ?? null}
          submitLabel="حفظ التعديلات"
          onSubmit={async ({ form, images, coordinates }) => {
            await propertiesApi.update(id, { ...form, images, coordinates: coordinates ?? undefined });
            toast.success('تم حفظ التعديلات' + (property.status === 'rejected' ? ' وإعادة تقديم الإعلان' : ''));
            router.push('/my-properties');
          }}
        />
      </motion.div>
    </div>
  );
}
