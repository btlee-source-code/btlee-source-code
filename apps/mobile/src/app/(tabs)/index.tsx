import { View } from 'react-native';

import { CarsHome } from '@/features/cars/home/CarsHome';
import { PropertiesHome } from '@/features/home/PropertiesHome';
import { useSection } from '@/features/section/hooks/useSection';

/**
 * Home tab — renders the active section's home. The "add listing" CTA now lives
 * as a raised button in the center of the bottom tab bar (see AddTabButton), so
 * it's reachable from every tab, not just here. The section switcher (in the
 * shared HomeTopBar) flips between properties and cars; branding swaps globally.
 */
export default function HomeScreen() {
  const { isCars } = useSection();
  return (
    <View className="flex-1">
      {isCars ? <CarsHome /> : <PropertiesHome />}
    </View>
  );
}
