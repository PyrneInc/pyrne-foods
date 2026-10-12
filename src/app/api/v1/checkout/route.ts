import {
  and,
  eq,
  inArray,
} from "drizzle-orm";

import { NextResponse } from "next/server";

import { db } from "@/db";

import {
  customers,
  orderItems,
  orders,
  payments,
  products,
  stores,
} from "@/db/schema";

import {
  fromCents,
  toCents,
} from "@/lib/money";

import {
  generateOrderNumber,
  getDeliveryFee,
} from "@/lib/orders";

import {
  checkoutSchema,
} from "@/lib/validations/checkout";

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request.json();

    const parsed =
      checkoutSchema.safeParse(
        body,
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid checkout data.",
          errors:
            parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const productIds =
      data.items.map(
        (item) =>
          item.productId,
      );

    // ----------------------------------------
    // Fetch products
    // ----------------------------------------

    const availableProducts =
      await db.query.products.findMany({
        where: and(
          inArray(
            products.id,
            productIds,
          ),
          eq(
            products.isAvailable,
            true,
          ),
        ),

        with: {
          store: true,
        },
      });

    // ----------------------------------------
    // Make sure every product exists
    // ----------------------------------------

    if (
      availableProducts.length !==
      productIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more products are unavailable.",
        },
        { status: 400 },
      );
    }

    // ----------------------------------------
    // Make sure every store is active
    // ----------------------------------------

    const inactiveStore =
      availableProducts.find(
        (product) =>
          !product.store.isActive,
      );

    if (inactiveStore) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more products belong to an inactive store.",
        },
        { status: 400 },
      );
    }

    // ----------------------------------------
    // Group products by store
    // ----------------------------------------

    const productsById =
      new Map(
        availableProducts.map(
          (product) => [
            product.id,
            product,
          ],
        ),
      );

    const grouped = new Map<
      string,
      {
        store: typeof stores.$inferSelect;
        items: typeof data.items;
      }
    >();

    for (const item of data.items) {
      const product =
        productsById.get(
          item.productId,
        );

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Product not found.",
          },
          { status: 400 },
        );
      }

      const existing =
        grouped.get(
          product.storeId,
        );

      if (existing) {
        existing.items.push(
          item,
        );
      } else {
        grouped.set(
          product.storeId,
          {
            store: product.store,
            items: [item],
          },
        );
      }
    }

    // ----------------------------------------
    // Create one order per store
    // ----------------------------------------

    const createdOrders =
      await db.transaction(
        async (tx) => {
          const result = [];

          for (const [
            storeId,
            group,
          ] of grouped) {
            let subtotalCents = 0;

            const preparedItems =
              group.items.map(
                (item) => {
                  const product =
                    productsById.get(
                      item.productId,
                    )!;

                  const unitPriceCents =
                    toCents(
                      product.price,
                    );

                  const totalCents =
                    unitPriceCents *
                    item.quantity;

                  subtotalCents +=
                    totalCents;

                  return {
                    productId:
                      product.id,

                    productName:
                      product.name,

                    quantity:
                      item.quantity,

                    unitPrice:
                      fromCents(
                        unitPriceCents,
                      ),

                    total:
                      fromCents(
                        totalCents,
                      ),
                  };
                },
              );

            const deliveryFeeCents =
              getDeliveryFee(
                data.orderType,
              );

            const totalCents =
              subtotalCents +
              deliveryFeeCents;

            // --------------------------------
            // Customer belongs to this store
            // --------------------------------

            const [
              customer,
            ] = await tx
              .insert(customers)
              .values({
                storeId,

                name:
                  data.customer.name,

                phone:
                  data.customer.phone,

                email:
                  data.customer
                    .email || null,
              })
              .onConflictDoUpdate({
                target: [
                  customers.storeId,
                  customers.phone,
                ],

                set: {
                  name:
                    data.customer.name,

                  email:
                    data.customer
                      .email || null,

                  updatedAt:
                    new Date(),
                },
              })
              .returning();

            // --------------------------------
            // Order
            // --------------------------------

            const [
              order,
            ] = await tx
              .insert(orders)
              .values({
                storeId,

                customerId:
                  customer.id,

                orderNumber:
                  generateOrderNumber(),

                status: "PENDING",

                orderType:
                  data.orderType,

                subtotal:
                  fromCents(
                    subtotalCents,
                  ),

                deliveryFee:
                  fromCents(
                    deliveryFeeCents,
                  ),

                total:
                  fromCents(
                    totalCents,
                  ),

                deliveryAddress:
                  data.deliveryAddress ||
                  null,

                deliveryNotes:
                  data.deliveryNotes ||
                  null,
              })
              .returning();

            // --------------------------------
            // Items
            // --------------------------------

            await tx
              .insert(orderItems)
              .values(
                preparedItems.map(
                  (item) => ({
                    orderId:
                      order.id,

                    productId:
                      item.productId,

                    productName:
                      item.productName,

                    quantity:
                      item.quantity,

                    unitPrice:
                      item.unitPrice,

                    total:
                      item.total,
                  }),
                ),
              );

            // --------------------------------
            // Pending payment
            // --------------------------------

            await tx
              .insert(payments)
              .values({
                storeId,

                orderId:
                  order.id,

                method: "CASH",

                status: "PENDING",

                amount:
                  fromCents(
                    totalCents,
                  ),
              });

            result.push({
              id: order.id,

              orderNumber:
                order.orderNumber,

              store: {
                id: group.store.id,

                name:
                  group.store.name,

                slug:
                  group.store.slug,
              },

              status:
                order.status,

              orderType:
                order.orderType,

              subtotal:
                order.subtotal,

              deliveryFee:
                order.deliveryFee,

              total:
                order.total,

              createdAt:
                order.createdAt,
            });
          }

          return result;
        },
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Checkout completed successfully.",

        data: {
          orders: createdOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          storeId: order.storeId,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          total: order.total,
        })),

          orderCount:
            createdOrders.length,

          total:
            fromCents(
              createdOrders.reduce(
                (sum, order) =>
                  sum +
                  toCents(
                    order.total,
                  ),
                0,
              ),
            ),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /checkout error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to complete checkout.",
      },
      { status: 500 },
    );
  }
}