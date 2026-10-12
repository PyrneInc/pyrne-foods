import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { stores } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserStore } from "@/lib/auth/store-access";
import { canManageStore } from "@/lib/auth/store-permissions";
import {
  clearStoreSession,
  getStoreSessionId,
} from "@/lib/auth/store-session";

const storeTypeSchema = z.enum([
  "BAKERY",
  "RESTAURANT",
  "CAFE",
  "FOOD_VENDOR",
  "OTHER",
]);

const updateStoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Store name must contain at least 2 characters.")
    .max(100, "Store name is too long.")
    .optional(),

  slug: z
    .string()
    .trim()
    .min(2, "Slug must contain at least 2 characters.")
    .max(100, "Slug is too long.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug may only contain lowercase letters, numbers and hyphens.",
    )
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000, "Description is too long.")
    .nullable()
    .optional(),

  type: storeTypeSchema.optional(),

  logoUrl: z
    .string()
    .url("Logo URL must be valid.")
    .nullable()
    .optional(),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .nullable()
    .optional(),

  email: z
    .string()
    .email("Email must be valid.")
    .nullable()
    .optional(),

  address: z
    .string()
    .trim()
    .max(500, "Address is too long.")
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),
});

type Params = {
  params: Promise<{
    storeId: string;
  }>;
};

function normalizeSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export async function GET(
  _request: NextRequest,
  { params }: Params,
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      );
    }

    const { storeId } = await params;

    const store = await getUserStore(
      user.id,
      storeId,
    );

    if (!store) {
      return NextResponse.json(
        { error: "Store not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: store,
    });
  } catch (error) {
    console.error("Get store error:", error);

    return NextResponse.json(
      { error: "Failed to fetch store." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Params,
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      );
    }

    const { storeId } = await params;

    const membership = await getUserStore(
      user.id,
      storeId,
    );

    if (!membership) {
      return NextResponse.json(
        { error: "Store not found." },
        { status: 404 },
      );
    }

    if (!canManageStore(membership.role)) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to manage this store.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const parsed = updateStoreSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid store data.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (data.slug !== undefined) {
      data.slug = normalizeSlug(data.slug);

      const conflictingStore = await db
        .select({
          id: stores.id,
        })
        .from(stores)
        .where(eq(stores.slug, data.slug))
        .limit(1);

      if (
        conflictingStore.length > 0 &&
        conflictingStore[0].id !== storeId
      ) {
        return NextResponse.json(
          {
            error:
              "A store with this slug already exists.",
          },
          { status: 409 },
        );
      }
    }

    const [updatedStore] = await db
      .update(stores)
      .set({
        ...(data.name !== undefined && {
          name: data.name,
        }),

        ...(data.slug !== undefined && {
          slug: data.slug,
        }),

        ...(data.description !== undefined && {
          description: data.description,
        }),

        ...(data.type !== undefined && {
          type: data.type,
        }),

        ...(data.logoUrl !== undefined && {
          logoUrl: data.logoUrl,
        }),

        ...(data.phone !== undefined && {
          phone: data.phone,
        }),

        ...(data.email !== undefined && {
          email: data.email,
        }),

        ...(data.address !== undefined && {
          address: data.address,
        }),

        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),

        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId))
      .returning();

    if (!updatedStore) {
      return NextResponse.json(
        { error: "Store not found." },
        { status: 404 },
      );
    }

    if (data.isActive === false) {
      const activeStoreId = await getStoreSessionId();

      if (activeStoreId === storeId) {
        await clearStoreSession();
      }
    }

    return NextResponse.json({
      data: {
        ...updatedStore,
        role: membership.role,
      },
    });
  } catch (error) {
    console.error("Update store error:", error);

    return NextResponse.json(
      { error: "Failed to update store." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: Params,
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      );
    }

    const { storeId } = await params;

    const membership = await getUserStore(
      user.id,
      storeId,
    );

    if (!membership) {
      return NextResponse.json(
        { error: "Store not found." },
        { status: 404 },
      );
    }

    if (membership.role !== "OWNER") {
      return NextResponse.json(
        {
          error:
            "Only the store owner can delete a store.",
        },
        { status: 403 },
      );
    }

    const activeStoreId = await getStoreSessionId();

    await db
      .update(stores)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    if (activeStoreId === storeId) {
      await clearStoreSession();
    }

    return NextResponse.json({
      data: {
        success: true,
      },
    });
  } catch (error) {
    console.error("Delete store error:", error);

    return NextResponse.json(
      { error: "Failed to delete store." },
      { status: 500 },
    );
  }
}