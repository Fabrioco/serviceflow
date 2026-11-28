import { api } from '../../lib/api';

export type OrderStatus = 'OPEN' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

export type Order = {
  id: string;
  serviceName: string;
  description?: string;
  price?: string | number;
  status: OrderStatus;
  scheduledAt: string | null;
  createdAt: string;
  customer?: { name: string } | null;
};

export async function listOrders(status?: OrderStatus): Promise<Order[]> {
  const qs = status ? `?status=${status}` : '';
  const res = await api<Order[] | { data: Order[] }>(`/work-orders${qs}`);
  return Array.isArray(res) ? res : res.data;
}

export const orderCode = (id: string) => `OS ${id.slice(0, 6).toUpperCase()}`;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function formatWhen(iso?: string | null) {
  if (!iso) return 'Sem data';
  const d = new Date(iso);
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const diff = Math.round((startOfDay(d) - startOfDay(new Date())) / 86_400_000);
  if (diff === 0) return `hoje, ${time}`;
  if (diff === 1) return `amanhã, ${time}`;
  if (diff === -1) return `ontem, ${time}`;
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${time}`;
}

export type OrderEvent = {
  id: string;
  message: string;
  actorName?: string | null;
  createdAt: string;
};
export type OrderDetail = Order & { events?: OrderEvent[] };

export const getOrder = (id: string) => api<OrderDetail>(`/work-orders/${id}`);

// AJUSTE AQUI se o endpoint de mudança de status da sua API for outro
export const changeStatus = (id: string, status: OrderStatus) =>
  api<OrderDetail>(`/work-orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const startOrder = (id: string) =>
  api<OrderDetail>(`/work-orders/${id}/start`, { method: 'PATCH' });

export const completeOrder = (id: string) =>
  api<OrderDetail>(`/work-orders/${id}/complete`, { method: 'PATCH' });

export function formatPrice(price?: string | number) {
  if (price === undefined || price === null) return '';
  return Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const pad = (n: number) => String(n).padStart(2, '0');

// scheduledAt é guardado como "hora do relógio" em UTC: 07:00 no banco = 07:00 na tela
export function formatScheduled(iso?: string | null) {
  if (!iso) return 'Sem data';
  const d = new Date(iso);
  const time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  const day = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((day - today) / 86_400_000);
  if (diff === 0) return `hoje, ${time}`;
  if (diff === 1) return `amanhã, ${time}`;
  if (diff === -1) return `ontem, ${time}`;
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}, ${time}`;
}
