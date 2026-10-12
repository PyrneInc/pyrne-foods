import { Bike, Store } from "lucide-react";

import type { OrderType } from "@/types/store-admin";

import { Badge } from "@/components/ui/badge";

import { getOrderTypeLabel } from "./order-utils";

type OrderTypeBadgeProps = {
  type: OrderType;
};

export function OrderTypeBadge({
  type,
}: OrderTypeBadgeProps) {
  return (
    <Badge variant="outline">
      {type === "DELIVERY" ? (
        <Bike className="size-3.5" />
      ) : (
        <Store className="size-3.5" />
      )}

      {getOrderTypeLabel(type)}
    </Badge>
  );
}