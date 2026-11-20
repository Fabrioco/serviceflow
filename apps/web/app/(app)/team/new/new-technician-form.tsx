"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTechnicianAction, TechnicianState } from "./actions";
import { PasswordInput } from "@/components/ui/password-input";

export function NewTechnicianForm() {
  const [state, formAction, pending] = useActionState(
    createTechnicianAction,
    {} as TechnicianState,
  );
  const v = state.values;

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
        autoComplete="off"
        defaultValue={v?.name}
        error={state.errors?.name}
        placeholder="Ana Maria da Silva Souza"
      />
      <Input
        label="E-mail"
        name="email"
        type="email"
        autoComplete="off"
        placeholder="voce@empresa.com.br"
        defaultValue={v?.email}
        error={state.errors?.email}
      />
      <PasswordInput
        label="Senha"
        name="password"
        autoComplete="off"
        placeholder="********"
        error={state.errors?.password}
      />

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={pending}>
          {pending ? "Cadastrando..." : "Cadastrar cliente"}
        </Button>
        <Link
          href="/customers"
          className="inline-flex h-11 items-center rounded-lg px-4 text-[15px] font-medium text-muted hover:text-ink"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
