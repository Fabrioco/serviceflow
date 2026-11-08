"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction, type LoginState } from "./actions";
import { PasswordInput } from "@/components/ui/password-input";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

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
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@empresa.com.br"
        defaultValue={state.email}
        error={state.errors?.email}
      />

      <PasswordInput
        label="Senha"
        name="password"
        autoComplete="new-password"
        placeholder="Mínimo de 8 caracteres"
        error={state.errors?.password}
      />

      <Button type="submit" loading={pending} className="mt-2 w-full">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
