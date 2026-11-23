import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Minhas OS' }} />
      <Stack.Screen name="orders/[id]" options={{ title: 'Detalhe da OS' }} />
    </Stack>
  );
}
