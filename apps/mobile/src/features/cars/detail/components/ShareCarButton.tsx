import { Share2 } from 'lucide-react-native';
import { Pressable, Share } from 'react-native';

import { WEB_URL } from '@/config/env';
import { shadows } from '@/shared/lib/shadows';
import type { Car } from '@/shared/types/car';

/**
 * Native share sheet for a car listing — shares the canonical web URL
 * (`${WEB_URL}/cars/{id}`). Mirrors the property ShareButton.
 */
export function ShareCarButton({ car }: { car: Car }) {
  const onShare = async () => {
    const title = `${car.make} ${car.model} ${car.year}`;
    const url = `${WEB_URL}/cars/${car._id}`;
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
      style={[{ backgroundColor: 'rgba(255,255,255,0.95)' }, shadows.sm]}>
      <Share2 size={18} color="#1C1C1C" />
    </Pressable>
  );
}
