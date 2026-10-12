import crypto from "crypto";

import { cookies } from "next/headers";

import { and, eq, gt } from "drizzle-orm";

import { db } from "@/db";
import {
  sessions,
  users,
} from "@/db/schema";

import { AUTH_COOKIE } from "./session";

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const tokenHash =
    hashToken(token);

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      isActive: users.isActive,
    })
    .from(sessions)
    .innerJoin(
      users,
      eq(sessions.userId, users.id),
    )
    .where(
      and(
        eq(
          sessions.tokenHash,
          tokenHash,
        ),
        gt(
          sessions.expiresAt,
          new Date(),
        ),
        eq(users.isActive, true),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}