"use client";

import { useActionState, useState } from "react";
import type { DeleteCustomerState } from "./actions";

type Props = {
  action: (
    prev: DeleteCustomerState,
    formData: FormData,
  ) => Promise<DeleteCustomerState>;
};

export function DeleteCustomerSection({ action }: Props) {
  const [state, formAction, pending] = useActionState(
    action,
    {} as DeleteCustomerState,
  );
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="mt-10 border-t border-border pt-6">
      <h2 className="text-[15px] font-semibold text-ink">Excluir cliente</h2>
      <p className="mb-4 mt-1 text-sm text-muted">
        Esta ação não pode ser desfeita.
      </p>

      {state.message && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-danger-bg px-3.5 py-3 text-sm text-danger"
        >
          {state.message}
        </div>
      )}

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="h-11 rounded-lg border border-danger bg-white px-5 text-[15px] font-semibold text-danger transition-colors hover:bg-danger-bg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-danger focus-visible:ring-offset-2"
        >
          Excluir cliente
        </button>
      ) : (
        <form action={formAction} className="flex flex-wrap items-center gap-3">
          <p className="text-[15px] font-medium text-ink">Tem certeza?</p>
          <button
            type="submit"
            disabled={pending}
            className="h-11 rounded-lg bg-danger px-5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-danger focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Excluindo..." : "Sim, excluir"}
          </button>
          <button
            type="button"
            autoFocus
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="h-11 rounded-lg px-4 text-[15px] font-medium text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Cancelar
          </button>
        </form>
      )}
    </section>
  );
}
