import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, X } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { S } from '@/config/strings';
import { MAX_IMAGES } from '@/shared/lib/constants';
import type { LocalImage } from '../api/uploads.api';

/** Pick + preview + remove local images (uploaded to Cloudinary on submit). */
export function ImagePickerRow({
  value,
  onChange,
}: {
  value: LocalImage[];
  onChange: (imgs: LocalImage[]) => void;
}) {
  const pick = async () => {
    const remaining = MAX_IMAGES - value.length;
    if (remaining <= 0) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (res.canceled) return;
    const picked: LocalImage[] = res.assets.map((a) => ({
      uri: a.uri,
      name: a.fileName ?? undefined,
      mimeType: a.mimeType ?? undefined,
    }));
    onChange([...value, ...picked].slice(0, MAX_IMAGES));
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
      <Pressable
        onPress={pick}
        className="h-24 w-24 rounded-xl border border-dashed border-border bg-secondary items-center justify-center gap-1 active:opacity-80">
        <ImagePlus size={22} color="#1A3C34" />
        <Text className="text-[11px] font-cairo-medium text-primary">
          {S.addImages} {value.length}/{MAX_IMAGES}
        </Text>
      </Pressable>

      {value.map((img, i) => (
        <View key={img.uri} className="h-24 w-24 rounded-xl overflow-hidden">
          <Image source={{ uri: img.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          <Pressable
            onPress={() => onChange(value.filter((_, idx) => idx !== i))}
            hitSlop={6}
            className="absolute top-1 left-1 h-6 w-6 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <X size={14} color="#FFFFFF" />
          </Pressable>
          {i === 0 && (
            <View className="absolute bottom-0 left-0 right-0 py-0.5 items-center" style={{ backgroundColor: 'rgba(26,60,52,0.85)' }}>
              <Text className="text-[10px] text-white font-cairo-medium">الغلاف</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
