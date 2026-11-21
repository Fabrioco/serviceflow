import Link from "next/link";
import { Suspense } from "react";
import { fetchWorkOrders } from "./actions";
import { Pagination } from "../customers/pagination";

type SearchParams = Promise<{
  search?: string;
  page?: string;
  status?: string;
}>;

const STATUSES = [
  "OPEN",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELED",
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
const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

// só aceita status conhecidos (um valor inválido faria a API responder 400)
const parseStatus = (value?: string) => STATUSES.find((s) => s === value);

export default function WorkOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto max-w-6xl px-8 py-10 md:px-12">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold leading-9 tracking-tight text-ink">
            Ordens de serviço
          </h1>
          <p className="mt-1 text-sm text-muted">
            Acompanhe o andamento de todas as ordens da sua empresa.
          </p>
        </div>
        <Link
          href="/work-orders/new"
          className="inline-flex h-11 items-center rounded-lg bg-accent px-5 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Nova ordem
        </Link>
      </header>

      <Suspense fallback={<StatsSkeleton />}>
        <Stats searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<ListSkeleton />}>
        <WorkOrdersContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

// ---------- cards de resumo (total de cada status vem do meta.total da API) ----------

const STAT_CARDS: Array<{
  title: string;
  status?: (typeof STATUSES)[number];
  subtitle: string;
}> = [
  { title: "Todas", subtitle: "no total" },
  { title: "Abertas", status: "OPEN", subtitle: "sem agendamento" },
  { title: "Agendadas", status: "SCHEDULED", subtitle: "com data marcada" },
  { title: "Em andamento", status: "IN_PROGRESS", subtitle: "em atendimento" },
  { title: "Concluídas", status: "COMPLETED", subtitle: "finalizadas" },
];

async function Stats({ searchParams }: { searchParams: SearchParams }) {
  const current = parseStatus((await searchParams).status);

  // limit 1: só interessa o total
  const totals = await Promise.all(
    STAT_CARDS.map((card) =>
      fetchWorkOrders({ status: card.status, limit: 1 }).then(
        (res) => res.meta.total,
      ),
    ),
  );

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {STAT_CARDS.map((card, index) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={String(totals[index])}
          subtitle={card.subtitle}
          href={
            card.status ? `/work-orders?status=${card.status}` : "/work-orders"
          }
          active={card.status === current}
        />
      ))}
    </div>
  );
}

// ---------- lista ----------

async function WorkOrdersContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { search, page, status: rawStatus } = await searchParams;
  const status = parseStatus(rawStatus);
  const pageNumber = Math.max(1, Number(page) || 1);

  const { data: orders, meta } = await fetchWorkOrders({
    search,
    page: pageNumber,
    status,
  });

  function getPageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (search?.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    params.set("page", String(targetPage));
    return `/work-orders?${params.toString()}`;
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <form role="search" className="flex gap-2 sm:w-[420px]">
          <input
            name="search"
            defaultValue={search ?? ""}
            placeholder="Buscar por cliente ou serviço"
            className="h-11 w-full rounded-lg border border-border bg-white px-3.5 text-[15px] text-ink placeholder:text-[#6b7280] focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent focus:ring-offset-1"
          />
          <select
            name="status"
            defaultValue={status ?? ""}
            className="h-11 rounded-lg border border-border bg-white px-3.5 text-[15px] text-ink focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent focus:ring-offset-1"
          >
            <option value="">Todos os status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-11 rounded-lg bg-accent px-4 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Filtrar
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50">
              <th className="px-6 py-4 text-[13px] font-medium text-muted">
                OS
              </th>
              <th className="px-6 py-4 text-[13px] font-medium text-muted">
                Cliente
              </th>
              <th className="px-6 py-4 text-[13px] font-medium text-muted">
                Serviço
              </th>
              <th className="px-6 py-4 text-[13px] font-medium text-muted">
                Técnico
              </th>
              <th className="px-6 py-4 text-[13px] font-medium text-muted">
                Data
              </th>
              <th className="px-6 py-4 text-right text-[13px] font-medium text-muted">
                Valor
              </th>
              <th className="px-6 py-4 text-[13px] font-medium text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted">
                  Nenhuma ordem de serviço encontrada.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/work-orders/${order.id}`}
                      className="font-medium text-accent hover:underline"
                    >
                      #{order.id.slice(-4).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-ink">{order.customer.name}</td>
                  <td className="px-6 py-4 text-ink">{order.serviceName}</td>
                  <td className="px-6 py-4">
                    {order.technician ? (
                      <span className="text-ink">{order.technician.name}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-ink">
                    {order.scheduledAt ? (
                      <time dateTime={order.scheduledAt}>
                        {formatDateTime(order.scheduledAt)}
                      </time>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-ink">
                    R${" "}
                    {Number(order.price).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5 ${
                        statusColor[order.status] ??
                        "bg-gray-50 text-gray-700 border-gray-100"
                      }`}
                    >
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={pageNumber}
        previousHref={pageNumber > 1 ? getPageHref(pageNumber - 1) : undefined}
        nextHref={
          pageNumber < meta.totalPages ? getPageHref(pageNumber + 1) : undefined
        }
      />
    </>
  );
}

// ---------- componentes ----------

function StatCard({
  title,
  value,
  subtitle,
  href,
  active,
}: {
  title: string;
  value: string;
  subtitle: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`rounded-xl border bg-white p-6 transition-colors hover:border-accent ${
        active ? "border-accent ring-1 ring-accent" : "border-border"
      }`}
    >
      <h3 className="text-[13px] font-medium text-muted">{title}</h3>
      <p className="mt-2 text-[28px] font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{subtitle}</p>
    </Link>
  );
}

function StatsSkeleton() {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {STAT_CARDS.map((card) => (
        <div
          key={card.title}
          className="h-[122px] rounded-xl bg-border motion-safe:animate-pulse"
        />
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-11 w-full max-w-[420px] rounded-lg bg-border motion-safe:animate-pulse" />
      <div className="h-64 rounded-xl bg-border motion-safe:animate-pulse" />
    </div>
  );
}
