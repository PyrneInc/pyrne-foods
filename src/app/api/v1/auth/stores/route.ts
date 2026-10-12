import {
  NextResponse,
} from "next/server";

import {
  getSessionToken,
} from "@/lib/auth/cookies";

import {
  getSessionUser,
} from "@/lib/auth/session";

import {
  db,
} from "@/db";

import {
  storeMembers,
  stores,
} from "@/db/schema";

import {
  and, eq,
} from "drizzle-orm";

export async function GET() {
  try {
    const token =
      await getSessionToken();

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Not authenticated.",
        },
        { status: 401 },
      );
    }

    const result =
      await getSessionUser(
        token,
      );

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Not authenticated.",
        },
        { status: 401 },
      );
    }

    const storeRows =
      await db
        .select({
          id: stores.id,
          name: stores.name,
          slug: stores.slug,
          description:
            stores.description,
          type: stores.type,
          logoUrl:
            stores.logoUrl,
          role:
            storeMembers.role,
        })
        .from(storeMembers)
        .innerJoin(
          stores,
          eq(
            storeMembers.storeId,
            stores.id,
          ),
        )
        .where(
          and(
            eq(
              storeMembers.userId,
              result.user.id,
            ),
            eq(stores.isActive, true)
          )
        );

    return NextResponse.json({
      data: storeRows,
    });
  } catch (error) {
    console.error(
      "Get user stores error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch stores.",
      },
      { status: 500 },
    );
  }
}