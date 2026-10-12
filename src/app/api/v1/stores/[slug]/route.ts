import { eq } from "drizzle-orm";

import { NextResponse } from "next/server";

import { db } from "@/db";

import { stores } from "@/db/schema";

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

    return NextResponse.json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error(
      "GET /stores/:slug error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to retrieve store.",
      },
      { status: 500 },
    );
  }
}