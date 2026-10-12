import {
  NextRequest,
  NextResponse,
} from "next/server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";

import {
  customers,
  orders,
  orderItems,
  payments,
  products,
} from "@/db/schema";

import { requireActiveStore } from "@/lib/auth/store-session";
import { storeApiError } from "@/lib/auth/store-api-errors";
import { hasStorePermission } from "@/lib/auth/store-permissions";

type Params = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: Params,
) {
  try {
    const { store } =
      await requireActiveStore();

    if (
      !hasStorePermission(
        store.role,
        "VIEW_ORDERS",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to view orders.",
        },
        { status: 403 },
      );
    }

    const { orderNumber } =
      await params;

    const [order] =
      await db
        .select({
          id: orders.id,
          orderNumber:
            orders.orderNumber,
          status: orders.status,
          orderType:
            orders.orderType,
          subtotal:
            orders.subtotal,
          deliveryFee:
            orders.deliveryFee,
          total: orders.total,
          deliveryAddress:
            orders.deliveryAddress,
          deliveryNotes:
            orders.deliveryNotes,
          createdAt:
            orders.createdAt,
          updatedAt:
            orders.updatedAt,

          customer: {
            id: customers.id,
            name: customers.name,
            phone: customers.phone,
            email: customers.email,
          },
        })
        .from(orders)
        .innerJoin(
          customers,
          eq(
            orders.customerId,
            customers.id,
          ),
        )
        .where(
          and(
            eq(
              orders.orderNumber,
              orderNumber,
            ),
            eq(
              orders.storeId,
              store.id,
            ),
          ),
        )
        .limit(1);

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Order not found.",
        },
        { status: 404 },
      );
    }

    const items =
      await db
        .select({
          id: orderItems.id,
          productId:
            orderItems.productId,
          productName:
            orderItems.productName,
          quantity:
            orderItems.quantity,
          unitPrice:
            orderItems.unitPrice,
          total: orderItems.total,
          product: {
            id: products.id,
            name: products.name,
            imageUrl:
              products.imageUrl,
          },
        })
        .from(orderItems)
        .innerJoin(
          products,
          eq(
            orderItems.productId,
            products.id,
          ),
        )
        .where(
          eq(
            orderItems.orderId,
            order.id,
          ),
        );

    const [payment] =
      await db
        .select()
        .from(payments)
        .where(
          and(
            eq(
              payments.orderId,
              order.id,
            ),
            eq(
              payments.storeId,
              store.id,
            ),
          ),
        )
        .limit(1);

    return NextResponse.json({
      data: {
        ...order,
        items,
        payment:
          payment ?? null,
      },
    });
  } catch (error) {
    return storeApiError(error);
  }
}