import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  desc,
  eq,
  inArray,
} from "drizzle-orm";

import { db } from "@/db";

import {
  orders,
  orderItems,
  payments,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/auth/current-user";

import {
  getUserStore,
  getUserStores,
} from "@/lib/auth/store-access";

export async function GET(
  request: NextRequest,
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Not authenticated.",
        },
        { status: 401 },
      );
    }

    const storeId =
      request.nextUrl.searchParams.get(
        "storeId",
      );

    let stores;

    if (storeId) {
      const store =
        await getUserStore(
          user.id,
          storeId,
        );

      if (!store) {
        return NextResponse.json(
          {
            error:
              "You do not have access to this store.",
          },
          { status: 403 },
        );
      }

      stores = [store];
    } else {
      stores = await getUserStores(
        user.id,
      );
    }

    if (!stores.length) {
      return NextResponse.json({
        data: [],
      });
    }

    const storeIds = stores.map(
      (store) => store.id,
    );

    const storeOrders = await db
      .select({
        id: orders.id,
        orderNumber:
          orders.orderNumber,
        storeId: orders.storeId,
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
      })
      .from(orders)
      .where(
        inArray(
          orders.storeId,
          storeIds,
        ),
      )
      .orderBy(
        desc(orders.createdAt),
      );

    const orderIds = storeOrders.map(
      (order) => order.id,
    );

    if (!orderIds.length) {
      return NextResponse.json({
        data: [],
      });
    }

    const [items, paymentRows] =
      await Promise.all([
        db
          .select({
            id: orderItems.id,
            orderId:
              orderItems.orderId,
            productId:
              orderItems.productId,
            productName:
              orderItems.productName,
            quantity:
              orderItems.quantity,
            unitPrice:
              orderItems.unitPrice,
            total:
              orderItems.total,
          })
          .from(orderItems)
          .where(
            inArray(
              orderItems.orderId,
              orderIds,
            ),
          ),

        db
          .select({
            orderId:
              payments.orderId,
            method:
              payments.method,
            status:
              payments.status,
            amount:
              payments.amount,
            transactionId:
              payments.transactionId,
            paidAt:
              payments.paidAt,
          })
          .from(payments)
          .where(
            inArray(
              payments.orderId,
              orderIds,
            ),
          ),
      ]);

    const data = storeOrders.map(
      (order) => ({
        ...order,

        store:
          stores.find(
            (store) =>
              store.id ===
              order.storeId,
          ) ?? null,

        items: items.filter(
          (item) =>
            item.orderId ===
            order.id,
        ),

        payment:
          paymentRows.find(
            (payment) =>
              payment.orderId ===
              order.id,
          ) ?? null,
      }),
    );

    return NextResponse.json({
      data,
    });
  } catch (error) {
    console.error(
      "Store orders error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch store orders.",
      },
      { status: 500 },
    );
  }
}