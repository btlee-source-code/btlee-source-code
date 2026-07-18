'use client';
/**
 * Admin "user details" popup — opens from a user row and shows the user's
 * profile plus every listing they've posted (properties + cars, all statuses).
 * If they've never posted, it shows a friendly empty state instead.
 */
import { useState } from 'react';
import Image from 'next/image';
import {
  Mail, Phone, Calendar, Loader2, PackageOpen, MapPin, ExternalLink, Building2, Car as CarIcon,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Link } from '@/config/navigation';
import { adminApi, type UserAdmin, type UserListingsAdmin } from '@/features/admin/api/admin.api';
import { formatPrice, formatDate } from '@/shared/lib/utils';
import { toast } from 'sonner';
import type { Property } from '@/shared/types/property';
import type { Car } from '@/shared/types/car';

const STATUS_LABEL: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'منشور',
  rejected: 'مرفوض',
  sold: 'مباع',
  rented: 'مؤجر',
  expired: 'منتهي',
};
const statusVariant: Record<string, 'pending' | 'approved' | 'rejected' | 'sold' | 'default'> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  sold: 'sold',
  rented: 'sold',
  expired: 'default',
};

export function UserDetailsDialog({
  user,
  children,
}: {
  user: UserAdmin;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<UserListingsAdmin | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setData(await adminApi.getUserListings(user._id));
    } catch {
      toast.error('تعذّر تحميل بيانات المستخدم');
    } finally {
      setLoading(false);
    }
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next && !data && !loading) load();
  }

  const total = (data?.properties.length ?? 0) + (data?.cars.length ?? 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-2xl w-[calc(100vw-1.5rem)] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
          <DialogTitle className="text-base sm:text-lg">بيانات المستخدم</DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-5">
          {/* Profile */}
          <div className="flex items-center gap-3">
            <Avatar className="size-14 border border-border shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-foreground truncate">{user.name}</h3>
                {user.isBlocked && <Badge variant="rejected">محظور</Badge>}
              </div>
              {user.email && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                  <Mail className="size-3.5 shrink-0" /> {user.email}
                </p>
              )}
              {user.phone && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                  <Phone className="size-3.5 shrink-0" /> {user.phone}
                </p>
              )}
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Calendar className="size-3 shrink-0" /> مسجل منذ {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Listings */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : total === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-10 px-4 text-center">
              <PackageOpen className="size-9 mx-auto text-muted-foreground mb-2.5" />
              <p className="text-sm font-medium text-foreground">لم ينشر أي إعلانات بعد</p>
              <p className="text-xs text-muted-foreground mt-1">
                هذا المستخدم لم يقم بنشر أي عقار أو سيارة على المنصة.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {data!.properties.length > 0 && (
                <Section title="العقارات" icon={Building2} count={data!.properties.length}>
                  {data!.properties.map((p) => (
                    <PropertyRow key={p._id} property={p} />
                  ))}
                </Section>
              )}
              {data!.cars.length > 0 && (
                <Section title="العربيات" icon={CarIcon} count={data!.cars.length}>
                  {data!.cars.map((c) => (
                    <CarRow key={c._id} car={c} />
                  ))}
                </Section>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="size-4" />
        {title}
        <span className="inline-flex items-center justify-center rounded-full bg-secondary px-2 h-5 text-xs font-semibold text-muted-foreground tabular-nums">
          {count}
        </span>
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ListingRow({
  href,
  image,
  title,
  subtitle,
  price,
  status,
}: {
  href: string;
  image: string;
  title: string;
  subtitle: string;
  price: number | null;
  status: string;
}) {
  return (
    <Link
      href={href as never}
      target="_blank"
      className="group flex items-center gap-3 rounded-xl border border-border p-2.5 hover:bg-secondary/60 transition-colors"
    >
      <div className="relative size-16 shrink-0 rounded-lg overflow-hidden bg-secondary">
        <Image src={image || ''} alt="" fill sizes="64px" className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h5 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {title}
          </h5>
          <Badge variant={statusVariant[status] ?? 'default'} className="shrink-0">
            {STATUS_LABEL[status] ?? status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{subtitle}</span>
        </p>
        <p className="text-sm font-bold text-primary tabular-nums mt-0.5">
          {price != null ? `${formatPrice(price)} ج.م` : 'السعر عند التواصل'}
        </p>
      </div>
      <ExternalLink className="size-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function PropertyRow({ property }: { property: Property }) {
  return (
    <ListingRow
      href={`/properties/${property._id}`}
      image={property.images[0]?.url ?? ''}
      title={property.area_name}
      subtitle={property.governorate}
      price={property.price}
      status={property.status}
    />
  );
}

function CarRow({ car }: { car: Car }) {
  return (
    <ListingRow
      href={`/cars/${car._id}`}
      image={car.images[0]?.url ?? ''}
      title={`${car.make} ${car.model} ${car.year}`}
      subtitle={car.governorate}
      price={car.price}
      status={car.status}
    />
  );
}
