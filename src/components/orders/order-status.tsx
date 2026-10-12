"use client";

import {
  Check,
  Circle,
  X,
} from "lucide-react";

import type { OrderStatus as OrderStatusType } from "@/types/order";

import {
  ORDER_STATUS_FLOW,
  getOrderStatusLabel,
} from "@/lib/order-status";

function getCurrentIndex(status: OrderStatusType) {
  return ORDER_STATUS_FLOW.indexOf(status);
}

export function OrderStatus({
  status,
}: {
  status: OrderStatusType;
}) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-[1.5rem] bg-destructive/10 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <X className="size-5" />
          </div>

          <div>
            <p className="font-semibold text-destructive">
              Order cancelled
            </p>

            <p className="mt-1 text-sm leading-5 text-destructive/75">
              This order has been cancelled.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = getCurrentIndex(status);

  return (
    <div className="rounded-[1.5rem] bg-muted/40 p-5">
      <div className="space-y-0">
        {ORDER_STATUS_FLOW.map((step, index) => {
          const completed = index < currentIndex;
          const current = index === currentIndex;
          const last = index === ORDER_STATUS_FLOW.length - 1;

          return (
            <div
              key={step}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div
                  className={[
                    "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
                    completed || current
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground",
                  ].join(" ")}
                >
                  {completed ? (
                    <Check className="size-4" />
                  ) : current ? (
                    <Circle className="size-3 fill-current" />
                  ) : (
                    <span className="text-xs font-semibold">
                      {index + 1}
                    </span>
                  )}
                </div>

                {!last && (
                  <div
                    className={[
                      "my-1 min-h-8 w-px",
                      completed
                        ? "bg-primary"
                        : "bg-border",
                    ].join(" ")}
                  />
                )}
              </div>

              <div className="pb-6 pt-1">
                <p
                  className={[
                    "text-sm font-semibold",
                    current
                      ? "text-foreground"
                      : completed
                        ? "text-foreground"
                        : "text-muted-foreground",
                  ].join(" ")}
                >
                  {getOrderStatusLabel(step)}
                </p>

                {current && (
                  <p className="mt-1 text-xs text-primary">
                    Current status
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}