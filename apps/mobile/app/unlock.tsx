import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSession } from '../lib/session';

export default function Unlock() {
  const unlock = useSession((s) => s.unlock);
  const signOut = useSession((s) => s.signOut);

  useEffect(() => {
    unlock(); // já abre o pedido de biometria ao entrar na tela
  }, [unlock]);

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-deep px-8">
      <View className="h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-teal-500">
        <Text className="text-[28px] font-extrabold text-deep">SF</Text>
      </View>
      <Text className="text-[22px] font-bold text-white">App bloqueado</Text>
      <Text className="text-center text-base text-[#A7C4C2]">
        Confirme sua identidade para continuar.
      </Text>

      <Pressable
        onPress={() => unlock()}
        className="mt-4 h-14 w-full items-center justify-center rounded-2xl bg-teal-500 active:scale-95">
        <Text className="text-[17px] font-bold text-deep">Usar biometria</Text>
      </Pressable>
      <Pressable onPress={() => signOut()} className="h-12 items-center justify-center px-4">
        <Text className="text-base font-semibold text-[#A7C4C2]">Entrar com senha</Text>
      </Pressable>
    </View>
  );
}
