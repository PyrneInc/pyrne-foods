import {
  and,
  eq,
} from "drizzle-orm";

import { NextResponse } from "next/server";

import { db } from "@/db";

import {
  customers,
  orderItems,
  orders,
  stores,
} from "@/db/schema";

type Context = {
  params: Promise<{
    slug: string;
    orderNumber: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Context,
) {
  try {
    const {
      slug,
      orderNumber,
    } = await params;

    const store =
      await db.query.stores.findFirst({
        where: eq(
          stores.slug,
          slug,
        ),
      });

    if (!store || !store.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Store not found.",
        },
        {
          status: 404,
        },
      );
    }

    const order =
      await db.query.orders.findFirst({
        where: and(
          eq(
            orders.storeId,
            store.id,
          ),
          eq(
            orders.orderNumber,
            orderNumber,
          ),
        ),

        with: {
          customer: true,
          items: true,
          payment: true,
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,

      data: {
        id: order.id,

        orderNumber:
          order.orderNumber,

        status:
          order.status,

        orderType:
          order.orderType,

        customer: {
          name:
            order.customer.name,

          phone:
            order.customer.phone,
        },

        items: order.items,

        subtotal:
          order.subtotal,

        deliveryFee:
          order.deliveryFee,

        total:
          order.total,

        deliveryAddress:
          order.deliveryAddress,

        deliveryNotes:
          order.deliveryNotes,

        payment:
          order.payment,

        createdAt:
          order.createdAt,

        updatedAt:
          order.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "GET /orders error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to retrieve order.",
      },
      {
        status: 500,
      },
    );
  }
}
