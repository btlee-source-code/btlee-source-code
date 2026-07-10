import { ShieldCheck } from 'lucide-react-native';

import { LegalArticle } from '@/features/legal/components/LegalArticle';
import { PRIVACY } from '@/features/legal/content';

export default function PrivacyRoute() {
  return <LegalArticle data={PRIVACY} Icon={ShieldCheck} />;
}
