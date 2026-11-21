import Link from "next/link";
import { notFound } from "next/navigation";
import {
  cancelWorkOrderFormAction,
  completeWorkOrderFormAction,
  fetchWorkOrder,
  startWorkOrderFormAction,
} from "../actions";

type Params = Promise<{ id: string }>;

const TZ = "America/Sao_Paulo";

const STEPS = [
  { key: "OPEN", label: "Aberta" },
  { key: "SCHEDULED", label: "Agendada" },
  { key: "IN_PROGRESS", label: "Em andamento" },
  { key: "COMPLETED", label: "Concluída" },
] as const;

const statusLabel: Record<string, string> = {
  OPEN: "Aberta",
  SCHEDULED: "Agendada",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  CANCELED: "Cancelada",
};

const statusColor: Record<string, string> = {
  OPEN: "bg-amber-50 text-amber-700 border-amber-100",
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-100",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELED: "bg-rose-50 text-rose-700 border-rose-100",
};

// sempre em horário de Brasília e 24h, independente do fuso do servidor
const formatFull = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

const formatShort = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

const btn =
  "inline-flex h-11 items-center rounded-lg px-5 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px]";
const btnDanger = `${btn} border border-danger bg-white text-danger hover:bg-danger-bg focus-visible:ring-danger/20`;
const btnSecondary = `${btn} border border-border-strong bg-white text-ink hover:bg-gray-50 focus-visible:ring-accent/30`;
const btnPrimary = `${btn} bg-accent text-white hover:bg-accent-hover focus-visible:ring-accent/30`;

export default async function WorkOrderPage({ params }: { params: Params }) {
  const { id } = await params;

  const order = await fetchWorkOrder(id);
  if (!order) notFound();

  const code = order.id.slice(-4).toUpperCase();
  const canEdit = order.status === "OPEN" || order.status === "SCHEDULED";
  const canStart = canEdit;
  const canComplete = order.status === "IN_PROGRESS";
  const canCancel = canEdit || canComplete;

  // do mais recente para o mais antigo
  const events = [...order.events].reverse();

  return (
    <main className="mx-auto max-w-6xl px-8 py-10 md:px-12">
      <Link
        href="/work-orders"
        className="text-sm font-medium text-accent hover:underline"
      >
        ← Ordens de serviço
      </Link>

      <div className="mb-6 mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold leading-9 tracking-tight text-ink">
            OS #{code}{" "}
            <span
              className={`ml-1 inline-block rounded-md border px-2.5 py-0.5 align-middle text-xs font-medium ${
                statusColor[order.status] ??
                "bg-gray-50 text-gray-700 border-gray-100"
              }`}
            >
              {statusLabel[order.status] ?? order.status}
            </span>
          </h1>
          <p className="mt-1 text-muted">{order.serviceName}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {canCancel && (
            <form action={cancelWorkOrderFormAction}>
              <input type="hidden" name="id" value={order.id} />
              <button type="submit" className={btnDanger}>
                Cancelar OS
              </button>
            </form>
          )}
          {canEdit && (
            <Link
              href={`/work-orders/${order.id}/edit`}
              className={btnSecondary}
            >
              Reagendar
            </Link>
          )}
          {canStart && (
            <form action={startWorkOrderFormAction}>
              <input type="hidden" name="id" value={order.id} />
              <button type="submit" className={btnPrimary}>
                Iniciar atendimento
              </button>
            </form>
          )}
          {canComplete && (
            <form action={completeWorkOrderFormAction}>
              <input type="hidden" name="id" value={order.id} />
              <button type="submit" className={btnPrimary}>
                Concluir OS
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-border bg-white shadow-sm">
          <h2 className="px-6 pb-2 pt-5 text-base font-semibold text-ink">
            Detalhes
          </h2>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 px-6 pb-5 pt-2 sm:grid-cols-2">
            <Field label="Cliente">
              <Link
                href={`/customers/${order.customer.id}`}
                className="font-medium text-accent hover:underline"
              >
                {order.customer.name}
              </Link>
            </Field>
            <Field label="Telefone">{order.customer.phone || "—"}</Field>
            <Field label="Técnico">{order.technician?.name ?? "—"}</Field>
            <Field label="Data">
              {order.scheduledAt ? (
                <time dateTime={order.scheduledAt}>
                  {formatFull(order.scheduledAt)}
                </time>
              ) : (
                <span className="text-muted">—</span>
              )}
            </Field>
            <Field label="Valor">
              R${" "}
              {Number(order.price).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Field>
            <div className="sm:col-span-2">
              <Field label="Problema relatado">
                <span className="whitespace-pre-wrap">{order.description}</span>
              </Field>
            </div>
          </dl>

          <div className="border-t border-border p-6">
            <StatusStepper status={order.status} />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-white shadow-sm">
          <h2 className="px-5 pb-2 pt-5 text-base font-semibold text-ink">
            Histórico
          </h2>
          <ul className="px-5 pb-4 pt-2">
            {events.length ? (
              events.map((event) => (
                <li
                  key={event.id}
                  className="border-b border-border py-2.5 last:border-0"
                >
                  <p className="text-sm text-ink">{event.message}</p>
                  <p className="text-xs text-muted">
                    {formatShort(event.createdAt)} ·{" "}
                    {event.actorName ?? "Usuário removido"}
                  </p>
                </li>
              ))
            ) : (
              <li className="py-2.5 text-sm text-muted">
                Sem histórico de eventos.
              </li>
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-[15px] text-ink">{children}</dd>
    </div>
  );
}

function StatusStepper({ status }: { status: string }) {
  if (status === "CANCELED") {
    return (
      <p className="rounded-lg bg-danger-bg px-3.5 py-3 text-sm text-danger">
        Esta ordem de serviço foi cancelada.
      </p>
    );
  }

  const current = STEPS.findIndex((step) => step.key === status);
  const completed = status === "COMPLETED";

  return (
    <ol className="flex" aria-label="Progresso da ordem de serviço">
      {STEPS.map((step, index) => {
        const done = index < current || (completed && index === current);
        const isCurrent = index === current && !completed;
        const reached = index <= current;

        const dot = done
          ? "border-accent bg-accent"
          : isCurrent
            ? "border-accent bg-white ring-4 ring-accent/15"
            : "border-border-strong bg-white";

        return (
          <li
            key={step.key}
            aria-current={isCurrent ? "step" : undefined}
            className={`relative flex-1 text-center text-xs ${
              isCurrent ? "font-medium text-ink" : "text-muted"
            }`}
          >
            {index > 0 && (
              <span
                aria-hidden
                className={`absolute -left-1/2 top-[5px] h-0.5 w-full ${
                  reached ? "bg-accent" : "bg-border"
                }`}
              />
            )}
            <i
              aria-hidden
              className={`relative z-[1] mx-auto mb-2 block size-3 rounded-full border-2 ${dot}`}
            />
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}
