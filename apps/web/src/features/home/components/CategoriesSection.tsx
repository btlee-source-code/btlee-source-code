'use client';
/**
 * Categories — 6-tile bento grid linking to filtered property listings.
 * Each tile has an icon, a label, a subtle accent and a hover sheen.
 */
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Building2,
  Home as HomeIcon,
  Palmtree,
  Store,
  Building,
  Briefcase,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from '@/config/navigation';

export function CategoriesSection() {
  const t = useTranslations('home');

  const items = [
    {
      icon: HomeIcon,
      title: t('categoriesApartments'),
      href: '/properties?type=apartment',
      gradient: 'from-primary/10 to-primary/5',
      iconBg: 'bg-primary/10 text-primary',
      span: 'sm:col-span-2 lg:col-span-2',
    },
    {
      icon: Building,
      title: t('categoriesVillas'),
      href: '/properties?type=villa',
      gradient: 'from-accent/15 to-accent/5',
      iconBg: 'bg-accent/15 text-accent',
      span: 'sm:col-span-1 lg:col-span-1',
    },
    {
      icon: Palmtree,
      title: t('categoriesChalets'),
      href: '/properties?type=chalet',
      gradient: 'from-primary/10 to-primary/5',
      iconBg: 'bg-primary/10 text-primary',
      span: 'sm:col-span-1 lg:col-span-1',
    },
    {
      icon: Store,
      title: t('categoriesCommercial'),
      href: '/properties?category=commercial',
      gradient: 'from-accent/15 to-accent/5',
      iconBg: 'bg-accent/15 text-accent',
      span: 'sm:col-span-1 lg:col-span-1',
    },
    {
      icon: Briefcase,
      title: t('categoriesRent'),
      href: '/properties?listingType=rent',
      gradient: 'from-primary/10 to-primary/5',
      iconBg: 'bg-primary/10 text-primary',
      span: 'sm:col-span-1 lg:col-span-1',
    },
    {
      icon: Building2,
      title: t('categoriesBuy'),
      href: '/properties?listingType=sale',
      gradient: 'from-accent/15 to-accent/5',
      iconBg: 'bg-accent/15 text-accent',
      span: 'sm:col-span-2 lg:col-span-2',
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-block rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-bold tracking-wide uppercase mb-4">
              {t('categories')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
              {t('categories')}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              {t('categoriesSubtitle')}
            </p>
          </motion.div>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-5">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={item.span}
            >
              <Link href={item.href as never} className="group block h-full">
                <div
                  className={`relative h-full overflow-hidden rounded-2xl border-2 border-accent shadow-lg shadow-accent/25 bg-gradient-to-br ${item.gradient} p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-xl hover:shadow-accent/45`}
                >
                  {/* Decorative dot pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle, currentColor 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />

                  <div className="relative flex flex-col h-full min-h-[140px] md:min-h-[160px] justify-between gap-4">
                    <div
                      className={`inline-flex size-12 md:size-14 items-center justify-center rounded-xl ${item.iconBg} transition-transform group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <item.icon className="size-6 md:size-7" strokeWidth={2} />
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <h3 className="font-bold text-base md:text-lg text-foreground leading-snug">
                        {item.title}
                      </h3>
                      <ArrowUpRight className="size-5 text-muted-foreground transition-all group-hover:text-primary group-hover:scale-110 rtl:rotate-[270deg]" />
                    </div>
                  </div>

                  {/* Hover sheen — a bright white wash reads well over the light
                      cards, but turns muddy over the warm-dark ones, so dark
                      mode gets a soft, chic gold glow instead. */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none dark:from-accent/12 dark:via-accent/[0.03]" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
