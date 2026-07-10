import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { shadows } from '@/shared/lib/shadows';

/**
 * Floating "this scrolls" affordance for horizontal rails: a small circular
 * arrow button on each edge, vertically centered on the rail content.
 * Semi-transparent so the content underneath stays visible.
 * Render inside a relatively-positioned wrapper, after the rail itself.
 * `top` is the offset that centers the 36px button on the rail's visual band.
 */
export function RailArrows({ top, onStep }: { top: number; onStep: (dir: 1 | -1) => void }) {
  const c = useThemeColors();
  return (
    <>
      <Pressable
        onPress={() => onStep(-1)}
        hitSlop={8}
        className="absolute h-9 w-9 rounded-full bg-card/70 border border-border/60 items-center justify-center active:bg-card"
        style={[{ left: 10, top }, shadows.sm]}>
        <ChevronLeft size={18} color={c.foreground} />
      </Pressable>
      <Pressable
        onPress={() => onStep(1)}
        hitSlop={8}
        className="absolute h-9 w-9 rounded-full bg-card/70 border border-border/60 items-center justify-center active:bg-card"
        style={[{ right: 10, top }, shadows.sm]}>
        <ChevronRight size={18} color={c.foreground} />
      </Pressable>
    </>
  );
}
