import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  customers,
  orders,
  orderItems,
  payments,
} from "@/db/schema";

import { requireActiveStore } from "@/lib/auth/store-session";
import { storeApiError } from "@/lib/auth/store-api-errors";
import { hasStorePermission } from "@/lib/auth/store-permissions";

export async function GET(
  request: NextRequest,
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

    const { searchParams } =
      new URL(request.url);

    const status =
      searchParams.get("status");

    const limitValue =
      Number(
        searchParams.get("limit") ??
          "50",
      );

    const offsetValue =
      Number(
        searchParams.get("offset") ??
          "0",
      );

    const limit = Math.min(
      Math.max(
        Number.isFinite(
          limitValue,
        )
          ? limitValue
          : 50,
        1,
      ),
      100,
    );

    const offset = Math.max(
      Number.isFinite(
        offsetValue,
      )
        ? offsetValue
        : 0,
      0,
    );

    const conditions = [
      eq(
        orders.storeId,
        store.id,
      ),
    ];

    if (status) {
      conditions.push(
        eq(
          orders.status,
          status as
            | "PENDING"
            | "CONFIRMED"
            | "PREPARING"
            | "READY"
            | "OUT_FOR_DELIVERY"
            | "COMPLETED"
            | "CANCELLED",
        ),
      );
    }

    const result =
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
          and(...conditions),
        )
        .orderBy(
          desc(
            orders.createdAt,
          ),
        )
        .limit(limit)
        .offset(offset);

    return NextResponse.json({
      data: result,
      meta: {
        limit,
        offset,
        count: result.length,
      },
    });
  } catch (error) {
    return storeApiError(error);
  }
}