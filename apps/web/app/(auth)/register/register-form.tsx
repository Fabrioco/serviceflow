"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} noValidate className="space-y-8">
      {state.message && (
        <div
          role="alert"
          className="rounded-lg bg-danger-bg px-3.5 py-3 text-sm text-danger"
        >
          {state.message}
        </div>
      )}

      <fieldset>
        <legend className="mb-4 p-0 text-[15px] font-semibold text-ink">
          Sua empresa
        </legend>
        <div className="space-y-5">
          <Input
            label="Nome da empresa"
            name="organizationName"
            autoComplete="organization"
            placeholder="Ex.: ClimaTech"
            defaultValue={state.values?.organizationName}
            error={state.errors?.organizationName}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 p-0 text-[15px] font-semibold text-ink">
          Seu acesso
        </legend>
        <div className="space-y-5">
          <Input
            label="Seu nome"
            name="name"
            autoComplete="name"
            defaultValue={state.values?.name}
            error={state.errors?.name}
          />
          <Input
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com.br"
            defaultValue={state.values?.email}
            error={state.errors?.email}
          />
          <PasswordInput
            label="Senha"
            name="password"
            autoComplete="new-password"
            placeholder="Mínimo de 8 caracteres"
            error={state.errors?.password}
          />
          <PasswordInput
            label="Confirmar senha"
            name="confirmPassword"
            autoComplete="new-password"
            error={state.errors?.confirmPassword}
          />
        </div>
      </fieldset>

      <Button type="submit" loading={pending} className="w-full">
        {pending ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}
