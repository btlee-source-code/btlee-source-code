'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/config/navigation';
import { Logo } from './Logo';
import { Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border bg-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Logo size="md" />
            <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link href={'https://www.facebook.com/share/1CuGDB45iY/' as never} className="rounded-full bg-card p-2 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="size-4" />
              </Link>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.explore')}</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/properties?listingType=sale" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.buy')}
                </Link>
              </li>
              <li>
                <Link href="/properties?listingType=rent" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.rent')}
                </Link>
              </li>
              <li>
                <Link href="/properties?category=commercial" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.commercial')}
                </Link>
              </li>
              <li>
                <Link href="/add-property" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.addProperty')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.account')}</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.login')}
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.register')}
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.wishlist')}
                </Link>
              </li>
              <li>
                <Link href="/my-properties" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.myProperties')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>© {year} {t('common.appName')}. {t('footer.rights')}</p>
          <div className="flex items-center gap-4">
            <Link href={'/privacy' as never} className="hover:text-primary transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href={'/disclaimer' as never} className="hover:text-primary transition-colors">
              {t('footer.disclaimer')}
            </Link>
          </div>
        </div>

        {/* Developer credit */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-muted-foreground">
          <span>من صنع وتطوير محمد هاني حسن</span>
          <span className="flex items-center gap-3">
            <a
              href="https://wa.me/201070010209"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary transition-colors"
              dir="ltr"
            >
              <MessageCircle className="size-3.5" />
              01070010209
            </a>
            <a
              href="https://wa.me/201010060446"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary transition-colors"
              dir="ltr"
            >
              <MessageCircle className="size-3.5" />
              01010060446
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
