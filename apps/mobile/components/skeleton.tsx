import { useEffect } from 'react';
import type { DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export function Skeleton({
  width,
  height,
  delay = 0,
}: {
  width: DimensionValue;
  height: number;
  delay?: number;
}) {
  const o = useSharedValue(0.55);
  useEffect(() => {
    o.value = withDelay(delay, withRepeat(withTiming(1, { duration: 700 }), -1, true));
  }, [o, delay]);
  const pulse = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View
      style={[{ width, height, borderRadius: 8, backgroundColor: '#DCE6E8' }, pulse]}
    />
  );
}
