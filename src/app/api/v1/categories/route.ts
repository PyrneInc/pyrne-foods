import { eq } from "drizzle-orm";

import { NextResponse } from "next/server";

import { db } from "@/db";

import {
  categories,
  stores,
} from "@/db/schema";

export async function GET() {
  try {
    const result =
      await db.query.categories.findMany({
        where: eq(
          categories.isActive,
          true,
        ),

        with: {
          store: true,
        },

        orderBy: (
          categories,
          { asc },
        ) => [
          asc(categories.sortOrder),
          asc(categories.name),
        ],
      });

    const activeCategories =
      result.filter(
        (category) =>
          category.store.isActive,
      );

    return NextResponse.json({
      success: true,

      data: activeCategories,
    });
  } catch (error) {
    console.error(
      "GET /categories error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to retrieve categories.",
      },
      { status: 500 },
    );
  }
}