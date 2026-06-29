'use client';
/**
 * Hero — premium above-the-fold experience.
 * Photographic background, animated entry, segmented search,
 * autocomplete-powered query field, and trust indicators.
 */
import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  ShieldCheck,
  MessageCircle,
  BadgePercent,
  Sparkles,
  Plus,
  Home,
  KeyRound,
  Store,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from '@/config/navigation';
import { Button } from '@/shared/components/ui/button';
import { SearchAutocomplete } from './SearchAutocomplete';

type Tab = 'all' | 'sale' | 'rent' | 'commercial';

const tabs: { value: Tab; key: string; icon: LucideIcon }[] = [
  { value: 'sale', key: 'buy', icon: Home },
  { value: 'rent', key: 'rent', icon: KeyRound },
  { value: 'commercial', key: 'commercial', icon: Store },
  { value: 'all', key: 'all', icon: LayoutGrid },
];

export function HeroSection() {
  const t = useTranslations('home');
  const tc = useTranslations('common');
  const tn = useTranslations('nav');
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const tabLabelMap: Record<string, string> = {
    all: tc('all'),
    buy: tn('buy'),
    rent: tn('rent'),
    commercial: tn('commercial'),
  };

  const trustItems = [
    { icon: ShieldCheck, label: t('trustVerified') },
    { icon: MessageCircle, label: t('trustDirectContact') },
    { icon: BadgePercent, label: t('trustNoCommission') },
  ];

  return (
    // Section is NOT overflow-hidden — the search dropdown needs to escape
    // its bounds and float above the StatsSection that follows. Background
    // image + overlays live inside a clipped child instead.
    <section className="relative bg-primary pt-20 pb-24 md:pt-28 md:pb-32">
      {/* Background — photograph + overlays, clipped to the section */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/Home-section/Home-Backgorund.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Dark mode keeps a lighter wash than light mode: the background photo
            is bright, so over-darkening it looks off. The hero stays airy while
            the rest of the page is near-black. */}
        <div className="absolute inset-0 bg-[#0f2620]/70 dark:bg-[#0f2620]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2620]/30 via-transparent to-[#0f2620]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent dark:from-background/30" />
        {/* Bottom fade — kept inside the clipped background container */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mx-auto max-w-4xl text-center text-primary-foreground dark:text-white"
        >
          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-4 py-1.5 text-sm font-medium text-accent backdrop-blur-sm mb-6"
          >
            <Sparkles className="size-4" />
            <span>{t('heroBadge')}</span>
          </motion.div>

          {/* Title — each phrase is its own block line and never wraps
              internally (whitespace-nowrap), so the white phrase always sits on
              one line and the accent phrase on the next. The font scales with the
              viewport (clamp) on phones and steps up on larger breakpoints. */}
          <h1 className="text-[clamp(1.35rem,6.6vw,2.5rem)] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.2] sm:leading-[1.15] tracking-tight mb-5 dark:[text-shadow:0_2px_16px_rgba(0,0,0,0.55)]">
            <span className="block whitespace-nowrap">
              {t('heroTitle')}
            </span>
            <span className="block whitespace-nowrap mt-2 sm:mt-3">
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-accent to-[#e0b860] bg-clip-text text-transparent">
                  {t('heroTitleAccent')}
                </span>
                <span className="absolute inset-x-0 bottom-1 sm:bottom-2 h-3 sm:h-4 -z-0 bg-accent/20 rounded-sm" />
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg lg:text-xl text-primary-foreground dark:text-white/90 leading-relaxed max-w-2xl mx-auto mb-10">
            {t('heroSubtitle')}
          </p>

          {/* Search Box — `relative z-30` overrides the stacking context the
              backdrop-blur creates, so the autocomplete dropdown can float
              above the StatsSection that follows the Hero in document flow. */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="relative z-30 bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 sm:p-4 text-start ring-1 ring-white/20"
          >
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-3 p-1.5 rounded-xl bg-secondary/70">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  aria-pressed={activeTab === tab.value}
                  className={`flex flex-1 min-w-[72px] sm:flex-initial sm:min-w-[100px] items-center justify-center gap-2 cursor-pointer rounded-xl px-4 py-2.5 sm:py-2 text-sm font-semibold border-2 transition-all active:scale-[0.97] active:translate-y-px ${
                    activeTab === tab.value
                      ? 'bg-accent text-accent-foreground border-accent shadow-md'
                      : 'bg-card text-foreground border-accent/70 shadow-sm hover:border-accent hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <tab.icon
                    className={`size-4 shrink-0 ${
                      activeTab === tab.value ? 'text-accent-foreground' : 'text-accent'
                    }`}
                    strokeWidth={2}
                  />
                  {tabLabelMap[tab.key]}
                </button>
              ))}
            </div>

            {/* Autocomplete-powered search */}
            <SearchAutocomplete activeTab={activeTab} />
          </motion.div>

          {/* Seller CTA — prominent, hard-to-miss entry point to post a listing.
              Sits right under the search so sellers don't hunt for "Add listing". */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <span className="text-sm font-medium text-primary-foreground/85 dark:text-white/85">
              {t('heroSellerPrompt')}
            </span>
            <Button
              asChild
              variant="accent"
              size="lg"
              className="rounded-full px-7 font-bold shadow-lg shadow-accent/30 ring-1 ring-white/20 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40"
            >
              <Link href="/add-property">
                <Plus className="size-5" strokeWidth={2.75} />
                {t('heroSellersAction')}
              </Link>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-primary-foreground/85 dark:text-white/85"
          >
            {trustItems.map((item) => (
              <div key={item.label} className="inline-flex items-center gap-2 text-sm">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <item.icon className="size-3.5" strokeWidth={2.5} />
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
