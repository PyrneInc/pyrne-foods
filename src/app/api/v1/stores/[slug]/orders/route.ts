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
  products,
} from "@/db/schema";

import {
  createOrderSchema,
} from "@/lib/validations/order";

import {
  generateOrderNumber,
  getDeliveryFee,
} from "@/lib/orders";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: Context,
) {
  try {
    const { slug } = await params;

    const body = await request.json();

    const parsed =
      createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order data.",
          errors:
            parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const data = parsed.data;

    const store =
      await db.query.stores.findFirst({
        where: (stores, { eq }) =>
          eq(stores.slug, slug),
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

    const productIds =
      data.items.map(
        (item) => item.productId,
      );

    const storeProducts =
      await db.query.products.findMany({
        where: and(
          eq(products.storeId, store.id),
          eq(products.isAvailable, true),
          inArray(
            products.id,
            productIds,
          ),
        ),
      });

    if (
      storeProducts.length !==
      productIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more products are unavailable.",
        },
        {
          status: 400,
        },
      );
    }

    const productMap = new Map(
      storeProducts.map((product) => [
        product.id,
        product,
      ]),
    );

    let subtotal = 0;

    const preparedItems =
      data.items.map((item) => {
        const product =
          productMap.get(
            item.productId,
          );

        if (!product) {
          throw new Error(
            "Product not found.",
          );
        }

        const unitPrice =
          Number(product.price);

        const total =
          unitPrice * item.quantity;

        subtotal += total;

        return {
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          total: total.toFixed(2),
        };
      });

    const deliveryFee =
      Number(
        getDeliveryFee(
          data.orderType,
        ),
      );

    const total =
      subtotal + deliveryFee;

    const orderNumber =
      generateOrderNumber();

    const result =
      await db.transaction(
        async (tx) => {
          const existingCustomer =
            await tx.query.customers.findFirst(
              {
                where: and(
                  eq(
                    customers.storeId,
                    store.id,
                  ),
                  eq(
                    customers.phone,
                    data.customer.phone,
                  ),
                ),
              },
            );

          let customerId =
            existingCustomer?.id;

          if (existingCustomer) {
            await tx
              .update(customers)
              .set({
                name:
                  data.customer.name,

                email:
                  data.customer.email ||
                  null,

                updatedAt:
                  new Date(),
              })
              .where(
                eq(
                  customers.id,
                  existingCustomer.id,
                ),
              );
          } else {
            const [
              customer,
            ] = await tx
              .insert(customers)
              .values({
                storeId:
                  store.id,

                name:
                  data.customer.name,

                phone:
                  data.customer.phone,

                email:
                  data.customer.email ||
                  null,
              })
              .returning({
                id: customers.id,
              });

            customerId =
              customer.id;
          }

          const [
            order,
          ] = await tx
            .insert(orders)
            .values({
              storeId:
                store.id,

              customerId:
                customerId!,

              orderNumber,

              status: "PENDING",

              orderType:
                data.orderType,

              subtotal:
                subtotal.toFixed(2),

              deliveryFee:
                deliveryFee.toFixed(2),

              total:
                total.toFixed(2),

              deliveryAddress:
                data.deliveryAddress ||
                null,

              deliveryNotes:
                data.deliveryNotes ||
                null,
            })
            .returning();

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

          return order;
        },
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Order created successfully.",

        data: {
          id: result.id,

          orderNumber:
            result.orderNumber,

          status:
            result.status,

          orderType:
            result.orderType,

          subtotal:
            result.subtotal,

          deliveryFee:
            result.deliveryFee,

          total:
            result.total,

          createdAt:
            result.createdAt,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /orders error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create order.",
      },
      {
        status: 500,
      },
    );
  }
}
