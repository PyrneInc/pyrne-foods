import {
  NextResponse,
} from "next/server";

import {
  and,
  count,
  eq,
  gte,
  inArray,
  sql,
} from "drizzle-orm";

import { db } from "@/db";

import {
  orders,
  products,
} from "@/db/schema";

import { requireActiveStore } from "@/lib/auth/store-session";
import { storeApiError } from "@/lib/auth/store-api-errors";
import { hasStorePermission } from "@/lib/auth/store-permissions";

export async function GET() {
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
            "You do not have permission to view store summary.",
        },
        { status: 403 },
      );
    }

    const startOfDay =
      new Date();

    startOfDay.setHours(
      0,
      0,
      0,
      0,
    );

    const [
      orderSummary,
      productSummary,
    ] = await Promise.all([
      db
        .select({
          totalOrders:
            count(orders.id),

          totalSales:
            sql<string>`
              COALESCE(
                SUM(
                  CASE
                    WHEN ${orders.status} != 'CANCELLED'
                    THEN ${orders.total}
                    ELSE 0
                  END
                ),
                0
              )
            `.as("totalSales"),

          completedOrders:
            sql<number>`
              COUNT(
                CASE
                  WHEN ${orders.status} = 'COMPLETED'
                  THEN 1
                END
              )
            `.as("completedOrders"),

          pendingOrders:
            sql<number>`
              COUNT(
                CASE
                  WHEN ${orders.status} IN (
                    'PENDING',
                    'CONFIRMED',
                    'PREPARING'
                  )
                  THEN 1
                END
              )
            `.as("pendingOrders"),
        })
        .from(orders)
        .where(
          and(
            eq(
              orders.storeId,
              store.id,
            ),
            gte(
              orders.createdAt,
              startOfDay,
            ),
          ),
        ),

      db
        .select({
          totalProducts:
            count(products.id),

          availableProducts:
            sql<number>`
              COUNT(
                CASE
                  WHEN ${products.isAvailable} = true
                  THEN 1
                END
              )
            `.as(
              "availableProducts",
            ),
        })
        .from(products)
        .where(
          eq(
            products.storeId,
            store.id,
          ),
        ),
    ]);

    return NextResponse.json({
      data: {
        store: {
          id: store.id,
          name: store.name,
          slug: store.slug,
          role: store.role,
        },

        orders: {
          total:
            Number(
              orderSummary[0]
                ?.totalOrders ?? 0,
            ),

          pending:
            Number(
              orderSummary[0]
                ?.pendingOrders ?? 0,
            ),

          completed:
            Number(
              orderSummary[0]
                ?.completedOrders ?? 0,
            ),

          sales:
            orderSummary[0]
              ?.totalSales ?? "0",
        },

        products: {
          total:
            Number(
              productSummary[0]
                ?.totalProducts ?? 0,
            ),

          available:
            Number(
              productSummary[0]
                ?.availableProducts ??
                0,
            ),
        },
      },
    });
  } catch (error) {
    return storeApiError(error);
  }
}