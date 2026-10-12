"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "@/lib/store-admin-api";

import type {
  AdminOrderListItem,
  AdminOrderStatus,
} from "@/types/store-admin";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { OrdersStats } from "./order-stats";
import { OrdersTable } from "./orders-table";
import { OrderDetailsDialog } from "./order-details-dialog";


const PAGE_SIZE = 25;

export function OrdersPage() {
  const [orders, setOrders] = useState<
    AdminOrderListItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<AdminOrderStatus | "ALL">(
      "ALL",
    );

  const [selectedOrderNumber, setSelectedOrderNumber] =
    useState<string | null>(null);

  const [page, setPage] =
    useState(0);

  const loadOrders = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response =
          await getAdminOrders({
            status:
              statusFilter === "ALL"
                ? undefined
                : statusFilter,
            limit: PAGE_SIZE,
            offset:
              page * PAGE_SIZE,
          });

        setOrders(
          response.data,
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load orders.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, statusFilter],
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter((order) => {
      return (
        order.orderNumber
          .toLowerCase()
          .includes(query) ||
        order.customer.name
          .toLowerCase()
          .includes(query) ||
        order.customer.phone
          .toLowerCase()
          .includes(query)
      );
    });
  }, [orders, search]);

  const statistics = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter(
        (order) =>
          order.status === "PENDING",
      ).length,

      preparing: orders.filter(
        (order) =>
          order.status === "PREPARING",
      ).length,

      completed: orders.filter(
        (order) =>
          order.status === "COMPLETED",
      ).length,

      sales: orders
        .filter(
          (order) =>
            order.status !==
            "CANCELLED",
        )
        .reduce(
          (sum, order) =>
            sum + Number(order.total),
          0,
        ),
    };
  }, [orders]);

  function handleStatusUpdated(
    orderNumber: string,
    status: AdminOrderStatus,
  ) {
    setOrders((current) =>
      current.map((order) =>
        order.orderNumber ===
          orderNumber
          ? {
            ...order,
            status,
            updatedAt:
              new Date().toISOString(),
          }
          : order,
      ),
    );
  }

  async function handleQuickStatusUpdate(
    orderNumber: string,
    status: AdminOrderStatus,
  ) {
    try {
      const updatedOrder = (await updateAdminOrderStatus(
        orderNumber,
        status,
      )).data;

      handleStatusUpdated(
        orderNumber,
        updatedOrder.status,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update order.",
      );
    }
  }

  if (loading) {
    return <OrdersPageSkeleton />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Orders
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage customer orders and
            fulfillment.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={refreshing}
          onClick={() =>
            loadOrders(true)
          }
        >
          <RefreshCw
            className={
              refreshing
                ? "size-4 animate-spin"
                : "size-4"
            }
          />

          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              Unable to complete request
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {error}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              loadOrders(true)
            }
          >
            Retry
          </Button>
        </div>
      )}

      <OrdersStats
        total={statistics.total}
        pending={statistics.pending}
        preparing={statistics.preparing}
        completed={statistics.completed}
        sales={statistics.sales}
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search order or customer..."
            className="pl-9"
          />
        </div>

        <OrderFilters
          value={statusFilter}
          onChange={(value) =>
            setStatusFilter(value)
          }
        />
      </div>

      <OrdersTable
        orders={filteredOrders}
        onView={(order) =>
          setSelectedOrderNumber(
            order.orderNumber,
          )
        }
        onStatusChange={
          handleQuickStatusUpdate
        }
      />

      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          {filteredOrders.length}{" "}
          orders
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() =>
              setPage(
                (current) =>
                  current - 1,
              )
            }
          >
            Previous
          </Button>

          <span className="px-2 text-sm text-muted-foreground">
            Page {page + 1}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={
              orders.length <
              PAGE_SIZE
            }
            onClick={() =>
              setPage(
                (current) =>
                  current + 1,
              )
            }
          >
            Next
          </Button>
        </div>
      </div>

      <OrderDetailsDialog
        orderNumber={
          selectedOrderNumber
        }
        open={
          selectedOrderNumber !== null
        }
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrderNumber(
              null,
            );
          }
        }}
        onStatusUpdated={(
          orderNumber,
          status,
        ) =>
          handleStatusUpdated(
            orderNumber,
            status,
          )
        }
      />
    </div>
  );
}

function OrderFilters({
  value,
  onChange,
}: {
  value: AdminOrderStatus | "ALL";
  onChange: (
    value: AdminOrderStatus | "ALL",
  ) => void;
}) {
  const filters: Array<{
    value: AdminOrderStatus | "ALL";
    label: string;
  }> = [
      { value: "ALL", label: "All orders" },
      { value: "PENDING", label: "Pending" },
      { value: "CONFIRMED", label: "Confirmed" },
      { value: "PREPARING", label: "Preparing" },
      { value: "READY", label: "Ready" },
      {
        value: "OUT_FOR_DELIVERY",
        label: "Out for delivery",
      },
      {
        value: "COMPLETED",
        label: "Completed",
      },
      {
        value: "CANCELLED",
        label: "Cancelled",
      },
    ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={
            value === filter.value
              ? "default"
              : "outline"
          }
          size="sm"
          className="shrink-0"
          onClick={() =>
            onChange(filter.value)
          }
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

function OrdersPageSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Skeleton className="h-9 w-24" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-24 rounded-lg"
          />
        ))}
      </div>

      <Skeleton className="h-10 w-full md:max-w-sm" />

      <Skeleton className="h-80 rounded-lg" />
    </div>
  );
}