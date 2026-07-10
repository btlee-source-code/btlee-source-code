import { Trash2 } from 'lucide-react-native';

import { LegalArticle } from '@/features/legal/components/LegalArticle';
import { DATA_DELETION } from '@/features/legal/content';

export default function DataDeletionRoute() {
  return <LegalArticle data={DATA_DELETION} Icon={Trash2} />;
}
