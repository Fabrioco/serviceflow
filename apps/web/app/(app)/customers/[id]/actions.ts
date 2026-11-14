"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session";

type Field = "name" | "phone" | "email";

export type EditCustomerState = {
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

export async function editCustomerAction(
  id: string, // vem do .bind(null, id)
  _prev: EditCustomerState, // estado anterior (não usamos)
  formData: FormData,
): Promise<EditCustomerState> {
  // 1) ler e normalizar
  const get = (key: string) => String(formData.get(key) ?? "").trim();
  const values = {
    name: get("name"),
    phone: get("phone"),
    email: get("email").toLowerCase(),
    address: get("address"),
    notes: get("notes"),
  };

  // 2) validar (a API valida de novo; aqui é para dar resposta rápida)
  const digits = values.phone.replace(/\D/g, "");
  const errors: NonNullable<EditCustomerState["errors"]> = {};
  if (values.name.length < 2) errors.name = "Informe o nome do cliente.";
  if (digits.length < 10 || digits.length > 13)
    errors.phone = "Informe o telefone com DDD.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Informe um e-mail válido.";
  }
  if (Object.keys(errors).length > 0) return { values, errors };

  // 3) token da sessão
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/login");

  // 4) chamar a API
  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/customers/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: values.name,
        phone: digits,
        email: values.email || null, // vazio vira null, e assim dá para limpar o campo
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

  // 5) traduzir o status (o corpo não é lido, então não há leitura dupla)
  if (res.status === 401) redirect("/login");
  if (res.status === 404) return { values, message: "Cliente não encontrado." };
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

  // 6) sucesso: invalida a lista e volta para ela
  revalidatePath("/customers");
  redirect("/customers"); // fora do try/catch
}

export type DeleteCustomerState = { message?: string };

export async function deleteCustomerAction(
  id: string, // vem do .bind(null, id)
  _prev: DeleteCustomerState,
  _formData: FormData,
): Promise<DeleteCustomerState> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/login");

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/customers/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }, // sem body e sem Content-Type
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return {
      message: "Não foi possível conectar ao servidor. Tente novamente.",
    };
  }

  if (res.status === 401) redirect("/login");
  if (res.status === 409) {
    return {
      message: "Este cliente possui ordens de serviço e não pode ser excluído.",
    };
  }
  // 404 conta como sucesso: o cliente já não existe, que era o objetivo
  if (!res.ok && res.status !== 404) {
    return { message: "Algo deu errado. Tente novamente em instantes." };
  }

  revalidatePath("/customers");
  redirect("/customers"); // fora do try/catch
}
