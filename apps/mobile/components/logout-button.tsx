import { Alert, Pressable, Text } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '../lib/session';

export function LogoutButton() {
  const signOut = useSession((s) => s.signOut);
  const queryClient = useQueryClient();

  const confirm = () =>
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          queryClient.clear(); // não deixa as OS do usuário anterior em cache
        },
      },
    ]);

  return (
    <Pressable
      onPress={confirm}
      accessibilityRole="button"
      accessibilityLabel="Sair da conta"
      className="h-11 justify-center px-3 active:opacity-60">
      <Text className="text-[15px] font-semibold text-teal-700">Sair</Text>
    </Pressable>
  );
}
