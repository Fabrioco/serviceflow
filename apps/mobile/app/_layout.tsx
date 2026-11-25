import '../global.css';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSession } from '../lib/session';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
  const { token, ready, locked, hydrate, lock } = useSession();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Bloqueia de novo se o app ficou mais de 30 s em segundo plano
  useEffect(() => {
    let leftAt = 0;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') leftAt = Date.now();
      if (state === 'active') {
        if (leftAt && Date.now() - leftAt > 30_000) lock();
        leftAt = 0;
      }
    });
    return () => sub.remove();
  }, [lock]);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!token && !locked}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!!token && locked}>
          <Stack.Screen name="unlock" />
        </Stack.Protected>
        <Stack.Protected guard={!token}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </QueryClientProvider>
  );
}
