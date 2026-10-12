import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { categories } from "@/db/schema";

import { requireActiveStore } from "@/lib/auth/store-session";
import { storeApiError } from "@/lib/auth/store-api-errors";
import { hasStorePermission } from "@/lib/auth/store-permissions";

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(100),

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

export async function GET() {
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

    const result =
      await db
        .select()
        .from(categories)
        .where(
          eq(
            categories.storeId,
            store.id,
          ),
        )
        .orderBy(
          categories.sortOrder,
          categories.createdAt,
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

    const body =
      await request.json();

    const parsed =
      categorySchema.safeParse(
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

    const [category] =
      await db
        .insert(categories)
        .values({
          storeId: store.id,
          name: data.name,
          description:
            data.description ??
            null,
          imageUrl:
            data.imageUrl ?? null,
          sortOrder:
            data.sortOrder ?? 0,
          isActive:
            data.isActive ?? true,
        })
        .returning();

    return NextResponse.json(
      {
        data: category,
      },
      { status: 201 },
    );
  } catch (error) {
    return storeApiError(error);
  }
}