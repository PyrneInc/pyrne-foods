import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  categories,
  products,
} from "@/db/schema";

import { requireActiveStore } from "@/lib/auth/store-session";
import { storeApiError } from "@/lib/auth/store-api-errors";
import { hasStorePermission } from "@/lib/auth/store-permissions";

const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(150),

  description: z
    .string()
    .trim()
    .max(2000)
    .nullable()
    .optional(),

  price: z
    .string()
    .trim()
    .regex(
      /^\d+(?:\.\d{1,2})?$/,
      "Price must be a valid amount.",
    ),

  imageUrl: z
    .string()
    .url()
    .nullable()
    .optional(),

  categoryId: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  isAvailable: z
    .boolean()
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export async function GET() {
  try {
    const { store } =
      await requireActiveStore();

    if (
      !hasStorePermission(
        store.role,
        "VIEW_PRODUCTS",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to view products.",
        },
        { status: 403 },
      );
    }

    const result = await db
      .select()
      .from(products)
      .where(
        eq(
          products.storeId,
          store.id,
        ),
      )
      .orderBy(
        products.sortOrder,
        products.createdAt,
      );

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    return storeApiError(error);
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const { store } =
      await requireActiveStore();

    if (
      !hasStorePermission(
        store.role,
        "MANAGE_PRODUCTS",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to manage products.",
        },
        { status: 403 },
      );
    }

    const body =
      await request.json();

    const parsed =
      createProductSchema.safeParse(
        body,
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Invalid product data.",
          details:
            parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (data.categoryId) {
      const category =
        await db
          .select({
            id: categories.id,
          })
          .from(categories)
          .where(
            and(
              eq(
                categories.id,
                data.categoryId,
              ),
              eq(
                categories.storeId,
                store.id,
              ),
            ),
          )
          .limit(1);

      if (!category.length) {
        return NextResponse.json(
          {
            error:
              "Category does not belong to this store.",
          },
          { status: 400 },
        );
      }
    }

    const [product] =
      await db
        .insert(products)
        .values({
          storeId: store.id,
          name: data.name,
          description:
            data.description ??
            null,
          price: data.price,
          imageUrl:
            data.imageUrl ?? null,
          categoryId:
            data.categoryId ?? null,
          isAvailable:
            data.isAvailable ??
            true,
          sortOrder:
            data.sortOrder ?? 0,
        })
        .returning();

    return NextResponse.json(
      {
        data: product,
      },
      { status: 201 },
    );
  } catch (error) {
    return storeApiError(error);
  }
}