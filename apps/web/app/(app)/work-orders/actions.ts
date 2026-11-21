"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE } from "@/lib/session";

export type WorkOrder = {
  id: string;
  status: string;
  serviceName: string;
  description: string;
  price: string;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  customer: { id: string; name: string; phone: string };
  technician: { id: string; name: string } | null;
};

export type WorkOrderDetail = WorkOrder & {
  events: Array<{
    id: string;
    message: string;
    actorId: string;
    actorName: string | null;
    createdAt: string;
  }>;
};

type WorkOrderMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type WorkOrdersResponse = {
  data: WorkOrder[];
  meta: WorkOrderMeta;
};

export type WorkOrderState = {
  message?: string;
  errors?: Partial<
    Record<
      | "customerId"
      | "serviceName"
      | "description"
      | "price"
      | "technicianId"
      | "scheduledAt",
      string
    >
  >;
  values?: Record<string, string>;
};

const headers = async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/login");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const fetchWorkOrders = async ({
  search,
  page = 1,
  limit = 10,
  status,
}: {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
} = {}) => {
  const h = await headers();

  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  if (status?.trim()) params.set("status", status.trim());
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await fetch(
    `${process.env.API_URL}/work-orders?${params.toString()}`,
    {
      headers: h,
      cache: "no-store",
    },
  );

  if (!res.ok) throw new Error("Erro ao buscar ordens de serviço");
  return (await res.json()) as WorkOrdersResponse;
};

