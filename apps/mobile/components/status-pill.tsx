import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { OrderStatus } from '../features/orders/orders';

const MAP: Record<OrderStatus, { box: string; text: string; label: string }> = {
  OPEN: { box: 'bg-blue-100', text: 'text-blue-800', label: 'Aberta' },
  SCHEDULED: { box: 'bg-amber-100', text: 'text-amber-800', label: 'Agendada' },
  IN_PROGRESS: { box: 'bg-teal-100', text: 'text-teal-800', label: 'Em andamento' },
  COMPLETED: { box: 'bg-slate-200', text: 'text-slate-800', label: 'Concluída' },
  CANCELED: { box: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
};

function PulseDot() {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 1400 }), -1, false);
  }, [p]);
  const ring = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - p.value),
    transform: [{ scale: 1 + p.value * 1.6 }],
  }));
  const dot = { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0F766E' };
  return (
    <View style={{ width: 8, height: 8, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[dot, { position: 'absolute' }, ring]} />
      <View style={dot} />
    </View>
  );
}

export function StatusPill({ status }: { status: OrderStatus }) {
  const s = MAP[status];
  return (
    <View className={`h-7 flex-row items-center gap-1.5 rounded-full px-3 ${s.box}`}>
      {status === 'IN_PROGRESS' && <PulseDot />}
      <Text className={`text-[13px] font-semibold ${s.text}`}>{s.label}</Text>
    </View>
  );
}
