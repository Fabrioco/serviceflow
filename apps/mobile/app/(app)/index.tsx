import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { StatusPill, OrderStatus } from '../../components/status-pill';
import { Skeleton } from '../../components/skeleton';

type Order = {
  id: string;
  code: string;
  service: string;
  customer: string;
  when: string;
  status: OrderStatus;
};

// TODO: trocar por useQuery chamando GET /work-orders
const orders: Order[] = [];
const loading = false;
const error = false;

export default function Orders() {
  if (error) {
    return (
      <View className="bg-surface flex-1 items-center justify-center gap-4 p-6">
        <Text className="text-ink text-center text-[22px] font-bold">
          Não conseguimos carregar suas OS
        </Text>
        <Text className="text-muted text-center text-base">
          Confira sua conexão e tente de novo.
        </Text>
        <Pressable className="h-14 items-center justify-center rounded-2xl bg-teal-700 px-10 active:scale-95">
          <Text className="text-[17px] font-bold text-white">Tentar de novo</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View className="bg-surface flex-1 gap-5 px-5 pt-4">
      <Animated.View entering={FadeInDown.duration(500)}>
        <Text className="text-ink text-[28px] font-bold">Minhas OS</Text>
        <Text className="text-muted mt-1 text-[15px]">
          {loading ? 'Acordando o servidor…' : `${orders.length} ordens atribuídas a você`}
        </Text>
      </Animated.View>
      <View className="gap-3">
        {loading
          ? [0, 1, 2].map((i) => (
              <View key={i} className="border-line gap-3 rounded-2xl border bg-white p-4">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-3.5 w-1/2" />
              </View>
            ))
          : orders.map((o, i) => (
              <Animated.View key={o.id} entering={FadeInRight.delay(150 + i * 150).duration(500)}>
                <Link href={`/orders/${o.id}`} asChild>
                  <Pressable className="border-line gap-2.5 rounded-2xl border bg-white p-4 active:scale-[0.98]">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-muted text-[13px] font-semibold">{o.code}</Text>
                      <StatusPill status={o.status} />
                    </View>
                    <Text className="text-ink text-[17px] font-bold">{o.service}</Text>
                    <Text className="text-muted text-sm">
                      {o.customer} · {o.when}
                    </Text>
                  </Pressable>
                </Link>
              </Animated.View>
            ))}
      </View>
    </View>
  );
}
