import { CarsHome } from '@/features/cars/home/CarsHome';
import { PropertiesHome } from '@/features/home/PropertiesHome';
import { useSection } from '@/features/section/hooks/useSection';

/**
 * Home tab — renders the active section's home. The section switcher (in the
 * shared HomeTopBar) flips between them; branding swaps globally via the store.
 */
export default function HomeScreen() {
  const { isCars } = useSection();
  return isCars ? <CarsHome /> : <PropertiesHome />;
}
