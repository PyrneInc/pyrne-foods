import {
  CheckCircle2,
  Clock3,
  CookingPot,
  ShoppingBag,
} from "lucide-react";

import { formatCurrency } from "./order-utils";

type OrdersStatsProps = {
  total: number;
  pending: number;
  preparing: number;
  completed: number;
  sales: number;
};

export function OrdersStats({
  total,
  pending,
  preparing,
  completed,
  sales,
}: OrdersStatsProps) {
  const stats = [
    {
      label: "Orders",
      value: total.toLocaleString(),
      icon: ShoppingBag,
    },
    {
      label: "Pending",
      value: pending.toLocaleString(),
      icon: Clock3,
    },
    {
      label: "Preparing",
      value: preparing.toLocaleString(),
      icon: CookingPot,
    },
    {
      label: "Completed",
      value: completed.toLocaleString(),
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-lg border bg-background p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>

              <Icon className="size-4 text-muted-foreground" />
            </div>

            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}