export const fetchWorkOrder = async (id: string) => {
  const h = await headers();

  const res = await fetch(`${process.env.API_URL}/work-orders/${id}`, {
    headers: h,
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Não foi possível carregar a ordem de serviço");
  return (await res.json()) as WorkOrderDetail;
};

// ---------- Server Actions com assinatura (formData) para uso direto em <form action> ----------

export async function createWorkOrderFormAction(formData: FormData) {
  const get = (key: string) => String(formData.get(key) ?? "").trim();

  const values = {
    customerId: get("customerId"),
    serviceName: get("serviceName"),
    description: get("description"),
    price: get("price"),
    technicianId: get("technicianId"),
    scheduledAt: get("scheduledAt"),
  };

  const errors: WorkOrderState["errors"] = {};
  if (!values.customerId) errors.customerId = "Selecione o cliente.";
  if (!values.serviceName) errors.serviceName = "Informe o serviço.";
  if (values.description.length < 3) {
    errors.description = "A descrição precisa ter pelo menos 3 caracteres.";
  }
  if (
    !values.price ||
    isNaN(Number(values.price)) ||
    Number(values.price) < 0
  ) {
    errors.price = "Informe um valor válido.";
  }

  if (Object.keys(errors).length > 0) {
    return { values, errors };
  }

  const h = await headers();

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/work-orders`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({
        customerId: values.customerId,
        serviceName: values.serviceName,
        description: values.description,
        price: Number(values.price),
        technicianId: values.technicianId || undefined,
        scheduledAt: values.scheduledAt || undefined,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return { values, message: "Não foi possível conectar ao servidor." };
  }

  if (!res.ok) {
    return {
      values,
      message: "Confira os dados informados e tente novamente.",
    };
  }

  revalidatePath("/work-orders");
  redirect("/work-orders");
}

export async function updateWorkOrderFormAction(
  id: string,
  formData: FormData,
) {
  const get = (key: string) => String(formData.get(key) ?? "").trim();

  const values = {
    serviceName: get("serviceName"),
    description: get("description"),
    price: get("price"),
    technicianId: get("technicianId"),
    scheduledAt: get("scheduledAt"),
  };

  const errors: WorkOrderState["errors"] = {};
  if (!values.serviceName) errors.serviceName = "Informe o serviço.";
  if (
    !values.price ||
    isNaN(Number(values.price)) ||
    Number(values.price) < 0
  ) {
    errors.price = "Informe um valor válido.";
  }

  if (Object.keys(errors).length > 0) {
    return { values, errors };
  }

  const h = await headers();

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/work-orders/${id}`, {
      method: "PATCH",
      headers: h,
      body: JSON.stringify({
        serviceName: values.serviceName,
        description: values.description,
        price: Number(values.price),
        technicianId: values.technicianId || undefined,
        scheduledAt: values.scheduledAt || undefined,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return { values, message: "Não foi possível conectar ao servidor." };
  }

  if (!res.ok) {
    return { values, message: "Não foi possível atualizar a ordem." };
  }

  revalidatePath("/work-orders");
  revalidatePath(`/work-orders/${id}`);
  redirect(`/work-orders/${id}`);
}

export async function cancelWorkOrderFormAction(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const h = await headers();

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/work-orders/${id}/cancel`, {
      method: "PATCH",
      headers: h,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return;
  }

  if (!res.ok) return;

  revalidatePath("/work-orders");
  redirect("/work-orders");
}

export async function startWorkOrderFormAction(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const h = await headers();

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/work-orders/${id}/start`, {
      method: "PATCH",
      headers: h,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return;
  }

  if (!res.ok) return;

  revalidatePath("/work-orders");
  revalidatePath(`/work-orders/${id}`);
  redirect(`/work-orders/${id}`);
}

export async function reScheduleWorkOrderFormAction(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const scheduledAt = String(formData.get("scheduledAt") ?? "");
  const h = await headers();

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/work-orders/${id}/schedule`, {
      method: "PATCH",
      headers: h,
      body: JSON.stringify({ scheduledAt }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return;
  }

  if (!res.ok) return;

  revalidatePath("/work-orders");
  revalidatePath(`/work-orders/${id}`);
  redirect(`/work-orders/${id}`);
}

export async function completeWorkOrderFormAction(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const h = await headers();

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/work-orders/${id}/complete`, {
      method: "PATCH",
      headers: h,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return;
  }

  if (!res.ok) return;

  revalidatePath("/work-orders");
  revalidatePath(`/work-orders/${id}`);
  redirect(`/work-orders/${id}`);
}

// ---------- Versões com useActionState (2 parâmetros) para componentes client ----------

export async function createWorkOrderAction(
  _prev: WorkOrderState | null,
  formData: FormData,
): Promise<WorkOrderState> {
  return createWorkOrderFormAction(formData) as Promise<WorkOrderState>;
}

// ---------- Dashboard ----------

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
  partial: boolean;
};

const TZ = "America/Sao_Paulo";
const PAGE_SIZE = 50;

// Helper to get date key safely (avoids new Date() at module level issues)
const getDayKey = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-CA", { timeZone: TZ });

const orderCode = (id: string) => id.slice(-4).toUpperCase();

const getScheduledTime = (scheduledAt: string | null | undefined) =>
  scheduledAt ? new Date(scheduledAt).getTime() : 0;

// Busca todas as páginas de um status (até 5 páginas), em paralelo
async function fetchAllByStatus(status: string) {
  const first = await fetchWorkOrders({ status, page: 1, limit: PAGE_SIZE });
  const lastPage = Math.min(first.meta.totalPages, 5);

  const others = await Promise.all(
    Array.from({ length: Math.max(0, lastPage - 1) }, (_, index) =>
      fetchWorkOrders({ status, page: index + 2, limit: PAGE_SIZE }),
    ),
  );

  return {
    total: first.meta.total,
    rows: [first, ...others].flatMap((page) => page.data),
    complete: first.meta.totalPages <= 5,
  };
}

// ---------- Server Action principal do dashboard ----------

export async function fetchDashboard(): Promise<DashboardData> {
  const now = new Date();
  const today = now.toLocaleDateString("en-CA", { timeZone: TZ });
  const month = today.slice(0, 7);
  const startOfToday = new Date(`${today}T00:00:00-03:00`).getTime();

  const [openRes, scheduledRes, inProgressRes, completedRes, latestRes] =
    await Promise.all([
      fetchWorkOrders({ status: "OPEN", limit: 1 }),
      fetchAllByStatus("SCHEDULED"),
      fetchAllByStatus("IN_PROGRESS"),
      fetchAllByStatus("COMPLETED"),
      fetchWorkOrders({ limit: 5 }),
    ]);

  // ---------- números ----------
  const scheduledToday = scheduledRes.rows.filter(
    (order: WorkOrder) =>
      order.scheduledAt && getDayKey(order.scheduledAt) === today,
  ).length;

  const completedThisMonthRows = completedRes.rows.filter(
    (order: WorkOrder) =>
      order.completedAt && getDayKey(order.completedAt).slice(0, 7) === month,
  );

  const revenueThisMonth = completedThisMonthRows.reduce(
    (sum: number, order: WorkOrder) => sum + Number(order.price ?? 0),
    0,
  );

  // ---------- próximos atendimentos ----------
  const upcomingSources = [...scheduledRes.rows, ...inProgressRes.rows]
    .filter(
      (order: WorkOrder) =>
        order.scheduledAt &&
        getScheduledTime(order.scheduledAt) >= startOfToday,
    )
    .sort(
      (a: WorkOrder, b: WorkOrder) =>
        getScheduledTime(a.scheduledAt!) - getScheduledTime(b.scheduledAt!),
    )
    .slice(0, 6)
    .map((order: WorkOrder) => ({
      id: order.id,
      code: orderCode(order.id),
      scheduledAt: order.scheduledAt!,
      isToday: getDayKey(order.scheduledAt!) === today,
      customerName: order.customer?.name || "",
      serviceName: order.serviceName || "",
      technicianName: order.technician?.name ?? null,
      status: order.status,
    }));

  // ---------- atividade recente ----------
  const details = await Promise.all(
    latestRes.data.map((order: WorkOrder) =>
      fetchWorkOrder(order.id).catch(() => null),
    ),
  );

  const activity: DashboardActivity[] = details
    .flatMap((order: WorkOrderDetail | null) =>
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
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return {
    open: openRes.meta.total,
    scheduledToday,
    inProgress: inProgressRes.total,
    completedThisMonth: completedThisMonthRows.length,
    revenueThisMonth,
    upcoming: upcomingSources,
    activity,
    partial:
      !scheduledRes.complete ||
      !inProgressRes.complete ||
      !completedRes.complete,
  };
}

export async function updateWorkOrderAction(
  id: string,
  _prev: WorkOrderState | null,
  formData: FormData,
): Promise<WorkOrderState> {
  return updateWorkOrderFormAction(id, formData) as Promise<WorkOrderState>;
}
