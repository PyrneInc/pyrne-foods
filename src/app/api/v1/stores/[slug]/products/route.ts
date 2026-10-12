import {
  and,
  eq,
} from "drizzle-orm";

import { NextResponse } from "next/server";

import { db } from "@/db";

import {
  products,
  stores,
} from "@/db/schema";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Context,
) {
  try {
    const { slug } = await params;

    const store =
      await db.query.stores.findFirst({
        where: eq(
          stores.slug,
          slug,
        ),
      });

    if (
      !store ||
      !store.isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Store not found.",
        },
        { status: 404 },
      );
    }

    const result =
      await db.query.products.findMany({
        where: and(
          eq(
            products.storeId,
            store.id,
          ),
          eq(
            products.isAvailable,
            true,
          ),
        ),

        with: {
          category: true,
        },

        orderBy: (
          products,
          { asc },
        ) => [
          asc(products.sortOrder),
          asc(products.name),
        ],
      });

    return NextResponse.json({
      success: true,

      data: {
        store,
        products: result,
      },
    });
  } catch (error) {
    console.error(
      "GET /store/products error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to retrieve products.",
      },
      { status: 500 },
    );
  }
}