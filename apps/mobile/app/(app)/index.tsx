import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { StatusPill } from '../../components/status-pill';
import { Skeleton } from '../../components/skeleton';
import {
  formatScheduled,
  formatWhen,
  listOrders,
  orderCode,
  OrderStatus,
} from '../../features/orders/orders';

const FILTERS: { label: string; value?: OrderStatus }[] = [
  { label: 'Todas' },
  { label: 'Agendadas', value: 'SCHEDULED' },
  { label: 'Em andamento', value: 'IN_PROGRESS' },
];

export default function Orders() {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus | undefined>();

  const { data, isPending, isError, isRefetching, refetch } = useQuery({
    queryKey: ['orders', status ?? 'all'],
    queryFn: () => listOrders(status),
  });

  const subtitle = isPending
    ? 'Acordando o servidor, pode levar alguns segundos…'
    : `${data?.length ?? 0} ${data?.length === 1 ? 'ordem atribuída' : 'ordens atribuídas'} a você`;

  return (
    <View className="flex-1 bg-surface px-5 pt-4">
      <Animated.View entering={FadeInDown.duration(500)}>
        <Text className="text-[15px] text-muted">{subtitle}</Text>
      </Animated.View>

      <View className="flex-row gap-2 py-4">
        {FILTERS.map((f) => {
          const active = f.value === status;
          return (
            <Pressable
              key={f.label}
              onPress={() => setStatus(f.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={`h-11 justify-center rounded-full border-[1.5px] px-[18px] active:scale-95 ${
                active ? 'border-teal-700 bg-teal-700' : 'border-slate-400 bg-white'
              }`}>
              <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-ink'}`}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isPending ? (
        <View className="gap-3">
          {[0, 1, 2].map((i) => (
            <View key={i} className="gap-3 rounded-2xl border border-line bg-white p-4">
              <Skeleton width={90} height={14} delay={i * 200} />
              <Skeleton width="80%" height={20} delay={i * 200} />
              <Skeleton width="55%" height={14} delay={i * 200} />
            </View>
          ))}
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-3 px-6 pb-24">
          <Text className="text-center text-[20px] font-bold text-ink">
            Não conseguimos carregar suas OS
          </Text>
          <Text className="text-center text-base text-muted">
            Confira sua conexão e tente de novo.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-2 h-14 items-center justify-center rounded-2xl bg-teal-700 px-10 active:scale-95">
            <Text className="text-[17px] font-bold text-white">Tentar de novo</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 32, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={async () => {
                await refetch();
              }}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center gap-2 pb-24">
              <Text className="text-[18px] font-bold text-ink">Nenhuma OS por aqui</Text>
              <Text className="text-center text-[15px] text-muted">
                {status
                  ? 'Tente outro filtro.'
                  : 'Quando uma OS for atribuída a você, ela aparece aqui.'}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInRight.delay(100 + Math.min(index, 5) * 120).duration(450)}>
              <Pressable
                onPress={() => router.push(`/orders/${item.id}`)}
                accessibilityRole="button"
                className="gap-2.5 rounded-2xl border border-line bg-white p-4 active:scale-[0.98]">
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="text-[13px] font-semibold text-muted">{orderCode(item.id)}</Text>
                  <StatusPill status={item.status} />
                </View>
                <Text className="text-[17px] font-bold text-ink">{item.serviceName}</Text>
                <Text className="text-sm text-muted">
                  {[item.customer?.name, formatScheduled(item.scheduledAt)]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </Pressable>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}
