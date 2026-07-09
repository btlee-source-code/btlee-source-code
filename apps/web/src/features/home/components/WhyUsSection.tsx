'use client';
/**
 * Why Btlee — 4 value-prop cards on an asymmetric grid with numbered badges.
 */
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ShieldCheck, MessageCircle, Gift, BadgeCheck } from 'lucide-react';

export function WhyUsSection() {
  const t = useTranslations('home');

  const items = [
    {
      icon: BadgeCheck,
      title: t('whyUsNoCommissionTitle'),
      desc: t('whyUsNoCommissionDesc'),
      accent: 'accent',
    },
    {
      icon: MessageCircle,
      title: t('whyUsDirectTitle'),
      desc: t('whyUsDirectDesc'),
      accent: 'primary',
    },
    {
      icon: Gift,
      title: t('whyUsFreeTitle'),
      desc: t('whyUsFreeDesc'),
      accent: 'primary',
    },
    {
      icon: ShieldCheck,
      title: t('whyUsVerifiedTitle'),
      desc: t('whyUsVerifiedDesc'),
      accent: 'accent',
    },
  ];

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-b from-secondary/40 via-background to-secondary/30 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 -start-32 size-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -end-32 size-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-block rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-bold tracking-wide uppercase mb-4">
              {t('whyUsTitle')}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              {t('whyUsTitle')}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              {t('whyUsSubtitle')}
            </p>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-5xl mx-auto">
          {items.map((item, i) => {
            const isAccent = item.accent === 'accent';
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 md:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30"
              >
                {/* Number tag */}
                <span
                  className={`absolute top-5 end-6 text-7xl font-black leading-none ${
                    isAccent ? 'text-accent/10' : 'text-primary/10'
                  } group-hover:scale-110 transition-transform pointer-events-none`}
                >
                  0{i + 1}
                </span>

                <div className="relative flex items-start gap-5">
                  <div
                    className={`flex-shrink-0 inline-flex size-14 md:size-16 items-center justify-center rounded-2xl ${
                      isAccent
                        ? 'bg-accent/15 text-accent'
                        : 'bg-primary/10 text-primary'
                    } transition-transform group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <item.icon className="size-7 md:size-8" strokeWidth={2} />
                  </div>

                  <div className="flex-1 pt-1">
                    <h3 className="font-bold text-xl md:text-2xl text-foreground mb-2 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
