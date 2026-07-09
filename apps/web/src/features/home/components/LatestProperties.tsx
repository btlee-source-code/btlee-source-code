'use client';
/**
 * Latest Properties — newest approved listings with premium styling.
 */
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';
import { Link } from '@/config/navigation';
import { propertiesApi } from '@/features/properties/api/properties.api';
import { useFetch } from '@/shared/hooks/useFetch';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { Button } from '@/shared/components/ui/button';

export function LatestProperties() {
  const t = useTranslations('home');
  const tc = useTranslations('common');
  const { data, isLoading } = useFetch(() => propertiesApi.latest(), []);

  if (!isLoading && (!data || data.length === 0)) return null;

  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-bold tracking-wide uppercase mb-3">
              <Clock className="size-3.5" />
              {t('latestProperties')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2 leading-tight">
              {t('latestProperties')}
            </h2>
            <p className="text-muted-foreground text-base">{t('latestSubtitle')}</p>
          </div>
          <Button
            asChild
            variant="outline"
            className="self-start sm:self-auto border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Link href="/properties">
              {tc('viewAll')}
              <ArrowLeft className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-secondary via-card to-secondary animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {data?.slice(0, 8).map((p) => (
              <motion.div
                key={p._id}
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4 }}
              >
                <PropertyCard property={p} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
