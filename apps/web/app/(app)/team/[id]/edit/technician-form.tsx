"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EditTechnicianState } from "./actions";

export type TechnicianData = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  technician: TechnicianData;
  action: (
    prev: EditTechnicianState,
    formData: FormData,
  ) => Promise<EditTechnicianState>;
};

export function TechnicianForm({ technician, action }: Props) {
  const [state, formAction, pending] = useActionState(
    action,
    {} as EditTechnicianState,
  );

  const v = state.values ?? {
    name: technician.name,
    email: technician.email,
  };

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.message && (
        <div
          role="alert"
          className="rounded-lg bg-danger-bg px-3.5 py-3 text-sm text-danger"
        >
          {state.message}
        </div>
      )}

      <Input
        label="Nome"
        name="name"
        autoComplete="name"
        defaultValue={v.name}
        error={state.errors?.name}
      />

      <Input
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={v.email}
        error={state.errors?.email}
      />

      <Input
        label="Nova senha (opcional)"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Deixe vazio para manter a senha atual"
        error={state.errors?.password}
      />

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>

        <Link
          href="/team"
          className="inline-flex h-11 items-center rounded-lg px-4 text-[15px] font-medium text-muted hover:text-ink"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
