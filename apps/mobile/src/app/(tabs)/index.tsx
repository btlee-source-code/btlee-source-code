import { View } from 'react-native';

import { CarsHome } from '@/features/cars/home/CarsHome';
import { AddListingFab } from '@/features/home/components/AddListingFab';
import { PropertiesHome } from '@/features/home/PropertiesHome';
import { useSection } from '@/features/section/hooks/useSection';

/**
 * Home tab — renders the active section's home, with a floating "add listing"
 * CTA overlaid on top. The section switcher (in the shared HomeTopBar) flips
 * between them; branding swaps globally via the store.
 */
export default function HomeScreen() {
  const { isCars } = useSection();
  return (
    <View className="flex-1">
      {isCars ? <CarsHome /> : <PropertiesHome />}
      <AddListingFab />
    </View>
  );
}
