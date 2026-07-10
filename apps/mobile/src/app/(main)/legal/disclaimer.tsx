import { ShieldAlert } from 'lucide-react-native';

import { LegalArticle } from '@/features/legal/components/LegalArticle';
import { DISCLAIMER } from '@/features/legal/content';

export default function DisclaimerRoute() {
  return <LegalArticle data={DISCLAIMER} Icon={ShieldAlert} />;
}
