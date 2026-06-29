'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { wishlistApi } from '@/features/wishlist/api/wishlist.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface WishlistButtonProps {
  propertyId: string;
}

export function WishlistButton({ propertyId }: WishlistButtonProps) {
  const t = useTranslations('property');
  const { isAuthenticated, isHydrated } = useAuth();
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    wishlistApi
      .check(propertyId)
      .then((r) => setSaved(r.inWishlist))
      .catch(() => {});
  }, [propertyId, isAuthenticated, isHydrated]);

  async function toggle() {
    if (!isAuthenticated) {
      toast.error('سجل دخولك أولاً لحفظ العقارات');
      return;
    }
    setPending(true);
    try {
      if (saved) {
        await wishlistApi.remove(propertyId);
        setSaved(false);
        toast.success('تم الإزالة من المفضلة');
      } else {
        await wishlistApi.add(propertyId);
        setSaved(true);
        toast.success('تم الحفظ في المفضلة');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Button onClick={toggle} disabled={pending} variant="outline" size="icon">
      <Heart className={saved ? 'fill-red-500 text-red-500' : ''} />
      <span className="sr-only">{t(saved ? 'removeFromWishlist' : 'addToWishlist')}</span>
    </Button>
  );
}
