"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatPhone } from "@/lib/format";
import type { EditCustomerState } from "./actions";

export type CustomerData = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
};

type Props = {
  customer: CustomerData;
  action: (
    prev: EditCustomerState,
    formData: FormData,
  ) => Promise<EditCustomerState>;
};

export function CustomerForm({ customer, action }: Props) {
  const [state, formAction, pending] = useActionState(
    action,
    {} as EditCustomerState,
  );

  // depois de um erro, volta o que o usuário digitou; antes, os dados do cliente
  const v = state.values ?? {
    name: customer.name,
    phone: formatPhone(customer.phone),
    email: customer.email ?? "",
    address: customer.address ?? "",
    notes: customer.notes ?? "",
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
        autoComplete="off"
        defaultValue={v.name}
        error={state.errors?.name}
      />
      <Input
        label="Telefone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="off"
        defaultValue={v.phone}
        error={state.errors?.phone}
      />
      <Input
        label="E-mail (opcional)"
        name="email"
        type="email"
        autoComplete="off"
        defaultValue={v.email}
        error={state.errors?.email}
      />
      <Input
        label="Endereço (opcional)"
        name="address"
        autoComplete="off"
        defaultValue={v.address}
      />
      <Textarea
        label="Observações (opcional)"
        name="notes"
        defaultValue={v.notes}
      />

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
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
