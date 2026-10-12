"use client";

import { useEffect, useState } from "react";

import {
  AlertCircle,
  Bike,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react";

import {
  getAdminOrder,
  updateAdminOrderStatus,
} from "@/lib/store-admin-api";

import type {
  AdminOrder,
  AdminOrderStatus,
} from "@/types/store-admin";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { OrderStatusBadge } from "./order-status-badge";
import { OrderStatusSelect } from "./order-status-select";
import { OrderTypeBadge } from "./order-type-badge";
import {
  formatCurrency,
  formatDate,
  getPaymentStatusLabel,
} from "./order-utils";

type OrderDetailsDialogProps = {
  orderNumber: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdated: (
    orderNumber: string,
    status: AdminOrderStatus,
  ) => void;
};

export function OrderDetailsDialog({
  orderNumber,
  open,
  onOpenChange,
  onStatusUpdated,
}: OrderDetailsDialogProps) {
  const [order, setOrder] =
    useState<AdminOrder | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open || !orderNumber) {
      setOrder(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function loadOrder() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getAdminOrder(
            orderNumber!,
          );

        if (!cancelled) {
          setOrder(
            response.data,
          );
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load order.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [open, orderNumber]);

  async function handleStatusChange(
    status: AdminOrderStatus,
  ) {
    if (!order) return;

    try {
      const response =
        await updateAdminOrderStatus(
          order.orderNumber,
          status,
        );

      const updated =response.data;

      setOrder(updated);

      onStatusUpdated(
        order.orderNumber,
        updated.status,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update order.",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {order
              ? `Order #${order.orderNumber}`
              : "Order details"}
          </DialogTitle>

          <DialogDescription>
            Review the order and manage
            fulfillment.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex min-h-72 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading order...
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <AlertCircle className="mt-0.5 size-4 text-destructive" />

            <div>
              <p className="text-sm font-medium">
                Unable to load order
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {error}
              </p>
            </div>
          </div>
        )}

        {order && !loading && (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <OrderStatusBadge
                  status={order.status}
                />

                <OrderTypeBadge
                  type={order.orderType}
                />
              </div>

              <OrderStatusSelect
                orderNumber={
                  order.orderNumber
                }
                status={order.status}
                onUpdated={
                  handleStatusChange
                }
                onError={(error) =>
                  setError(
                    error.message,
                  )
                }
              />
            </div>

            <section>
              <SectionHeading
                icon={User}
                title="Customer"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Name"
                  value={order.customer.name}
                />

                <InfoItem
                  label="Phone"
                  value={order.customer.phone}
                  icon={Phone}
                />

                {order.customer.email && (
                  <InfoItem
                    label="Email"
                    value={
                      order.customer.email
                    }
                  />
                )}
              </div>
            </section>

            <Separator />

            <section>
              <SectionHeading
                icon={Package}
                title="Order items"
              />

              <div className="overflow-hidden rounded-lg border">
                <div className="divide-y">
                  {order.items.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {item.productName}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.quantity} ×{" "}
                            {formatCurrency(
                              item.unitPrice,
                            )}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-medium">
                          {formatCurrency(
                            item.total,
                          )}
                        </p>
                      </div>
                    ),
                  )}
                </div>

                <div className="space-y-2 border-t bg-muted/20 p-4">
                  <SummaryRow
                    label="Subtotal"
                    value={formatCurrency(
                      order.subtotal,
                    )}
                  />

                  <SummaryRow
                    label="Delivery fee"
                    value={formatCurrency(
                      order.deliveryFee,
                    )}
                  />

                  <Separator />

                  <SummaryRow
                    label="Total"
                    value={formatCurrency(
                      order.total,
                    )}
                    emphasized
                  />
                </div>
              </div>
            </section>

            {order.orderType ===
              "DELIVERY" && (
              <>
                <Separator />

                <section>
                  <SectionHeading
                    icon={MapPin}
                    title="Delivery"
                  />

                  <div className="space-y-3 rounded-lg border p-4">
                    <InfoItem
                      label="Address"
                      value={
                        order.deliveryAddress ||
                        "No address provided"
                      }
                      icon={MapPin}
                    />

                    {order.deliveryNotes && (
                      <InfoItem
                        label="Notes"
                        value={
                          order.deliveryNotes
                        }
                      />
                    )}
                  </div>
                </section>
              </>
            )}

            <Separator />

            <section>
              <SectionHeading
                icon={CreditCard}
                title="Payment"
              />

              {order.payment ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Method"
                    value={
                      order.payment.method ===
                      "MPESA"
                        ? "M-Pesa"
                        : "Cash"
                    }
                  />

                  <InfoItem
                    label="Status"
                    value={getPaymentStatusLabel(
                      order.payment.status,
                    )}
                  />

                  <InfoItem
                    label="Amount"
                    value={formatCurrency(
                      order.payment.amount,
                    )}
                  />

                  {order.payment
                    .transactionId && (
                    <InfoItem
                      label="Transaction"
                      value={
                        order.payment
                          .transactionId
                      }
                    />
                  )}
                </div>
              ) : (
                <p className="rounded-lg border p-4 text-sm text-muted-foreground">
                  No payment record is
                  available for this order.
                </p>
              )}
            </section>

            <Separator />

            <section>
              <SectionHeading
                icon={CalendarDays}
                title="Order information"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Created"
                  value={formatDate(
                    order.createdAt,
                  )}
                  icon={Clock3}
                />

                <InfoItem
                  label="Last updated"
                  value={formatDate(
                    order.updatedAt,
                  )}
                  icon={CalendarDays}
                />
              </div>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: typeof User;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" />

      <h2 className="text-sm font-semibold">
        {title}
      </h2>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof User;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">
        {label}
      </p>

      <div className="mt-1 flex items-center gap-2 text-sm">
        {Icon && (
          <Icon className="size-3.5 text-muted-foreground" />
        )}

        <span className="break-words">
          {value}
        </span>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={
        emphasized
          ? "flex items-center justify-between text-sm font-semibold"
          : "flex items-center justify-between text-sm"
      }
    >
      <span
        className={
          emphasized
            ? ""
            : "text-muted-foreground"
        }
      >
        {label}
      </span>

      <span>{value}</span>
    </div>
  );
}