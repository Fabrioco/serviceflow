import { useEffect } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../lib/api';
import { StatusPill } from '../../../components/status-pill';
import { Skeleton } from '../../../components/skeleton';
import {
  changeStatus,
  formatPrice,
  formatScheduled,
  formatWhen,
  getOrder,
  orderCode,
  OrderEvent,
  OrderStatus,
} from '../../../features/orders/orders';

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string; confirm?: string }>> = {
  SCHEDULED: { to: 'IN_PROGRESS', label: 'Iniciar serviço' },
  IN_PROGRESS: {
    to: 'COMPLETED',
    label: 'Concluir serviço',
    confirm: 'Concluir esta OS? Essa ação não pode ser desfeita.',
  },
};

function GrowLine() {
  const s = useSharedValue(0);
  useEffect(() => {
    s.value = withDelay(400, withTiming(1, { duration: 900 }));
  }, [s]);
  const grow = useAnimatedStyle(() => ({ transform: [{ scaleY: s.value }] }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 6,
          top: 8,
          bottom: 8,
          width: 2,
          backgroundColor: '#0F766E',
          transformOrigin: 'top',
        },
        grow,
      ]}
    />
  );
}

function Timeline({ events }: { events: OrderEvent[] }) {
  const sorted = [...events].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  if (sorted.length === 0) {
    return <Text className="text-sm text-muted">Sem histórico ainda.</Text>;
  }
  return (
    <View style={{ gap: 22 }}>
      {sorted.length > 1 && <GrowLine />}
      {sorted.map((e, i) => {
        const delay = 400 + Math.min(i, 6) * 300;
        return (
          <View key={e.id} className="flex-row items-start gap-3.5">
            <Animated.View
              entering={ZoomIn.delay(delay).duration(350)}
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: '#0F766E',
                marginTop: 3,
              }}
            />
            <Animated.View entering={FadeInRight.delay(delay).duration(400)} style={{ flex: 1 }}>
              <Text className="text-[15px] font-semibold text-ink">{e.message}</Text>
              <Text className="text-[13px] text-muted">{formatWhen(e.createdAt)}</Text>
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
}

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isPending, isError, error, isRefetching, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
  });

  const mutation = useMutation({
    mutationFn: (to: OrderStatus) => changeStatus(id, to),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (e) =>
      Alert.alert(
        'Não foi possível atualizar',
        e instanceof ApiError ? e.message : 'Tente novamente.'
      ),
  });

  const next = data ? NEXT[data.status] : undefined;

  const act = () => {
    if (!next) return;
    if (next.confirm) {
      Alert.alert(next.label, next.confirm, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => mutation.mutate(next.to) },
      ]);
    } else {
      mutation.mutate(next.to);
    }
  };

  if (isPending) {
    return (
      <View className="flex-1 gap-4 bg-surface p-5">
        <View className="gap-3 rounded-2xl border border-line bg-white p-4">
          <Skeleton width={90} height={14} />
          <Skeleton width="80%" height={22} />
          <Skeleton width="50%" height={14} />
        </View>
        <View className="gap-3 rounded-2xl border border-line bg-white p-4">
          <Skeleton width={70} height={14} delay={200} />
          <Skeleton width="60%" height={16} delay={200} />
          <Skeleton width="45%" height={16} delay={200} />
        </View>
      </View>
    );
  }

  if (isError || !data) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-surface px-6">
        <Text className="text-center text-[20px] font-bold text-ink">
          {notFound ? 'OS não encontrada' : 'Não conseguimos carregar esta OS'}
        </Text>
        {!notFound && (
          <Pressable
            onPress={() => refetch()}
            className="mt-2 h-14 items-center justify-center rounded-2xl bg-teal-700 px-10 active:scale-95">
            <Text className="text-[17px] font-bold text-white">Tentar de novo</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={async () => {
              await refetch();
            }}
          />
        }>
        <Animated.View
          entering={FadeInDown.duration(450)}
          className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-ink">{orderCode(data.id)}</Text>
          <StatusPill status={data.status} />
        </Animated.View>

        <Animated.View
          entering={FadeInRight.delay(150).duration(450)}
          className="gap-1 rounded-2xl border border-line bg-white p-4">
          <Text className="text-[13px] font-semibold text-muted">Serviço</Text>
          <Text className="text-lg font-bold text-ink">{data.serviceName}</Text>
          {!!data.description && (
            <Text className="mt-1 text-sm text-muted">{data.description}</Text>
          )}
          {!!data.customer?.name && (
            <Text className="mt-2 text-sm text-muted">{data.customer.name}</Text>
          )}
          <Text className="text-sm text-muted">{formatScheduled(data.scheduledAt)}</Text>
          {data.price !== undefined && (
            <Text className="mt-2 text-[22px] font-bold text-teal-700">
              {formatPrice(data.price)}
            </Text>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInRight.delay(300).duration(450)}
          className="gap-3.5 rounded-2xl border border-line bg-white p-4">
          <Text className="text-[13px] font-semibold text-muted">Histórico</Text>
          <Timeline events={data.events ?? []} />
        </Animated.View>
      </ScrollView>

      {next && (
        <Animated.View entering={FadeInDown.delay(800).duration(450)} className="px-5 pb-8 pt-3">
          <Pressable
            disabled={mutation.isPending}
            onPress={act}
            className="h-14 items-center justify-center rounded-2xl bg-teal-700 active:scale-95 disabled:opacity-60">
            <Text className="text-[17px] font-bold text-white">
              {mutation.isPending ? 'Salvando…' : next.label}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
