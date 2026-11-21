import Link from "next/link";
import { Suspense } from "react";
import { fetchWorkOrders, type WorkOrder } from "./actions";
import { Pagination } from "../customers/pagination";

type SearchParams = Promise<{
  search?: string;
  page?: string;
  status?: string;
}>;

export default async function WorkOrdersPage({
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <StatCard title="Todas" value="—" subtitle="carregando" />
        <StatCard title="Abertas" value="—" subtitle="carregando" />
        <StatCard title="Agendadas" value="—" subtitle="carregando" />
        <StatCard title="Em andamento" value="—" subtitle="carregando" />
        <StatCard title="Concluídas" value="—" subtitle="carregando" />
      </div>

      <Suspense fallback={<ListSkeleton />}>
        <WorkOrdersContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function WorkOrdersContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { search, page, status } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);

  const res: Awaited<ReturnType<typeof fetchWorkOrders>> =
    await fetchWorkOrders({ search, page: pageNumber, status });

  const orders = res.data;
  const { totalPages } = res.meta;

  function getPageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (search?.trim()) params.set("search", search.trim());
    if (status?.trim()) params.set("status", status.trim());
    params.set("page", String(targetPage));
    return `/work-orders?${params.toString()}`;
  }

  const statusColor: Record<string, string> = {
    OPEN: "bg-amber-50 text-amber-700 border-amber-100",
    SCHEDULED: "bg-blue-50 text-blue-700 border-blue-100",
    IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-100",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    CANCELED: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <form role="search" className="flex gap-2 sm:w-[320px]">
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
            <option value="OPEN">Aberta</option>
            <option value="SCHEDULED">Agendada</option>
            <option value="IN_PROGRESS">Em andamento</option>
            <option value="COMPLETED">Concluída</option>
            <option value="CANCELED">Cancelada</option>
          </select>
          <button
            type="submit"
            className="h-11 rounded-lg bg-accent px-4 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Filtrar
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
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
              <th className="px-6 py-4 text-[13px] font-medium text-muted text-right">
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
                  <td className="px-6 py-4 text-ink">
                    {order.scheduledAt ? (
                      <span>
                        {new Date(order.scheduledAt).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-ink">
                    R${" "}
                    {Number(order.price).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5 ${
                        statusColor[order.status] ||
                        "bg-gray-50 text-gray-700 border-gray-100"
                      }`}
                    >
                      {order.status
                        .replace("_", " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
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
          pageNumber < res.meta.totalPages
            ? getPageHref(pageNumber + 1)
            : undefined
        }
      />
    </>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <h3 className="text-[13px] font-medium text-muted">{title}</h3>
      <p className="mt-2 text-[28px] font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{subtitle}</p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 rounded-lg bg-border motion-safe:animate-pulse" />
      <div className="h-8 w-full rounded-lg bg-border motion-safe:animate-pulse" />
      <div className="h-32 rounded-xl bg-border motion-safe:animate-pulse" />
      <div className="h-16 w-full max-w-xs rounded-lg bg-border motion-safe:animate-pulse" />
      <div className="h-16 w-full max-w-xs rounded-lg bg-border motion-safe:animate-pulse" />
    </div>
  );
}
