"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getOrder } from "@/lib/api";
import type { Order } from "@/types/order";
import { OrderStatus } from "@/components/orders/order-status";

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

export default function OrderTrackingPage() {
  const params = useParams<{
    orderNumber: string;
  }>();

  const orderNumber = params.orderNumber;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async () => {
    try {
      const response = await getOrder(orderNumber);

      setOrder(response.data);
      setError("");
    } catch {
      setError("Order not found.");
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    loadOrder();

    const interval = setInterval(
      loadOrder,
      15_000,
    );

    return () => {
      clearInterval(interval);
    };
  }, [loadOrder]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center text-sm text-gray-500">
          Loading order...
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold">
            Order not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            We could not find this order.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Back to shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← Continue shopping
      </Link>

      <div className="mt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {order.store.name}
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              {order.orderNumber}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>

          <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
            {order.status.replaceAll("_", " ")}
          </span>
        </div>
      </div>

      <section className="mt-8 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="font-semibold">
          Order status
        </h2>

        <div className="mt-6">
          <OrderStatus status={order.status} />
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Status updates automatically every 15 seconds.
        </p>
      </section>

      <section className="mt-5 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="font-semibold">
          Items
        </h2>

        <div className="mt-4 divide-y">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {item.productName}
                </p>

                <p className="text-xs text-gray-500">
                  {item.quantity} ×{" "}
                  {formatMoney(item.unitPrice)}
                </p>
              </div>

              <p className="font-medium">
                {formatMoney(item.total)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="font-semibold">
          Order summary
        </h2>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              {formatMoney(order.subtotal)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Delivery</span>
            <span>
              {Number(order.deliveryFee) === 0
                ? "Free"
                : formatMoney(order.deliveryFee)}
            </span>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>
                {formatMoney(order.total)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="font-semibold">
          Fulfilment
        </h2>

        <p className="mt-3 text-sm">
          {order.orderType === "DELIVERY"
            ? "Delivery"
            : "Pickup"}
        </p>

        {order.deliveryAddress && (
          <div className="mt-3">
            <p className="text-xs text-gray-500">
              Delivery address
            </p>

            <p className="mt-1 text-sm">
              {order.deliveryAddress}
            </p>
          </div>
        )}

        {order.deliveryNotes && (
          <div className="mt-3">
            <p className="text-xs text-gray-500">
              Notes
            </p>

            <p className="mt-1 text-sm">
              {order.deliveryNotes}
            </p>
          </div>
        )}
      </section>

      <section className="mt-5 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="font-semibold">
          Payment
        </h2>

        <div className="mt-3 flex justify-between text-sm">
          <span>Method</span>
          <span>
            {order.payment?.method ?? "Pending"}
          </span>
        </div>

        <div className="mt-2 flex justify-between text-sm">
          <span>Status</span>
          <span>
            {order.payment?.status ?? "PENDING"}
          </span>
        </div>
      </section>
    </main>
  );
}