import { useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

export function Skeleton({ className = "" }: { className?: string }) {
  const o = useSharedValue(0.55);
  useEffect(() => { o.value = withRepeat(withTiming(1, { duration: 700 }), -1, true); }, []);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={style} className={`rounded-lg bg-slate-200 ${className}`} />;
}