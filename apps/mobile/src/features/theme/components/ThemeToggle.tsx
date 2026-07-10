import { Moon, Sun } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { S } from '@/config/strings';
import { useTheme, useThemeColors } from '../hooks/useTheme';

const OPTIONS = [
  { value: 'light' as const, label: () => S.light, Icon: Sun },
  { value: 'dark' as const, label: () => S.dark, Icon: Moon },
];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const c = useThemeColors();

  return (
    <View className="bg-card border border-border rounded-xl p-3 gap-2.5">
      <View className="flex-row items-center gap-2 justify-end">
        <Text className="font-cairo-semibold text-foreground">{S.appearance}</Text>
        {mode === 'dark' ? <Moon size={18} color={c.primary} /> : <Sun size={18} color={c.primary} />}
      </View>
      <View className="flex-row gap-2">
        {OPTIONS.map((o) => {
          const active = mode === o.value;
          return (
            <Pressable
              key={o.value}
              onPress={() => setMode(o.value)}
              className={`flex-1 rounded-lg h-10 flex-row items-center justify-center gap-2 active:opacity-90 ${
                active ? 'bg-primary' : 'bg-secondary'
              }`}>
              <o.Icon size={16} color={active ? c.primaryForeground : c.foreground} />
              <Text className={`font-cairo-semibold ${active ? 'text-primary-foreground' : 'text-foreground'}`}>
                {o.label()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
