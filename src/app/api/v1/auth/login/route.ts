import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookies";

const schema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) =>
      value.toLowerCase(),
    ),

  password: z
    .string()
    .min(1),
});

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    const parsed =
      schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Invalid login data.",
        },
        { status: 400 },
      );
    }

    const {
      email,
      password,
    } = parsed.data;

    const user =
      await db.query.users.findFirst({
        where: eq(
          users.email,
          email,
        ),
      });

    if (
      !user ||
      !user.isActive
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    const valid =
      await verifyPassword(
        password,
        user.passwordHash,
      );

    if (!valid) {
      return NextResponse.json(
        {
          error:
            "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    const session =
      await createSession(
        user.id,
      );

    await setSessionCookie(
      session.token,
      session.expiresAt,
    );

    return NextResponse.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to login.",
      },
      { status: 500 },
    );
  }
}