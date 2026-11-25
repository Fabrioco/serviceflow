import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { biometricsAvailable, promptBiometric } from './biometrics';

const TOKEN_KEY = 'sf_token';
const BIO_KEY = 'sf_biometric';

type Session = {
  token: string | null;
  ready: boolean;
  biometricEnabled: boolean;
  locked: boolean;
  hydrate: () => Promise<void>;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  lock: () => void;
  unlock: () => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
};

export const useSession = create<Session>((set, get) => ({
  token: null,
  ready: false,
  biometricEnabled: false,
  locked: false,

  hydrate: async () => {
    let token: string | null = null;
    let enabled = false;
    try {
      token = await SecureStore.getItemAsync(TOKEN_KEY);
      enabled = (await SecureStore.getItemAsync(BIO_KEY)) === '1';
    } catch {
      token = null;
    }
    const useBio = enabled && !!token;
    set({ token, biometricEnabled: useBio, locked: useBio, ready: true });
  },

  signIn: async (token) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token, locked: false });
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(BIO_KEY); // outro usuário pode entrar neste aparelho
    set({ token: null, biometricEnabled: false, locked: false });
  },

  lock: () => {
    if (get().token && get().biometricEnabled) set({ locked: true });
  },

  unlock: async () => {
    const ok = await promptBiometric('Entre no ServiceFlow');
    if (ok) set({ locked: false });
    return ok;
  },

  enableBiometric: async () => {
    if (!(await biometricsAvailable())) return false;
    if (!(await promptBiometric('Ative a entrada com biometria'))) return false;
    await SecureStore.setItemAsync(BIO_KEY, '1');
    set({ biometricEnabled: true });
    return true;
  },

  disableBiometric: async () => {
    await SecureStore.deleteItemAsync(BIO_KEY);
    set({ biometricEnabled: false, locked: false });
  },
}));
