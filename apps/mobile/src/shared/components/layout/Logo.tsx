import { Image } from 'expo-image';

// The site's brand wordmark (same asset as the web navbar). Source is 697×151;
// we drive it by height and keep the aspect ratio.
const LOGO = require('@/assets/brand/btlee-logo.png');
const ASPECT = 697 / 151;

export function Logo({ height = 30 }: { height?: number }) {
  return (
    <Image
      source={LOGO}
      style={{ height, width: height * ASPECT }}
      contentFit="contain"
      accessibilityLabel="Bt Lee"
    />
  );
}
