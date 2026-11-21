"use server";

import {
  fetchWorkOrder,
  fetchWorkOrders,
  type WorkOrder,
} from "../work-orders/actions";

export type DashboardAppointment = {
  id: string;
  code: string;
  scheduledAt: string;
  isToday: boolean;
  customerName: string;
  serviceName: string;
  technicianName: string | null;
  status: string;
};

export type DashboardActivity = {
  id: string;
  message: string;
  orderId: string;
  orderCode: string;
  actorName: string | null;
  createdAt: string;
};

export type DashboardData = {
  open: number;
  scheduledToday: number;
  inProgress: number;
  completedThisMonth: number;
  revenueThisMonth: number;
  upcoming: DashboardAppointment[];
  activity: DashboardActivity[];
  /** true quando havia mais ordens do que o painel leu (números podem estar incompletos) */
  partial: boolean;
};

const TZ = "America/Sao_Paulo";
const PAGE_SIZE = 50;
const MAX_PAGES = 5;

// "YYYY-MM-DD" no horário de Brasília
const dayKey = (value: Date | string) =>
  new Date(value).toLocaleDateString("en-CA", { timeZone: TZ });

const orderCode = (id: string) => id.slice(-4).toUpperCase();

const scheduledTime = (order: WorkOrder) =>
  new Date(order.scheduledAt as string).getTime();

// lê todas as páginas de um status (até MAX_PAGES), em paralelo
async function fetchAllByStatus(status: string) {
  const first = await fetchWorkOrders({ status, page: 1, limit: PAGE_SIZE });
  const lastPage = Math.min(first.meta.totalPages, MAX_PAGES);

  const others = await Promise.all(
    Array.from({ length: Math.max(0, lastPage - 1) }, (_, index) =>
      fetchWorkOrders({ status, page: index + 2, limit: PAGE_SIZE }),
    ),
  );

  return {
    total: first.meta.total,
    rows: [first, ...others].flatMap((page) => page.data),
    complete: first.meta.totalPages <= MAX_PAGES,
  };
}

export async function fetchDashboard(): Promise<DashboardData> {
  const now = new Date();
  const today = dayKey(now);
  const month = today.slice(0, 7);
  const startOfToday = new Date(`${today}T00:00:00-03:00`).getTime();

  const [open, scheduled, inProgress, completed, latest] = await Promise.all([
    fetchWorkOrders({ status: "OPEN", limit: 1 }), // só interessa o total
    fetchAllByStatus("SCHEDULED"),
    fetchAllByStatus("IN_PROGRESS"),
    fetchAllByStatus("COMPLETED"),
    fetchWorkOrders({ limit: 5 }), // as 5 mais recentes, para a atividade
  ]);

  // ---------- números ----------
  const scheduledToday = scheduled.rows.filter(
    (order) => order.scheduledAt && dayKey(order.scheduledAt) === today,
  ).length;

  const completedThisMonthRows = completed.rows.filter(
    (order) =>
      order.completedAt && dayKey(order.completedAt).slice(0, 7) === month,
  );
  const revenueThisMonth = completedThisMonthRows.reduce(
    (sum, order) => sum + Number(order.price),
    0,
  );

  // ---------- próximos atendimentos (de hoje em diante) ----------
  const upcoming: DashboardAppointment[] = [
    ...scheduled.rows,
    ...inProgress.rows,
  ]
    .filter(
      (order) => order.scheduledAt && scheduledTime(order) >= startOfToday,
    )
    .sort((a, b) => scheduledTime(a) - scheduledTime(b))
    .slice(0, 6)
    .map((order) => ({
      id: order.id,
      code: orderCode(order.id),
      scheduledAt: order.scheduledAt as string,
      isToday: dayKey(order.scheduledAt as string) === today,
      customerName: order.customer.name,
      serviceName: order.serviceName,
      technicianName: order.technician?.name ?? null,
      status: order.status,
    }));

  // ---------- atividade recente (histórico das OS mais recentes) ----------
  const details = await Promise.all(
    latest.data.map((order) => fetchWorkOrder(order.id).catch(() => null)),
  );

  const activity: DashboardActivity[] = details
    .flatMap((order) =>
      order
        ? order.events.map((event) => ({
            id: event.id,
            message: event.message,
            orderId: order.id,
            orderCode: orderCode(order.id),
            actorName: event.actorName,
            createdAt: event.createdAt,
          }))
        : [],
    )
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  return {
    open: open.meta.total,
    scheduledToday,
    inProgress: inProgress.total,
    completedThisMonth: completedThisMonthRows.length,
    revenueThisMonth,
    upcoming,
    activity,
    partial: !scheduled.complete || !inProgress.complete || !completed.complete,
  };
}
