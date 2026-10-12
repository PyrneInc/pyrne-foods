import type { OrderStatus } from "@/types/order";

const nextStatuses: Record<
  OrderStatus,
  OrderStatus[]
> = {
  PENDING: [
    "CONFIRMED",
    "CANCELLED",
  ],

  CONFIRMED: [
    "PREPARING",
    "CANCELLED",
  ],

  PREPARING: [
    "READY",
    "CANCELLED",
  ],

  READY: [
    "OUT_FOR_DELIVERY",
    "COMPLETED",
  ],

  OUT_FOR_DELIVERY: [
    "COMPLETED",
  ],

  COMPLETED: [],

  CANCELLED: [],
};

export function canTransitionOrder(
  current: OrderStatus,
  next: OrderStatus,
) {
  return nextStatuses[
    current
  ].includes(next);
}

export function getNextStatuses(
  status: OrderStatus,
) {
  return nextStatuses[status];
}