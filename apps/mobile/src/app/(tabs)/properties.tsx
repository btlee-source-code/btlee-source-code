import { CarsScreen } from '@/features/cars/list/CarsScreen';
import { PropertiesScreen } from '@/features/properties/list/PropertiesScreen';
import { useSection } from '@/features/section/hooks/useSection';

/**
 * Search tab — shows the cars list when the cars section is active, otherwise
 * the properties list. Both read the same tab route; the section switcher (on
 * the home tab) decides which listing domain is browsed here.
 */
export default function SearchTab() {
  const { isCars } = useSection();
  return isCars ? <CarsScreen /> : <PropertiesScreen />;
}
