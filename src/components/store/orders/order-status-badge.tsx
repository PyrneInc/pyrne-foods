import type { AdminOrderStatus } from "@/types/store-admin";

import { Badge } from "@/components/ui/badge";

import { getOrderStatusLabel } from "./order-utils";

type OrderStatusBadgeProps = {
  status: AdminOrderStatus;
};

export function OrderStatusBadge({
  status,
}: OrderStatusBadgeProps) {
  const variants: Record<
    AdminOrderStatus,
    "default" | "secondary" | "outline" | "destructive"
  > = {
    PENDING: "secondary",
    CONFIRMED: "outline",
    PREPARING: "outline",
    READY: "default",
    OUT_FOR_DELIVERY: "outline",
    COMPLETED: "default",
    CANCELLED: "destructive",
  };

  return (
    <Badge variant={variants[status]}>
      {getOrderStatusLabel(status)}
    </Badge>
  );
}