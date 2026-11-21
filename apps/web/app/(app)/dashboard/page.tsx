import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "../actions";
import { fetchDashboard } from "./actions";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

function getRelativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `há ${hours} h`;

  const days = Math.floor(hours / 24);

  if (days === 1) return "ontem";

  return `há ${days} dias`;
}

function getStatusLabel(status: string) {
  const statuses: Record<string, string> = {
    OPEN: "Aberta",
    SCHEDULED: "Agendada",
    IN_PROGRESS: "Em andamento",
    COMPLETED: "Concluída",
    CANCELED: "Cancelada",
  };

  return statuses[status] ?? status;
}

function getStatusClass(status: string) {
  const classes: Record<string, string> = {
    SCHEDULED: "bg-blue-50 text-blue-700",
    IN_PROGRESS: "bg-amber-50 text-amber-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    CANCELED: "bg-red-50 text-red-700",
    OPEN: "bg-gray-100 text-gray-700",
  };

  return classes[status] ?? "bg-gray-100 text-gray-700";
}

const metrics = [
  {
    key: "open",
    label: "Ordens abertas",
    color: "bg-blue-50 text-blue-700",
    icon: "📋",
  },
  {
    key: "scheduledToday",
    label: "Agendadas para hoje",
    color: "bg-violet-50 text-violet-700",
    icon: "📅",
  },
  {
    key: "inProgress",
    label: "Em andamento",
    color: "bg-amber-50 text-amber-700",
    icon: "⚙️",
  },
  {
    key: "completedThisMonth",
    label: "Concluídas no mês",
    color: "bg-emerald-50 text-emerald-700",
    icon: "✓",
  },
  {
    key: "revenueThisMonth",
    label: "Faturamento do mês",
    color: "bg-teal-50 text-teal-700",
    icon: "R$",
  },
] as const;

export default async function DashboardPage() {
  const [user, dashboard] = await Promise.all([
    requireUser(),
    fetchDashboard(),
  ]);

  const metricValues: Record<string, string> = {
    open: String(dashboard.open),
    scheduledToday: String(dashboard.scheduledToday),
    inProgress: String(dashboard.inProgress),
    completedThisMonth: String(dashboard.completedThisMonth),
    revenueThisMonth: currencyFormatter.format(dashboard.revenueThisMonth),
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-gray-900">
      {/* Main */}
      <main className="mx-auto max-w-360 px-6 py-8 lg:px-12 lg:py-10">
        {/* Page heading */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Olá, {user.name.split(" ")[0]}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Resumo da sua operação hoje
            </p>
          </div>

          <Link
            href="/work-orders/new"
            className="inline-flex h-11 items-center rounded-lg bg-accent px-5 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            + Nova ordem de serviço
          </Link>
        </div>

        {/* Partial data warning */}
        {dashboard.partial && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Alguns indicadores podem estar incompletos porque existem mais
            ordens do que o painel conseguiu consultar.
          </div>
        )}

        {/* Metrics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <article
              key={metric.key}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  {metric.label}
                </p>

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${metric.color}`}
                >
                  {metric.icon}
                </div>
              </div>

              <p className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">
                {metricValues[metric.key]}
              </p>
            </article>
          ))}
        </section>

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
          {/* Upcoming appointments */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Próximos atendimentos
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Ordens agendadas e em andamento
                </p>
              </div>

              <Link
                href="/work-orders"
                className="text-sm font-medium text-accent hover:underline"
              >
                Ver todas
              </Link>
            </div>

            {dashboard.upcoming.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3">Hora</th>
                      <th className="px-5 py-3">Cliente</th>
                      <th className="px-5 py-3">Serviço</th>
                      <th className="px-5 py-3">Técnico</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {dashboard.upcoming.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="font-medium text-gray-900">
                            {timeFormatter.format(
                              new Date(appointment.scheduledAt),
                            )}
                          </div>

                          <div className="mt-0.5 text-xs text-gray-400">
                            {appointment.isToday
                              ? "Hoje"
                              : dateFormatter.format(
                                  new Date(appointment.scheduledAt),
                                )}
                          </div>
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-800">
                          {appointment.customerName}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {appointment.serviceName}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {appointment.technicianName ?? "Não atribuído"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                              appointment.status,
                            )}`}
                          >
                            {getStatusLabel(appointment.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                  📅
                </div>

                <p className="font-medium text-gray-800">
                  Nenhum atendimento próximo
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Os próximos agendamentos aparecerão aqui.
                </p>
              </div>
            )}
          </section>

          {/* Recent activity */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5">
              <h2 className="font-semibold text-gray-900">Atividade recente</h2>

              <p className="mt-1 text-xs text-gray-500">
                Últimas atualizações das ordens de serviço
              </p>
            </div>

            {dashboard.activity.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {dashboard.activity.map((activity) => (
                  <Link
                    key={activity.id}
                    href={`/work-orders/${activity.orderId}`}
                    className="flex gap-3 px-5 py-4 transition hover:bg-gray-50"
                  >
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-[#0F766E]">
                      {activity.actorName
                        ? activity.actorName.charAt(0).toUpperCase()
                        : "S"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-5 text-gray-800">
                        {activity.message}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                        <span>{activity.actorName ?? "Sistema"}</span>

                        <span>·</span>

                        <span>{getRelativeTime(activity.createdAt)}</span>
                      </div>
                    </div>

                    <span className="shrink-0 text-xs font-medium text-accent">
                      #{activity.orderCode}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                  📝
                </div>

                <p className="font-medium text-gray-800">
                  Nenhuma atividade recente
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  As atualizações das ordens aparecerão aqui.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
