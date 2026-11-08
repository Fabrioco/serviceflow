"use server";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { cookies } from "next/headers";

// vai rodar no servidor, só roda async

type Field =
  | "name"
  | "organizationName"
  | "email"
  | "password"
  | "confirmPassword";

export type RegisterState = {
  message?: string;
  values?: { name: string; organizationName: string; email: string };
  errors?: Partial<Record<Field, string>>;
};

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const organizationName = String(
    formData.get("organizationName") ?? "",
  ).trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const values = { name, organizationName, email };

  const errors: Partial<Record<Field, string>> = {};
  if (name.length < 2) errors.name = "Informe seu nome.";
  if (organizationName.length < 2)
    errors.organizationName = "Informe o nome da empresa.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Digite um email válido.";
  if (password.length < 8)
    errors.password = "A senha deve ter pelo menos 8 caracteres.";
  else if (/\s/.test(password))
    errors.password = "A senha não pode conter espaços.";
  if (confirmPassword !== password)
    errors.confirmPassword = "A senha não coincidem.";
  if (Object.keys(errors).length > 0) return { values, errors };

  // hora de chamar a API
  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        confirmPassword,
        organizationName,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return {
      values,
      message: "Não foi possível conectar ao servidor. Tente novamente.",
    };
  }

  if (res.status === 409)
    return {
      values,
      errors: {
        email: "Este e-mail já está em uso.",
      },
    };
  if (res.status === 409)
    return {
      values,
      message: "Confira os dados informados e tente novamente.",
    };
  if (!res.ok)
    return {
      values,
      message: "Algo deu errado. Tente novamente em instantes.",
    };

  const { accessToken } = (await res.json()) as { accessToken: string };
  (await cookies()).set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/dashboard");
}
