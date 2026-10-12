"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import type { AdminOrderStatus } from "@/types/store-admin";

import { updateAdminOrderStatus } from "@/lib/store-admin-api";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getOrderStatusLabel,
  ORDER_STATUSES,
} from "./order-utils";
import { OrderStatus } from "@/types/order";

type OrderStatusSelectProps = {
  orderNumber: string;
  status: AdminOrderStatus;
  disabled?: boolean;
  onUpdated: (
    status: AdminOrderStatus,
  ) => void;
  onError: (error: Error) => void;
};

export function OrderStatusSelect({
  orderNumber,
  status,
  disabled,
  onUpdated,
  onError,
}: OrderStatusSelectProps) {
  const [saving, setSaving] = useState(false);

  async function handleChange(
    value: string,
  ) {
    const nextStatus =
      value as AdminOrderStatus;

    if (
      nextStatus === status ||
      saving
    ) {
      return;
    }

    try {
      setSaving(true);

      const response =
        await updateAdminOrderStatus(
          orderNumber,
          nextStatus,
        );

      onUpdated(response.data.status);
    } catch (error) {
      onError(
        error instanceof Error
          ? error
          : new Error(
              "Failed to update order status.",
            ),
      );
    } finally {
      setSaving(false);
    }
  }

  if (saving) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Updating...
      </div>
    );
  }

  return (
    <Select
      value={status}
      onValueChange={(value: unknown) => handleChange(value as OrderStatus)}
      disabled={disabled}
    >
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {ORDER_STATUSES.map(
          (orderStatus) => (
            <SelectItem
              key={orderStatus}
              value={orderStatus}
            >
              {getOrderStatusLabel(
                orderStatus,
              )}
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  );
}