'use client';
/**
 * Final CTA — split between a list-property primary action and a browse secondary action.
 */
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Sparkles } from 'lucide-react';
import { Link } from '@/config/navigation';
import { Button } from '@/shared/components/ui/button';

export function CtaSection() {
  const t = useTranslations('home');

  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-[#0f2a24] dark:from-[#16332c] dark:via-[#102822] dark:to-[#0c0a08] px-6 py-14 md:px-14 md:py-20"
        >
          {/* Decorative orbs */}
          <div className="absolute -top-24 -end-24 size-80 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -start-24 size-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative max-w-3xl mx-auto text-center text-primary-foreground dark:text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-4 py-1.5 text-sm font-medium text-accent backdrop-blur-sm mb-6">
              <Sparkles className="size-4" />
              <span>{t('heroBadge')}</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-5">
              {t('ctaTitle')}
            </h2>
            <p className="text-base md:text-lg text-primary-foreground/85 dark:text-white/85 leading-relaxed max-w-2xl mx-auto mb-9">
              {t('ctaSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                variant="accent"
                className="w-full sm:w-auto h-14 px-8 text-base font-bold shadow-xl hover:shadow-2xl transition-shadow"
              >
                <Link href="/add-property">
                  <Plus className="size-5" />
                  {t('ctaPublish')}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-transparent text-primary-foreground dark:text-white border-white/30 hover:bg-white/10 hover:text-primary-foreground dark:hover:text-white hover:border-white/50"
              >
                <Link href="/properties">
                  {t('ctaBrowse')}
                  <ArrowLeft className="size-4 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
