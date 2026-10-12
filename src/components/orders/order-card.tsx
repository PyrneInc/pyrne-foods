import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Store,
} from "lucide-react";

import type { Order } from "@/types/order";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function formatMoney(value: string) {
  return `KSh ${Number(value).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export function OrderCard({ order }: { order: Order }) {
  return (
    <article className="overflow-hidden rounded-[2rem] bg-muted/40">
      <div className="p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Store className="size-4" />
              <span className="truncate">{order.store.name}</span>
            </div>

            <h2 className="mt-2 font-bold tracking-tight">
              {order.orderNumber}
            </h2>

            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="w-fit rounded-full bg-background px-3 py-1 text-xs font-medium capitalize"
          >
            {getStatusLabel(order.status)}
          </Badge>
        </div>

        <div className="mt-6 space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {item.productName}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.quantity} ×{" "}
                  {formatMoney(
                    String(
                      Number(item.total) / item.quantity,
                    ),
                  )}
                </p>
              </div>

              <span className="shrink-0 font-semibold">
                {formatMoney(item.total)}
              </span>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Subtotal
            </span>
            <span>{formatMoney(order.subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Delivery
            </span>
            <span>
              {Number(order.deliveryFee) === 0
                ? "Free"
                : formatMoney(order.deliveryFee)}
            </span>
          </div>

          <div className="flex items-end justify-between pt-1">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold tracking-tight">
              {formatMoney(order.total)}
            </span>
          </div>
        </div>

        <Button
          className="mt-6 h-11 w-full rounded-full"
          render={
            <Link href={`/orders/${order.orderNumber}`} />
          }
        >
          Track order
          <ArrowRight />
        </Button>
      </div>
    </article>
  );
}