"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session";

type Field = "name" | "phone" | "email";

export type NewCustomerState = {
  message?: string;
  errors?: Partial<Record<Field, string>>;
  values?: {
    name: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
  };
};

export async function createCustomerAction(
  _prev: NewCustomerState,
  formData: FormData,
): Promise<NewCustomerState> {
  const get = (key: string) => String(formData.get(key) ?? "").trim();
  const values = {
    name: get("name"),
    phone: get("phone"),
    email: get("email").toLowerCase(),
    address: get("address"),
    notes: get("notes"),
  };

  const digits = values.phone.replace(/\D/g, "");
  const errors: NonNullable<NewCustomerState["errors"]> = {};
  if (values.name.length < 2) errors.name = "Informe o nome do cliente.";
  if (digits.length < 10 || digits.length > 13)
    errors.phone = "Informe o telefone com DDD.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Informe um e-mail válido.";
  }
  if (Object.keys(errors).length > 0) return { values, errors };

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/login");

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/customers/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: values.name,
        phone: digits,
        email: values.email || null,
        address: values.address || null,
        notes: values.notes || null,
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

  if (res.status === 401) redirect("/login");
  if (res.status === 409)
    return {
      values,
      message: "Já existe um cliente com esse e-mail ou telefone.",
    };
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

  revalidatePath("/customers");
  redirect("/customers");
}
