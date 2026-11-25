import { biometricsAvailable } from '../lib/biometrics';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../lib/api';
import { useSession } from '../lib/session';
import { login, loginSchema, LoginInput } from '../features/auth/login';

export default function Login() {
  const signIn = useSession((s) => s.signIn);
  const enableBiometric = useSession((s) => s.enableBiometric);

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    setFocus,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async ({ accessToken }) => {
      await signIn(accessToken); // o Stack.Protected leva para (app)
      if (await biometricsAvailable()) {
        Alert.alert(
          'Entrar com biometria?',
          'Use sua digital para abrir o app nas próximas vezes.',
          [
            { text: 'Agora não', style: 'cancel' },
            { text: 'Ativar', onPress: () => enableBiometric() },
          ]
        );
      }
    },
    onError: (e) =>
      setError('root', {
        message:
          e instanceof ApiError && e.status === 401
            ? 'E-mail ou senha incorretos'
            : 'Não foi possível entrar. Tente novamente.',
      }),
  });

  const submit = handleSubmit((data) => {
    clearErrors('root');
    mutation.mutate({ ...data, email: data.email.trim() });
  });

  // 0 = teclado fechado, 1 = teclado aberto
  const progress = useSharedValue(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => {
      progress.value = withTiming(1, { duration: 250 });
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      progress.value = withTiming(0, { duration: 250 });
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [progress]);

  // O topo encolhe um pouco com o teclado aberto, mas continua visível
  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0.7], Extrapolation.CLAMP) }],
  }));

  const inputClass = (hasError: boolean) =>
    `text-ink h-[52px] rounded-xl border-[1.5px] px-4 text-base ${
      hasError ? 'border-red-600' : 'border-slate-400'
    }`;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: '#0B2B2E' }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#0B2B2E' }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            flexGrow: 1,
            minHeight: 140,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}>
          <Animated.View style={[{ alignItems: 'center', gap: 12 }, heroStyle]}>
            <Animated.View
              entering={ZoomIn.springify()}
              className="h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-teal-500">
              <Text className="text-[28px] font-extrabold text-deep">SF</Text>
            </Animated.View>
            <Animated.Text
              entering={FadeInUp.delay(250)}
              className="text-[30px] font-bold text-white">
              ServiceFlow
            </Animated.Text>
            <Animated.Text
              entering={FadeInUp.delay(400)}
              className="text-center text-base text-[#A7C4C2]">
              Suas ordens de serviço, do chamado à conclusão.
            </Animated.Text>
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          className="gap-3 rounded-t-[28px] bg-white px-6 pb-10 pt-7">
          <Text className="text-sm font-semibold text-ink">E-mail</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <TextInput
                ref={ref}
                className={inputClass(!!errors.email)}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                placeholder="seuemail@empresa.com"
                returnKeyType="next"
                onChangeText={onChange}
                onBlur={onBlur}
                onSubmitEditing={() => setFocus('password')}
                value={value}
              />
            )}
          />
          {errors.email && <Text className="text-sm text-red-700">{errors.email.message}</Text>}

          <Text className="text-sm font-semibold text-ink">Senha</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <TextInput
                ref={ref}
                className={inputClass(!!errors.password)}
                secureTextEntry
                autoComplete="password"
                placeholder="********"
                returnKeyType="done"
                onChangeText={onChange}
                onBlur={onBlur}
                onSubmitEditing={() => submit()}
                value={value}
              />
            )}
          />
          {errors.password && (
            <Text className="text-sm text-red-700">{errors.password.message}</Text>
          )}

          {errors.root && (
            <Text accessibilityRole="alert" className="text-sm text-red-700">
              {errors.root.message}
            </Text>
          )}

          <Pressable
            disabled={mutation.isPending}
            onPress={() => submit()}
            className="mt-2 h-14 items-center justify-center rounded-2xl bg-teal-700 active:scale-95 disabled:opacity-60">
            {mutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-[17px] font-bold text-white">Entrar</Text>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
