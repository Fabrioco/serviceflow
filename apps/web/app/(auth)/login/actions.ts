"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export type LoginState = {
  message?: string;
  email?: string;
  errors?: { email?: string; password?: string };
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const errors: NonNullable<LoginState["errors"]> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Informe um e-mail válido.";
  if (!password) errors.password = "Informe sua senha.";
  if (errors.email || errors.password) return { email, errors };

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return {
      email,
      message: "Não foi possível conectar ao servidor. Tente novamente.",
    };
  }

  if (res.status === 401)
    return { email, message: "E-mail ou senha incorretos." };
  if (!res.ok)
    return { email, message: "Algo deu errado. Tente novamente em instantes." };

  const { accessToken } = (await res.json()) as { accessToken: string };

  (await cookies()).set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/dashboard"); // fora do try/catch: o redirect funciona lançando uma exceção
}
