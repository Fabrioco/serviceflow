"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWorkOrderAction, WorkOrderState } from "../actions";

type Props = {
  customers: Array<{ id: string; name: string; phone: string }>;
  technicians: Array<{ id: string; name: string }>;
};

export function NewWorkOrderForm({ customers, technicians }: Props) {
  const [state, formAction, isPending] = useActionState(
    createWorkOrderAction,
    null as WorkOrderState | null,
  );

  return (
    <form
      action={formAction}
      noValidate
      className="rounded-xl border border-border bg-white p-8 shadow-sm space-y-6"
    >
      {state?.message && (
        <div
          role="alert"
          className="rounded-lg bg-danger-bg px-3.5 py-3 text-sm text-danger"
        >
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-muted">Cliente</label>
          <select
            name="customerId"
            required
            defaultValue=""
            className="h-11 w-full rounded-lg border border-border bg-white px-3.5 text-[15px] text-ink focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent focus:ring-offset-1"
          >
            <option value="">Selecione o cliente</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.phone}
              </option>
            ))}
          </select>
          {state?.errors?.customerId && (
            <p className="mt-1 text-[12px] text-danger">
              {state.errors.customerId}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-muted">
            Técnico (opcional)
          </label>
          <select
            name="technicianId"
            className="h-11 w-full rounded-lg border border-border bg-white px-3.5 text-[15px] text-ink focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent focus:ring-offset-1"
          >
            <option value="">Sem técnico por enquanto</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Input
          label="Serviço"
          name="serviceName"
          type="text"
          placeholder="Ex.: Manutenção de ar-condicionado"
          error={state?.errors?.serviceName}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[13px] font-medium text-muted">
          Descrição do problema
        </label>
        <textarea
          name="description"
          rows={4}
          placeholder="O ar-condicionado do quarto não está gelando e pinga água."
          className={`w-full rounded-lg border border-border bg-white px-3.5 py-3 text-[15px] text-ink focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent focus:ring-offset-1 ${
            state?.errors?.description
              ? "border-danger"
              : "border-border-strong"
          }`}
        />
        {state?.errors?.description && (
          <p className="mt-1 text-[12px] text-danger">
            {state.errors.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Input
            label="Valor (R$)"
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            error={state?.errors?.price}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-muted">
            Agendamento (opcional)
          </label>
          <input
            name="scheduledAt"
            type="datetime-local"
            className="h-11 w-full rounded-lg border border-border bg-white px-3.5 text-[15px] text-ink focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent focus:ring-offset-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" loading={isPending}>
          {isPending ? "Criando..." : "Criar ordem"}
        </Button>
        <Link
          href="/work-orders"
          className="inline-flex h-11 items-center rounded-lg px-4 text-[15px] font-medium text-muted hover:text-ink"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
