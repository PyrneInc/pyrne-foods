import { eq } from "drizzle-orm";

import { NextResponse } from "next/server";

import { db } from "@/db";

import { stores } from "@/db/schema";

export async function GET() {
  try {
    const result =
      await db.query.stores.findMany({
        where: eq(
          stores.isActive,
          true,
        ),

        orderBy: (
          stores,
          { asc },
        ) => [
          asc(stores.name),
        ],
      });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "GET /stores error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to retrieve stores.",
      },
      { status: 500 },
    );
  }
}
