import type {
  AdminOrderStatus,
  OrderType,
  PaymentStatus,
} from "@/types/store-admin";

export const ORDER_STATUSES: AdminOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
];

export function getOrderStatusLabel(
  status: AdminOrderStatus,
) {
  const labels: Record<AdminOrderStatus, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    READY: "Ready",
    OUT_FOR_DELIVERY: "Out for delivery",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  return labels[status];
}

export function getOrderTypeLabel(
  type: OrderType,
) {
  return type === "DELIVERY"
    ? "Delivery"
    : "Pickup";
}

export function getPaymentStatusLabel(
  status: PaymentStatus,
) {
  const labels: Record<PaymentStatus, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    FAILED: "Failed",
    REFUNDED: "Refunded",
  };

  return labels[status];
}

export function formatCurrency(
  value: string | number,
) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatShortDate(
  value: string,
) {
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
  }).format(new Date(value));
}