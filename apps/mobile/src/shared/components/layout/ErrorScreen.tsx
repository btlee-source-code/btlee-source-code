import { RefreshCw } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Full-screen crash-recovery UI, shown by the route ErrorBoundary when a screen
 * throws during render. Deliberately self-contained — hardcoded colors, no theme
 * provider / Redux / i18n dependency — so it still renders even if the failure is
 * in a provider higher up the tree. Arabic-first to match the app.
 */
export function ErrorScreen({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 560,
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          gap: 12,
        }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#1A3C34',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}>
          <RefreshCw size={28} color="#FFFFFF" strokeWidth={2.2} />
        </View>

        <Text style={{ fontSize: 20, fontWeight: '700', color: '#1C1C1C', textAlign: 'center' }}>
          حصل خطأ غير متوقع
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 22, color: '#737373', textAlign: 'center' }}>
          نأسف على ده. جرّب تعيد المحاولة، ولو المشكلة فضلت اقفل التطبيق وافتحه تاني.
        </Text>

        <Pressable
          onPress={retry}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#1A3C34',
            paddingHorizontal: 28,
            height: 52,
            borderRadius: 26,
            marginTop: 12,
          }}>
          <RefreshCw size={18} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>حاول تاني</Text>
        </Pressable>

        {__DEV__ ? (
          <Text style={{ marginTop: 20, fontSize: 12, color: '#B00020', textAlign: 'center' }}>
            {error.message}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
