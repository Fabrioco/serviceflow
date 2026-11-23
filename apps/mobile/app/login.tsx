import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  return (
    <View className="bg-deep flex-1">
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Animated.View
          entering={ZoomIn.springify()}
          className="h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-teal-500"
        />
        <Animated.Text entering={FadeInUp.delay(250)} className="text-[30px] font-bold text-white">
          ServiceFlow
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(400)}
          className="text-center text-base text-[#A7C4C2]">
          Suas ordens de serviço, do chamado à conclusão.
        </Animated.Text>
      </View>
      <Animated.View
        entering={FadeInDown.delay(600).duration(500)}
        className="gap-4 rounded-t-[28px] bg-white px-6 pb-10 pt-7">
        <Text className="text-ink text-sm font-semibold">E-mail</Text>
        <TextInput
          className="text-ink h-[52px] rounded-xl border-[1.5px] border-slate-400 px-4 text-base"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text className="text-ink text-sm font-semibold">Senha</Text>
        <TextInput
          className="text-ink h-[52px] rounded-xl border-[1.5px] border-slate-400 px-4 text-base"
          secureTextEntry={false}
        />
        <Pressable
          onPress={() => router.replace('/(app)')}
          className="mt-2 h-14 items-center justify-center rounded-2xl bg-teal-700 active:scale-95">
          <Text className="text-[17px] font-bold text-white">Entrar</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
