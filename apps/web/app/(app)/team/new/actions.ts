"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session";

export type TechnicianState = {
  message?: string;
  values?: { name: string; email: string }; // o que foi digitado (a senha nunca volta)
  errors?: { name?: string; email?: string; password?: string };
};

export async function createTechnicianAction(
  _prev: TechnicianState, 
  formData: FormData,
): Promise<TechnicianState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? ""); // senha não leva trim
  const values = { name, email };

  const errors: NonNullable<TechnicianState["errors"]> = {};
  if (name.length < 2) errors.name = "Informe o nome do técnico.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Informe um e-mail válido.";
  if (password.length < 8 || password.length > 128) {
    errors.password = "A senha deve ter de 8 a 128 caracteres.";
  }
  if (Object.keys(errors).length > 0) return { values, errors };

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/login");

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/technicians`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return {
      values,
      message: "Não foi possível conectar ao servidor. Tente novamente.",
    };
  }

  if (res.status === 401) redirect("/login");
  if (res.status === 403)
    return {
      values,
      message: "Somente o proprietário pode cadastrar técnicos.",
    };
  if (res.status === 409)
    return { values, errors: { email: "Este e-mail já está em uso." } };
  if (res.status === 400)
    return {
      values,
      message: "Confira os dados informados e tente novamente.",
    };
  if (!res.ok)
    return {
      values,
      message: "Algo deu errado. Tente novamente em instantes.",
    };

  revalidatePath("/team");
  redirect("/team");
}
