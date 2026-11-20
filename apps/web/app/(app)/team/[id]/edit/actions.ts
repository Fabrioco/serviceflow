"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session";

type Field = "name" | "email" | "password";

export type EditTechnicianState = {
  message?: string;
  errors?: Partial<Record<Field, string>>;
  values?: {
    name: string;
    email: string;
  };
};

export async function editTechnicianAction(
  id: string,
  _prev: EditTechnicianState,
  formData: FormData,
): Promise<EditTechnicianState> {
  // 1) Ler e normalizar
  const get = (key: string) => String(formData.get(key) ?? "").trim();

  const values = {
    name: get("name"),
    email: get("email").toLowerCase(),
  };

  const password = String(formData.get("password") ?? "");

  // 2) Validar
  const errors: NonNullable<EditTechnicianState["errors"]> = {};

  if (values.name.length < 2) {
    errors.name = "Informe o nome do técnico.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (password.trim() && password.length < 8) {
    errors.password = "A senha deve ter pelo menos 8 caracteres.";
  }

  if (Object.keys(errors).length > 0) {
    return { values, errors };
  }

  // 3) Token da sessão
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) redirect("/login");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 4) Atualizar nome e e-mail (o corpo não aceita senha neste endpoint)
  let res: Response;

  try {
    res = await fetch(`${process.env.API_URL}/technicians/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(values),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return {
      values,
      message: "Não foi possível conectar ao servidor. Tente novamente.",
    };
  }

  // 5) Traduzir status do perfil
  if (res.status === 401) redirect("/login");

  if (res.status === 404) {
    return { values, message: "Técnico não encontrado." };
  }

  if (res.status === 409) {
    return {
      values,
      message: "Já existe um usuário com esse e-mail.",
    };
  }

  if (!res.ok) {
    return {
      values,
      message: "Confira os dados informados e tente novamente.",
    };
  }

  // 6) Atualizar senha separadamente, se informada
  if (password.trim()) {
    let resPwd: Response;

    try {
      resPwd = await fetch(`${process.env.API_URL}/technicians/${id}/password`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ password }),
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      return {
        values,
        message: "Não foi possível conectar ao servidor. Tente novamente.",
      };
    }

    if (resPwd.status === 401) redirect("/login");

    if (resPwd.status === 404) {
      return { values, message: "Técnico não encontrado." };
    }

    if (!resPwd.ok) {
      return {
        values,
        message: "Não foi possível redefinir a senha. Tente novamente.",
      };
    }
  }

  // 7) Sucesso
  revalidatePath("/team");
  redirect("/team");
}

export type DeleteTechnicianState = {
  message?: string;
};

export async function deleteTechnicianAction(
  id: string,
  _prev: DeleteTechnicianState,
  _formData: FormData,
): Promise<DeleteTechnicianState> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) redirect("/login");

  let res: Response;

  try {
    res = await fetch(`${process.env.API_URL}/technicians/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return {
      message: "Não foi possível conectar ao servidor. Tente novamente.",
    };
  }

  if (res.status === 401) redirect("/login");

  if (res.status === 404) {
    revalidatePath("/team");
    redirect("/team");
  }

  if (res.status === 409) {
    return {
      message: "Este técnico possui ordens de serviço e não pode ser excluído.",
    };
  }

  if (!res.ok) {
    return {
      message: "Algo deu errado. Tente novamente em instantes.",
    };
  }

  revalidatePath("/team");
  redirect("/team");
}
