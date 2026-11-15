export const WORK_ORDER_STATUSES = [
  'OPEN',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELED',
] as const;

export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];
