import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  orders,
  stores,
  orderItems,
  payments,
} from "@/db/schema";

type Params = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: Params,
) {
  try {
    const { orderNumber } = await params;

    const [order] = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        orderType: orders.orderType,
        subtotal: orders.subtotal,
        deliveryFee: orders.deliveryFee,
        total: orders.total,
        deliveryAddress: orders.deliveryAddress,
        deliveryNotes: orders.deliveryNotes,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,

        storeId: stores.id,
        storeName: stores.name,
        storeSlug: stores.slug,
        storeLogoUrl: stores.logoUrl,
      })
      .from(orders)
      .innerJoin(stores, eq(orders.storeId, stores.id))
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        { status: 404 },
      );
    }

    const [items, payment] = await Promise.all([
      db
        .select({
          id: orderItems.id,
          productId: orderItems.productId,
          productName: orderItems.productName,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          total: orderItems.total,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id)),

      db
        .select({
          method: payments.method,
          status: payments.status,
          amount: payments.amount,
          transactionId: payments.transactionId,
          paidAt: payments.paidAt,
        })
        .from(payments)
        .where(eq(payments.orderId, order.id))
        .limit(1),
    ]);

    return NextResponse.json({
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        orderType: order.orderType,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        deliveryAddress: order.deliveryAddress,
        deliveryNotes: order.deliveryNotes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,

        store: {
          id: order.storeId,
          name: order.storeName,
          slug: order.storeSlug,
          logoUrl: order.storeLogoUrl,
        },

        items,

        payment: payment[0] ?? null,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/v1/orders/[orderNumber] error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to fetch order.",
      },
      { status: 500 },
    );
  }
}