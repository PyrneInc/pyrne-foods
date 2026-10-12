import Link from "next/link";
import {
  ArrowRight,
  PackagePlus,
  ShoppingBag,
  Tags,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    label: "Add product",
    description: "Create a new product",
    href: "/store/products?action=create",
    icon: PackagePlus,
  },
  {
    label: "View orders",
    description: "Manage incoming orders",
    href: "/store/orders",
    icon: ShoppingBag,
  },
  {
    label: "Manage categories",
    description: "Organize your catalogue",
    href: "/store/categories",
    icon: Tags,
  },
];

export function DashboardActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Quick actions
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {action.label}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>

              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}