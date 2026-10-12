import {
  CheckCircle2,
  CircleDollarSign,
  Package,
  ShoppingBag,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type DashboardStatsProps = {
  summary: {
    orders: {
      total: number;
      pending: number;
      completed: number;
      sales: string;
    };
    products: {
      total: number;
      available: number;
    };
  };
};

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function DashboardStats({
  summary,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "Total orders",
      value: summary.orders.total,
      icon: ShoppingBag,
      description: "All orders",
    },
    {
      label: "Pending orders",
      value: summary.orders.pending,
      icon: Package,
      description: "Require attention",
    },
    {
      label: "Completed",
      value: summary.orders.completed,
      icon: CheckCircle2,
      description: "Successfully completed",
    },
    {
      label: "Sales",
      value: formatCurrency(summary.orders.sales),
      icon: CircleDollarSign,
      description: "Today's sales",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-2">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}