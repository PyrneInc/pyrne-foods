import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  storeMembers,
  stores,
  users,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserStores } from "@/lib/auth/store-access";
import { setStoreSession } from "@/lib/auth/store-session";

const storeTypeSchema = z.enum([
  "BAKERY",
  "RESTAURANT",
  "CAFE",
  "FOOD_VENDOR",
  "OTHER",
]);

const createStoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "Store name must contain at least 2 characters.",
    )
    .max(
      100,
      "Store name is too long.",
    ),

  slug: z
    .string()
    .trim()
    .min(
      2,
      "Slug must contain at least 2 characters.",
    )
    .max(
      100,
      "Slug is too long.",
    )
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug may only contain lowercase letters, numbers and hyphens.",
    ),

  description: z
    .string()
    .trim()
    .max(1000)
    .nullable()
    .optional(),

  type: storeTypeSchema
    .default("FOOD_VENDOR"),

  logoUrl: z
    .string()
    .url()
    .nullable()
    .optional(),

  phone: z
    .string()
    .trim()
    .max(30)
    .nullable()
    .optional(),

  email: z
    .string()
    .email()
    .nullable()
    .optional(),

  address: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional(),
});

function normalizeSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Not authenticated.",
        },
        {
          status: 401,
        },
      );
    }

    const userStores =
      await getUserStores(user.id);

    return NextResponse.json({
      data: userStores,
    });
  } catch (error) {
    console.error(
      "Get stores error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to fetch stores.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Not authenticated.",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      await request.json();

    const parsed =
      createStoreSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid store data.",
          details:
            parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const data = parsed.data;

    const slug =
      normalizeSlug(data.slug);

    const existingStore =
      await db
        .select({
          id: stores.id,
        })
        .from(stores)
        .where(
          eq(
            stores.slug,
            slug,
          ),
        )
        .limit(1);

    if (existingStore.length) {
      return NextResponse.json(
        {
          error:
            "A store with this slug already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const result =
      await db.transaction(
        async (tx) => {
          const [store] =
            await tx
              .insert(stores)
              .values({
                name: data.name,
                slug,
                description:
                  data.description ??
                  null,
                type: data.type,
                logoUrl:
                  data.logoUrl ??
                  null,
                phone:
                  data.phone ??
                  null,
                email:
                  data.email ??
                  null,
                address:
                  data.address ??
                  null,
                isActive: true,
              })
              .returning();

          if (!store) {
            throw new Error(
              "STORE_CREATE_FAILED",
            );
          }

          await tx
            .insert(storeMembers)
            .values({
              storeId: store.id,
              userId: user.id,
              role: "OWNER",
            });

          await tx
            .update(users)
            .set({
              role: "STORE_USER",
              updatedAt:
                new Date(),
            })
            .where(
              eq(
                users.id,
                user.id,
              ),
            );

          return store;
        },
      );

    await setStoreSession(
      result.id,
    );

    return NextResponse.json(
      {
        data: {
          ...result,
          role: "OWNER",
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Create store error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to create store.",
      },
      {
        status: 500,
      },
    );
  }
}