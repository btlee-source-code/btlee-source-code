import { Info, type LucideIcon } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors } from '@/features/theme/hooks/useTheme';
import type { LegalArticleData } from '../content';

/** Reusable renderer for the three legal pages (RTL, numbered sections/steps). */
export function LegalArticle({ data, Icon }: { data: LegalArticleData; Icon: LucideIcon }) {
  const c = useThemeColors();
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-6 gap-5"
        showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="items-center gap-3">
        <View className="h-14 w-14 rounded-2xl bg-primary/10 items-center justify-center">
          <Icon size={26} color={c.primary} />
        </View>
        <Text className="text-2xl font-cairo-bold text-foreground text-center">{data.title}</Text>
        <Text className="text-sm text-muted-foreground font-cairo text-center leading-6">{data.intro}</Text>
        {data.updated ? <Text className="text-xs text-muted-foreground font-cairo">{data.updated}</Text> : null}
      </View>

      {/* Highlight callout */}
      {data.highlight ? (
        <View className="flex-row gap-2 rounded-2xl border border-accent/30 bg-accent/10 p-4">
          <Info size={18} color={c.accent} />
          <Text className="flex-1 text-sm text-foreground font-cairo text-right leading-6">{data.highlight}</Text>
        </View>
      ) : null}

      {/* Numbered sections */}
      {data.sections?.map((s, i) => (
        <View key={`sec-${i}`} className="gap-1.5">
          <View className="flex-row items-center gap-2 justify-end">
            <Text className="flex-1 text-base font-cairo-bold text-foreground text-right">{s.title}</Text>
            <View className="h-7 w-7 rounded-lg bg-primary/10 items-center justify-center">
              <Text className="text-primary font-cairo-bold text-sm">{i + 1}</Text>
            </View>
          </View>
          <Text className="text-sm text-muted-foreground font-cairo text-right leading-6">{s.body}</Text>
        </View>
      ))}

      {/* Steps (data-deletion) */}
      {data.steps?.map((step, i) => (
        <View key={`step-${i}`} className="flex-row items-start gap-2 justify-end">
          <Text className="flex-1 text-sm text-foreground font-cairo text-right leading-6">{step}</Text>
          <View className="h-7 w-7 rounded-lg bg-primary/10 items-center justify-center">
            <Text className="text-primary font-cairo-bold text-sm">{i + 1}</Text>
          </View>
        </View>
      ))}

      {/* Note callout */}
      {data.note ? (
        <View className="flex-row gap-2 rounded-2xl border border-border bg-secondary/50 p-4">
          <Info size={18} color={c.primary} />
          <Text className="flex-1 text-sm text-foreground font-cairo text-right leading-6">{data.note}</Text>
        </View>
      ) : null}

      {/* Contact card (privacy) */}
      {data.contactTitle ? (
        <View className="gap-1.5 rounded-2xl border border-border bg-card p-4">
          <Text className="text-base font-cairo-bold text-foreground text-right">{data.contactTitle}</Text>
          <Text className="text-sm text-muted-foreground font-cairo text-right leading-6">{data.contactBody}</Text>
        </View>
      ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
