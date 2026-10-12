import { and, eq } from "drizzle-orm";

import { NextResponse } from "next/server";

import { db } from "@/db";

import {
  products,
  stores,
} from "@/db/schema";



export async function GET() {
  try {
    const result =
      await db.query.products.findMany({
        where: and(
          eq(
            products.isAvailable,
            true,
          ),
        ),

        with: {
          store: true,
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

    const availableProducts =
      result.filter(
        (product) =>
          product.store.isActive,
      );

    return NextResponse.json({
      success: true,

      data: availableProducts,
    });
  } catch (error) {
    console.error(
      "GET /products error:",
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