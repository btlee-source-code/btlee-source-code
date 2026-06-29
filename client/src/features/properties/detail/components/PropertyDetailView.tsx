'use client';
/**
 * Property detail UI (client) — receives the property already fetched on the
 * server (so the content is in the initial HTML for SEO) and layers the
 * interactive pieces (gallery, wishlist, rating, share, map, similar) on top.
 */
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Eye,
  ArrowUpRight,
  Building2,
  Star,
  Flame,
  Droplets,
  Zap,
  ArrowUpDown,
  Car,
  Wallet,
  Wifi,
} from 'lucide-react';
import { WhatsAppIcon } from '@/shared/components/icons/WhatsAppIcon';
import { useFetch } from '@/shared/hooks/useFetch';
import { propertiesApi } from '@/features/properties/api/properties.api';
import { PropertyGallery } from '@/features/properties/detail/components/PropertyGallery';
import { PropertyMap } from '@/features/properties/detail/components/PropertyMap';
import { ShareButton } from '@/features/properties/detail/components/ShareButton';
import { PropertyRating } from '@/features/properties/detail/components/PropertyRating';
import { WishlistButton } from '@/features/wishlist/components/WishlistButton';
import { ReportDialog } from '@/features/reports/components/ReportDialog';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Separator } from '@/shared/components/ui/separator';
import { Link } from '@/config/navigation';
import { formatPrice, formatDate, whatsappLink } from '@/shared/lib/utils';
import type { Property } from '@/shared/types/property';

const SERVICE_ICONS = {
  gas: Flame,
  water: Droplets,
  electricity: Zap,
  wifi: Wifi,
} as const;

export function PropertyDetailView({ property }: { property: Property }) {
  const t = useTranslations('property');

  const { data: similar } = useFetch(() => propertiesApi.similar(property._id), [property._id]);

  const coordinates = property.location?.coordinates ?? null;
  const siteUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6"
      >
        {/* Main column */}
        <div className="space-y-6">
          <PropertyGallery images={property.images} alt={property.area_name} />

          {/* Header info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {property.isFeatured && (
                <Badge className="gap-1 border-transparent bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  مميز
                </Badge>
              )}
              <Badge className="border-transparent bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {t(`listingTypes.${property.listingType}`)}
              </Badge>
              <Badge className="border-transparent bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {t(`types.${property.type}`)}
              </Badge>
              <Badge className="border-transparent bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {t(`categories.${property.category}`)}
              </Badge>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t(`types.${property.type}`)} في {property.area_name}
            </h1>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-4" />
              <span>{property.area_name}، {property.governorate}</span>
            </div>

            <div className="flex items-baseline gap-2">
              {property.price != null ? (
                <>
                  <span className="text-3xl md:text-4xl font-bold text-primary">
                    {formatPrice(property.price)}
                  </span>
                  <span className="text-base text-muted-foreground">{t('currency')}</span>
                  {property.listingType === 'rent' && (
                    <span className="text-sm text-muted-foreground">/ شهرياً</span>
                  )}
                </>
              ) : (
                <span className="text-2xl md:text-3xl font-bold text-primary">
                  {t('priceOnRequest')}
                </span>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-2">
            <WishlistButton propertyId={property._id} />
            <ShareButton url={siteUrl} title={`${t(`types.${property.type}`)} في ${property.area_name}`} />
            <ReportDialog propertyId={property._id} />
            <div className="flex-1" />
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="size-3.5" />
              {property.viewCount} {t('views')}
            </span>
          </div>

          {/* Rating */}
          <PropertyRating
            propertyId={property._id}
            ratingAvg={property.ratingAvg ?? 0}
            ratingCount={property.ratingCount ?? 0}
            ownerId={property.owner?._id ?? null}
          />

          {/* Specs grid */}
          <Card className="border-border p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Spec icon={BedDouble} label={t('bedrooms')} value={String(property.bedrooms)} />
              <Spec icon={Bath} label={t('bathrooms')} value={String(property.bathrooms)} />
              {property.area != null && (
                <Spec
                  icon={Maximize2}
                  label={t('area')}
                  value={`${property.area} ${t('areaUnit')}`}
                />
              )}
              {property.floor !== null && (
                <Spec icon={Building2} label={t('floor')} value={String(property.floor)} />
              )}
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <KeyValue label={t('finishingLabel')} value={t(`finishing.${property.finishing}`)} />
              <KeyValue label={t('categoryLabel')} value={t(`categories.${property.category}`)} />
              <KeyValue label={t('publishedOn')} value={formatDate(property.createdAt)} />
              <KeyValue
                label={t('listingNumber')}
                value={property.seq != null ? `#${property.seq}` : `#${property._id.slice(-6)}`}
              />
            </div>
          </Card>

          {/* Features & Services */}
          {(property.services?.length > 0 ||
            property.hasElevator ||
            property.hasGarage ||
            property.deposit) && (
            <Card className="border-border p-5 space-y-4">
              <h2 className="font-bold text-lg">{t('servicesLabel')}</h2>
              {property.services?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {property.services.map((s) => {
                    const Icon = SERVICE_ICONS[s];
                    return (
                      <span
                        key={s}
                        className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                      >
                        <Icon className="size-4" />
                        {t(`services.${s}`)}
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.hasElevator && (
                  <Spec icon={ArrowUpDown} label={t('elevator')} value={t('yes')} />
                )}
                {property.hasGarage && (
                  <Spec icon={Car} label={t('garage')} value={t('yes')} />
                )}
                {property.deposit && (
                  <Spec
                    icon={Wallet}
                    label={t('depositLabel')}
                    value={t(`deposit.${property.deposit}`)}
                  />
                )}
              </div>
            </Card>
          )}

          {/* Description */}
          <Card className="border-border p-5">
            <h2 className="font-bold text-lg mb-3">{t('description')}</h2>
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </Card>

          {/* Map — only when the owner pinned a location */}
          {coordinates && (
            <Card className="border-border p-5">
              <h2 className="font-bold text-lg mb-3">{t('location')}</h2>
              <PropertyMap lng={coordinates[0]} lat={coordinates[1]} />
            </Card>
          )}
        </div>

        {/* Sticky contact sidebar */}
        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <Card className="border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="size-12 border border-border">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {property.owner?.name?.charAt(0) ?? '؟'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground line-clamp-1">
                  {property.owner?.name ?? t('contactOwner')}
                </p>
                <p className="text-xs text-muted-foreground">{t('ownerProfile')}</p>
              </div>
            </div>
            <Separator className="mb-4" />
            <Button
              asChild
              className="w-full mb-2 font-semibold bg-[#25D366] text-white shadow-sm hover:bg-[#1FB857]"
              size="lg"
            >
              <a
                href={whatsappLink(
                  property.whatsappNumber,
                  `مرحباً، أنا مهتم بـ ${property.area_name}`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="size-5" />
                {t('contactOwner')}
              </a>
            </Button>
            {property.owner?._id && (
              <Button asChild variant="outline" className="w-full">
                <Link href={`/owners/${property.owner._id}` as never}>
                  <ArrowUpRight className="size-4" />
                  {t('allListingsByOwner')}
                </Link>
              </Button>
            )}
          </Card>
        </aside>
      </motion.div>

      {/* Similar properties */}
      {similar && similar.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
            {t('similarProperties')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {similar.slice(0, 4).map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
