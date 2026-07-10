import { Share2 } from 'lucide-react-native';
import { Pressable, Share } from 'react-native';

import { S } from '@/config/strings';
import { WEB_URL } from '@/config/env';
import { TYPE_LABELS } from '@/shared/lib/constants';
import type { Property } from '@/shared/types/property';

/**
 * Opens the native OS share sheet (which includes copy-link) for the listing.
 * Shares the canonical web URL since the app has no public deep-link host yet.
 */
export function ShareButton({ property }: { property: Property }) {
  const onShare = async () => {
    const title = `${TYPE_LABELS[property.type]} ${S.in} ${property.area_name}`;
    const url = `${WEB_URL}/properties/${property._id}`;
    try {
      await Share.share({ message: `${title}\n${url}`, url, title });
    } catch {
      // user dismissed — ignore
    }
  };

  return (
    <Pressable
      onPress={onShare}
      hitSlop={6}
      className="h-10 w-10 rounded-full items-center justify-center active:opacity-80"
      style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
      <Share2 size={18} color="#1A3C34" />
    </Pressable>
  );
}
