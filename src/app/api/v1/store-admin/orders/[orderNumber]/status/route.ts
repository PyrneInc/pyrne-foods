import {
  NextRequest,
  NextResponse,
} from "next/server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { orders } from "@/db/schema";

import { requireActiveStore } from "@/lib/auth/store-session";
import { storeApiError } from "@/lib/auth/store-api-errors";
import { canManageOrders } from "@/lib/auth/store-permissions";
import { canTransitionOrder } from "@/lib/order-workflow";

const updateStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "COMPLETED",
    "CANCELLED",
  ]),
});

type Params = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: Params,
) {
  try {
    const { store } =
      await requireActiveStore();

    if (
      !canManageOrders(
        store.role,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to manage orders.",
        },
        { status: 403 },
      );
    }

    const { orderNumber } =
      await params;

    const [order] =
      await db
        .select()
        .from(orders)
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

    const body =
      await request.json();

    const parsed =
      updateStatusSchema.safeParse(
        body,
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Invalid order status.",
          details:
            parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const nextStatus =
      parsed.data.status;

    if (
      order.status === nextStatus
    ) {
      return NextResponse.json({
        data: order,
      });
    }

    if (
      !canTransitionOrder(
        order.status,
        nextStatus,
      )
    ) {
      return NextResponse.json(
        {
          error: `Cannot change order status from ${order.status} to ${nextStatus}.`,
        },
        { status: 409 },
      );
    }

    const [updatedOrder] =
      await db
        .update(orders)
        .set({
          status: nextStatus,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(
              orders.id,
              order.id,
            ),
            eq(
              orders.storeId,
              store.id,
            ),
          ),
        )
        .returning();

    return NextResponse.json({
      data: updatedOrder,
    });
  } catch (error) {
    return storeApiError(error);
  }
}