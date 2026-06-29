'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useRouter } from '@/config/navigation';
import { PropertyForm } from '@/features/properties/form/components/PropertyForm';
import { propertiesApi } from '@/features/properties/api/properties.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { toast } from 'sonner';

export default function AddPropertyPage() {
  const t = useTranslations('addProperty');
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  usePageTitle(t('title'));

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      toast.error('يجب تسجيل الدخول لإضافة إعلان');
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <PropertyForm
          submitLabel={t('publish')}
          onSubmit={async ({ form, images, coordinates }) => {
            await propertiesApi.create({ ...form, images, coordinates: coordinates ?? undefined });
            toast.success('تم إرسال الإعلان للمراجعة');
            router.push('/my-properties');
          }}
        />
      </motion.div>
    </div>
  );
}
