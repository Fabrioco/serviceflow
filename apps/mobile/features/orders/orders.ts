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
