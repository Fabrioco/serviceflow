import { useSession } from './session';

const BASE = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token, signOut } = useSession.getState();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60_000); // o Render free pode demorar a acordar

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });

    if (res.status === 401 && token) await signOut(); // token expirado: volta para o login
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const msg = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
      throw new ApiError(res.status, msg ?? 'Erro inesperado');
    }
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  } finally {
    clearTimeout(timer);
  }
}
