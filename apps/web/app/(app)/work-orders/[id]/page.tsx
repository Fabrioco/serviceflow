import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session";
import {
  cancelWorkOrderFormAction,
  startWorkOrderFormAction,
} from "../actions";

type Params = Promise<{ id: string }>;

export default async function WorkOrderPage({ params }: { params: Params }) {
  const { id } = await params;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/login");

  const res = await fetch(`${process.env.API_URL}/work-orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Não foi possível carregar a ordem de serviço");

  const order = await res.json();

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

  return (
    <main className="mx-auto max-w-6xl px-8 py-10 md:px-12">
      <Link
        href="/work-orders"
        className="inline-flex h-11 items-center rounded-lg px-4 text-[15px] font-medium text-muted hover:text-ink mb-4 block sm:inline-block"
      >
        ← Ordens de serviço
      </Link>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-semibold leading-9 tracking-tight text-ink">
              Editar OS #{order.id.slice(-4).toUpperCase()}
            </h1>
            <p className="mt-1 text-sm text-muted">{order.serviceName}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5 ${statusColor[order.status] || "bg-gray-50 text-gray-700 border-gray-100"}`}
          >
            {statusLabel[order.status] ?? order.status}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
          <div className="flex gap-3">
            <form action={cancelWorkOrderFormAction} className="inline">
              <input type="hidden" name="id" value={order.id} />
              <button
                type="submit"
                className="h-11 rounded-lg border border-rose-200 bg-white px-5 text-[15px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-rose-100"
              >
                Cancelar OS
              </button>
            </form>
            <Link
              href={`/work-orders/${id}/edit`}
              className="h-11 rounded-lg border border-border bg-white px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-gray-50"
            >
              Reagendar
            </Link>
            <form action={startWorkOrderFormAction} className="inline">
              <input type="hidden" name="id" value={order.id} />
              <button
                type="submit"
                className="h-11 rounded-lg bg-accent px-5 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Iniciar atendimento
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="text-[16px] font-semibold text-ink mb-6">
              Detalhes
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-[12px] font-medium text-muted">Cliente</dt>
                <dd className="mt-1 text-ink">
                  <Link
                    href={`/customers/${order.customer.id}`}
                    className="text-accent hover:underline"
                  >
                    {order.customer.name}
                  </Link>
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-[12px] font-medium text-muted">Telefone</dt>
                <dd className="mt-1 text-ink">{order.customer.phone}</dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-[12px] font-medium text-muted">Técnico</dt>
                <dd className="mt-1 text-ink">
                  {order.technician?.name ?? "—"}
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-[12px] font-medium text-muted">Data</dt>
                <dd className="mt-1 text-ink">
                  {order.scheduledAt ? (
                    <time>
                      {new Date(order.scheduledAt).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </time>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-[12px] font-medium text-muted">Valor</dt>
                <dd className="mt-1 text-ink">
                  R${" "}
                  {Number(order.price).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[12px] font-medium text-muted">
                  Problema relatado
                </dt>
                <dd className="mt-1 text-ink whitespace-pre-wrap">
                  {order.description}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="text-[16px] font-semibold text-ink mb-4">
              Histórico
            </h2>
            <ul className="space-y-3">
              {order.events?.length ? (
                order.events.map((event: any) => (
                  <li
                    key={event.id}
                    className="pb-3 border-b border-border last:border-0"
                  >
                    <p className="text-[14px] text-ink">{event.message}</p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {event.actorName ?? event.actorId} ·{" "}
                      {new Date(event.createdAt).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted">
                  Sem histórico de eventos.
                </li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
