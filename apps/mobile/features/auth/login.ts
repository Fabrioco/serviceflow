import { z } from 'zod';
import { api } from '../../lib/api';

export const loginSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const login = (data: LoginInput) =>
  api<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
