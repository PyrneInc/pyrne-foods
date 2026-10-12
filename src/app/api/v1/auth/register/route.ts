import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookies";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2),

  email: z
    .string()
    .trim()
    .email()
    .transform((value) =>
      value.toLowerCase(),
    ),

  phone: z
    .string()
    .trim()
    .optional(),

  password: z
    .string()
    .min(8),
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
            "Invalid registration data.",
          details:
            parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      name,
      email,
      phone,
      password,
    } = parsed.data;

    const existingUser =
      await db.query.users.findFirst({
        where: eq(
          users.email,
          email,
        ),
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    const passwordHash =
      await hashPassword(
        password,
      );

    const [user] =
      await db
        .insert(users)
        .values({
          name,
          email,
          phone,
          passwordHash,
          role: "CUSTOMER",
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
        });

    const session =
      await createSession(
        user.id,
      );

    await setSessionCookie(
      session.token,
      session.expiresAt,
    );

    return NextResponse.json(
      {
        data: {
          user,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Registration error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to create account.",
      },
      { status: 500 },
    );
  }
}