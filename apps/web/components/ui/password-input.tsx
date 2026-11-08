// Salve como: apps/web/components/ui/password-input.tsx
"use client";

import { useState, type ComponentProps } from "react";
import { Input } from "./input";

// Aceita as mesmas props do Input, menos "type" e "trailing",
// porque este componente controla os dois sozinho.
type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type" | "trailing">;

export function PasswordInput(props: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <Input
      {...props}
      type={show ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="h-9 rounded-md px-2.5 text-[13px] font-medium text-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent"
        >
          {show ? "Ocultar" : "Mostrar"}
        </button>
      }
    />
  );
}
