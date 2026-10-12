"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getOrders } from "@/lib/api";
import { OrderCard } from "@/components/orders/order-card";
import type { Order } from "@/types/order";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const orderNumbers = searchParams.get("orders")?.split(",").map((number) => number.trim()).filter(Boolean) ?? [];

  useEffect(() => {
    if (!orderNumbers.length) {
      setLoading(false);
      setError("No orders were provided.");
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      try {
        const response = await getOrders(orderNumbers);

        if (!cancelled) {
          setOrders(response.data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("We could not load your orders.");
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [orderNumbers, orderNumbers.join(",")]);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
          <p className="mt-4 text-sm text-gray-500">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✓
        </div>

        <h1 className="mt-5 text-2xl font-bold">
          Order placed successfully
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
          Thank you for ordering from Maandazi Treats.
          Your order has been sent to the relevant stores.
        </p>
      </div>

      <div className="mt-10 space-y-5">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm font-medium underline"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}