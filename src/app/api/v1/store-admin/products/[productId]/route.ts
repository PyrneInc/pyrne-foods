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

const updateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(150)
    .optional(),

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
    )
    .optional(),

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

type Params = {
  params: Promise<{
    productId: string;
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

    const { productId } =
      await params;

    const [product] =
      await db
        .select()
        .from(products)
        .where(
          and(
            eq(
              products.id,
              productId,
            ),
            eq(
              products.storeId,
              store.id,
            ),
          ),
        )
        .limit(1);

    if (!product) {
      return NextResponse.json(
        {
          error:
            "Product not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: product,
    });
  } catch (error) {
    return storeApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Params,
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

    const { productId } =
      await params;

    const [existingProduct] =
      await db
        .select()
        .from(products)
        .where(
          and(
            eq(
              products.id,
              productId,
            ),
            eq(
              products.storeId,
              store.id,
            ),
          ),
        )
        .limit(1);

    if (!existingProduct) {
      return NextResponse.json(
        {
          error:
            "Product not found.",
        },
        { status: 404 },
      );
    }

    const body =
      await request.json();

    const parsed =
      updateProductSchema.safeParse(
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
      const [category] =
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

      if (!category) {
        return NextResponse.json(
          {
            error:
              "Category does not belong to this store.",
          },
          { status: 400 },
        );
      }
    }

    const [updatedProduct] =
      await db
        .update(products)
        .set({
          ...(data.name !==
            undefined && {
            name: data.name,
          }),

          ...(data.description !==
            undefined && {
            description:
              data.description,
          }),

          ...(data.price !==
            undefined && {
            price: data.price,
          }),

          ...(data.imageUrl !==
            undefined && {
            imageUrl:
              data.imageUrl,
          }),

          ...(data.categoryId !==
            undefined && {
            categoryId:
              data.categoryId,
          }),

          ...(data.isAvailable !==
            undefined && {
            isAvailable:
              data.isAvailable,
          }),

          ...(data.sortOrder !==
            undefined && {
            sortOrder:
              data.sortOrder,
          }),

          updatedAt: new Date(),
        })
        .where(
          and(
            eq(
              products.id,
              productId,
            ),
            eq(
              products.storeId,
              store.id,
            ),
          ),
        )
        .returning();

    return NextResponse.json({
      data: updatedProduct,
    });
  } catch (error) {
    return storeApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: Params,
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

    const { productId } =
      await params;

    const [deletedProduct] =
      await db
        .delete(products)
        .where(
          and(
            eq(
              products.id,
              productId,
            ),
            eq(
              products.storeId,
              store.id,
            ),
          ),
        )
        .returning({
          id: products.id,
        });

    if (!deletedProduct) {
      return NextResponse.json(
        {
          error:
            "Product not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: {
        success: true,
      },
    });
  } catch (error) {
    return storeApiError(error);
  }
}