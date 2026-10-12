import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { categories } from "@/db/schema";

import { requireActiveStore } from "@/lib/auth/store-session";
import { storeApiError } from "@/lib/auth/store-api-errors";
import { hasStorePermission } from "@/lib/auth/store-permissions";

const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000)
    .nullable()
    .optional(),

  imageUrl: z
    .string()
    .url()
    .nullable()
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

type Params = {
  params: Promise<{
    categoryId: string;
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
        "VIEW_CATEGORIES",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to view categories.",
        },
        { status: 403 },
      );
    }

    const { categoryId } =
      await params;

    const [category] =
      await db
        .select()
        .from(categories)
        .where(
          and(
            eq(
              categories.id,
              categoryId,
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
            "Category not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: category,
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
        "MANAGE_CATEGORIES",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to manage categories.",
        },
        { status: 403 },
      );
    }

    const { categoryId } =
      await params;

    const body =
      await request.json();

    const parsed =
      updateCategorySchema.safeParse(
        body,
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Invalid category data.",
          details:
            parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const [updatedCategory] =
      await db
        .update(categories)
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

          ...(data.imageUrl !==
            undefined && {
            imageUrl:
              data.imageUrl,
          }),

          ...(data.sortOrder !==
            undefined && {
            sortOrder:
              data.sortOrder,
          }),

          ...(data.isActive !==
            undefined && {
            isActive:
              data.isActive,
          }),

          updatedAt: new Date(),
        })
        .where(
          and(
            eq(
              categories.id,
              categoryId,
            ),
            eq(
              categories.storeId,
              store.id,
            ),
          ),
        )
        .returning();

    if (!updatedCategory) {
      return NextResponse.json(
        {
          error:
            "Category not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: updatedCategory,
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
        "MANAGE_CATEGORIES",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to manage categories.",
        },
        { status: 403 },
      );
    }

    const { categoryId } =
      await params;

    const [deletedCategory] =
      await db
        .delete(categories)
        .where(
          and(
            eq(
              categories.id,
              categoryId,
            ),
            eq(
              categories.storeId,
              store.id,
            ),
          ),
        )
        .returning({
          id: categories.id,
        });

    if (!deletedCategory) {
      return NextResponse.json(
        {
          error:
            "Category not found.",
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