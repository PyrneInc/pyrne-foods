"use client";

import {
  Eye,
  MoreHorizontal,
} from "lucide-react";

import type {
  AdminOrderListItem,
  AdminOrderStatus,
} from "@/types/store-admin";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { OrderStatusBadge } from "./order-status-badge";
import { OrderStatusSelect } from "./order-status-select";
import { OrderTypeBadge } from "./order-type-badge";
import {
  formatCurrency,
  formatDate,
} from "./order-utils";

type OrdersTableProps = {
  orders: AdminOrderListItem[];
  onView: (
    order: AdminOrderListItem,
  ) => void;
  onStatusChange: (
    orderNumber: string,
    status: AdminOrderStatus,
  ) => Promise<void>;
};

export function OrdersTable({
  orders,
  onView,
  onStatusChange,
}: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border bg-background px-6 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Eye className="size-5 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-sm font-medium">
          No orders found
        </h3>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Orders matching your current
          filters will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border bg-background lg:block">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Order
              </th>

              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Customer
              </th>

              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Type
              </th>

              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Total
              </th>

              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>

              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Date
              </th>

              <th className="w-20 px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y">
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onView={onView}
                onStatusChange={
                  onStatusChange
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onView={onView}
            onStatusChange={
              onStatusChange
            }
          />
        ))}
      </div>
    </>
  );
}

function OrderRow({
  order,
  onView,
  onStatusChange,
}: {
  order: AdminOrderListItem;
  onView: (
    order: AdminOrderListItem,
  ) => void;
  onStatusChange: (
    orderNumber: string,
    status: AdminOrderStatus,
  ) => Promise<void>;
}) {
  return (
    <tr className="transition-colors hover:bg-muted/20">
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => onView(order)}
          className="font-medium hover:underline"
        >
          #{order.orderNumber}
        </button>
      </td>

      <td className="px-4 py-3">
        <div>
          <p className="font-medium">
            {order.customer.name}
          </p>

          <p className="text-xs text-muted-foreground">
            {order.customer.phone}
          </p>
        </div>
      </td>

      <td className="px-4 py-3">
        <OrderTypeBadge
          type={order.orderType}
        />
      </td>

      <td className="px-4 py-3 font-medium">
        {formatCurrency(order.total)}
      </td>

      <td className="px-4 py-3">
        <OrderStatusSelect
          orderNumber={
            order.orderNumber
          }
          status={order.status}
          onUpdated={(status) =>
            onStatusChange(
              order.orderNumber,
              status,
            )
          }
          onError={() => {}}
        />
      </td>

      <td className="px-4 py-3 text-muted-foreground">
        {formatDate(order.createdAt)}
      </td>

      <td className="px-4 py-3 text-right">
        <OrderActions
          order={order}
          onView={onView}
        />
      </td>
    </tr>
  );
}

function OrderCard({
  order,
  onView,
  onStatusChange,
}: {
  order: AdminOrderListItem;
  onView: (
    order: AdminOrderListItem,
  ) => void;
  onStatusChange: (
    orderNumber: string,
    status: AdminOrderStatus,
  ) => Promise<void>;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => onView(order)}
            className="font-semibold hover:underline"
          >
            #{order.orderNumber}
          </button>

          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>

        <OrderActions
          order={order}
          onView={onView}
        />
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-sm font-medium">
            {order.customer.name}
          </p>

          <p className="text-xs text-muted-foreground">
            {order.customer.phone}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <OrderTypeBadge
            type={order.orderType}
          />

          <OrderStatusBadge
            status={order.status}
          />
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm text-muted-foreground">
            Total
          </span>

          <span className="font-semibold">
            {formatCurrency(order.total)}
          </span>
        </div>

        <OrderStatusSelect
          orderNumber={
            order.orderNumber
          }
          status={order.status}
          onUpdated={(status) =>
            onStatusChange(
              order.orderNumber,
              status,
            )
          }
          onError={() => {}}
        />
      </div>
    </div>
  );
}

function OrderActions({
  order,
  onView,
}: {
  order: AdminOrderListItem;
  onView: (
    order: AdminOrderListItem,
  ) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for order ${order.orderNumber}`}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onView(order)}
        >
          <Eye className="size-4" />
          View order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}