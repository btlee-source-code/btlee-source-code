import { Globe } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { S } from '@/config/strings';
import type { Locale } from '@/config/locale';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { useLocale } from '../hooks/useLocale';

// Native language names are intentionally not translated (matches the web).
const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const c = useThemeColors();

  return (
    <View className="bg-card border border-border rounded-xl p-3 gap-2.5">
      <View className="flex-row items-center gap-2 justify-end">
        <Text className="font-cairo-semibold text-foreground">{S.language}</Text>
        <Globe size={18} color={c.primary} />
      </View>
      <View className="flex-row gap-2">
        {OPTIONS.map((o) => {
          const active = locale === o.value;
          return (
            <Pressable
              key={o.value}
              onPress={() => setLocale(o.value)}
              className={`flex-1 rounded-lg h-10 items-center justify-center active:opacity-90 ${
                active ? 'bg-primary' : 'bg-secondary'
              }`}>
              <Text className={`font-cairo-semibold ${active ? 'text-primary-foreground' : 'text-foreground'}`}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
