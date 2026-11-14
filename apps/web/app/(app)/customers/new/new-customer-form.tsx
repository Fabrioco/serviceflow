"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCustomerAction, type NewCustomerState } from "./actions";

export function NewCustomerForm() {
  const [state, formAction, pending] = useActionState(createCustomerAction, {} as NewCustomerState);
  const v = state.values;

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.message && (
        <div role="alert" className="rounded-lg bg-danger-bg px-3.5 py-3 text-sm text-danger">
          {state.message}
        </div>
      )}

      <Input label="Nome" name="name" autoComplete="off" defaultValue={v?.name} error={state.errors?.name} placeholder="Ana Maria da Silva Souza" />
      <Input label="Telefone" name="phone" type="tel" inputMode="tel" autoComplete="off"
        placeholder="(19) 99999-0000" defaultValue={v?.phone} error={state.errors?.phone} />
      <Input label="E-mail (opcional)" name="email" type="email" autoComplete="off"
        placeholder="voce@empresa.com.br" defaultValue={v?.email} error={state.errors?.email} />
      <Input label="Endereço (opcional)" name="address" autoComplete="off" defaultValue={v?.address} placeholder="Rua Paulista, 203 - Campinas" />
      <Textarea label="Observações (opcional)" name="notes" defaultValue={v?.notes} placeholder="Anotações sobre o cliente." />

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={pending}>
          {pending ? "Cadastrando..." : "Cadastrar cliente"}
        </Button>
        <Link href="/customers" className="inline-flex h-11 items-center rounded-lg px-4 text-[15px] font-medium text-muted hover:text-ink">
          Cancelar
        </Link>
      </div>
    </form>
  );
}