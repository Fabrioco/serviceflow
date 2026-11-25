import { Stack } from 'expo-router';
import { LogoutButton } from '../../components/logout-button';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Minhas OS', headerRight: () => <LogoutButton /> }}
      />
      <Stack.Screen name="orders/[id]" options={{ title: 'Detalhe da OS' }} />
    </Stack>
  );
}
