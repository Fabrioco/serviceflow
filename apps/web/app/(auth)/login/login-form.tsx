"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

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

      <Input
        label="Senha"
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="Sua senha"
        error={state.errors?.password}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="h-9 rounded-md px-2.5 text-[13px] font-medium text-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        }
      />

      <Button type="submit" loading={pending} className="mt-2 w-full">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
