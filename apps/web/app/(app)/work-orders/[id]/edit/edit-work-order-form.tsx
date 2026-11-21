"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { updateWorkOrderAction, type WorkOrderState } from "../../actions";

type Props = {
  order: {
    id: string;
    serviceName: string;
    description: string;
    price: string;
    technicianId: string | null;
    scheduledAt: string | null;
    customerName: string;
  };
  technicians: Array<{ id: string; name: string }>;
};

export function EditWorkOrderForm({ order, technicians }: Props) {
  const [state, formAction, isPending] = useActionState(
    (prev: WorkOrderState | null, formData: FormData) =>
      updateWorkOrderAction(order.id, prev, formData),
    null as WorkOrderState | null,
  );
  const [dateInvalid, setDateInvalid] = useState(false);

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

      {state?.errors && (
        <div className="space-y-2">
          {Object.entries(state.errors).map(([key, msg]) => (
            <p key={key} className="text-[12px] text-danger">
              {msg}
            </p>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[13px] font-medium text-muted">Cliente</label>
        <div className="flex h-11 items-center rounded-lg border border-border bg-gray-50 px-3.5 text-[15px] text-ink">
          {order.customerName ?? "—"}
        </div>
      </div>

      <div className="space-y-2">
        <Input
          label="Serviço"
          name="serviceName"
          defaultValue={state?.values?.serviceName ?? order.serviceName}
          error={state?.errors?.serviceName}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[13px] font-medium text-muted">
          Descrição do problema
        </label>
        <textarea
          name="description"
          defaultValue={state?.values?.description ?? order.description}
          rows={4}
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
            defaultValue={
              state?.values?.price ?? Number(order.price).toFixed(2)
            }
            error={state?.errors?.price}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-muted">
            Técnico (opcional)
          </label>
          <select
            name="technicianId"
            defaultValue={
              state?.values?.technicianId ?? order.technicianId ?? ""
            }
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
        <label className="text-[13px] font-medium text-muted">
          Agendamento (opcional)
        </label>
        <DateTimePicker
          name="scheduledAt"
          initialIso={order.scheduledAt}
          onInvalidChange={setDateInvalid}
        />
        <p className="mt-1 text-[12px] text-muted">
          Horário de Brasília, formato 24h. Ao informar a data, a ordem fica
          como Agendada. Sem data, fica Aberta.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" loading={isPending} disabled={dateInvalid}>
          {isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
        <Link
          href={`/work-orders/${order.id}`}
          className="inline-flex h-11 items-center rounded-lg px-4 text-[15px] font-medium text-muted hover:text-ink"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
