import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "../actions";
import { fetchDashboard } from "./actions";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await fetchDashboard();

  return (
    <main className="mx-auto max-w-3xl px-8 py-16">
      <h1 className="text-[28px] font-semibold leading-9 text-ink">
        Olá, {user.name}
      </h1>
      <p className="mt-2 text-muted">Seu papel: {user.role}</p>

      <form action={logoutAction} className="mt-8">
        <Button variant="secondary">Sair</Button>
      </form>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-4xl font-bold"> {data.open}</div>
          <div className="text-muted text-sm">Ordens Abertas</div>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-4xl font-bold">{data.scheduledToday}</div>
          <div className="text-muted text-sm">Agendadas Hoje</div>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-4xl font-bold">{data.inProgress}</div>
          <div className="text-muted text-sm">Em Andamento</div>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-4xl font-bold">{data.completedThisMonth}</div>
          <div className="text-muted text-sm">Concluídas</div>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-4xl font-bold">R$ {data.revenueThisMonth.toLocaleString()}</div>
          <div className="text-muted text-sm">Faturamento</div>
        </div>
      </div>

      {/* Próximos atendimentos */}
      <div className="border rounded-lg p-6 bg-white shadow-sm mb-8">
        <h2 className="text-xl font-medium mb-4">Próximos Atendimentos</h2>
        {data.upcoming.length === 0 ? (
          <p className="text-muted">Nenhum atendimento agendado</p>
        ) : (
          <div className="space-y-3">
            {data.upcoming.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <div className="font-medium">{appointment.customerName}</div>
                  <div className="text-xs text-muted">{appointment.serviceName}</div>
                </div>
                <div className="text-xs">
                  {appointment.isToday && "Hoje "}{appointment.scheduledAt}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Atividade recente */}
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-medium mb-4">Atividade Recente</h2>
        {data.activity.length === 0 ? (
          <p className="text-muted">Nenhuma atividade recente</p>
        ) : (
          <ul className="space-y-2">
            {data.activity.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <span className="text-muted text-sm">{item.message}</span>
                <span className="text-xs text-ink ml-auto">{item.createdAt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}