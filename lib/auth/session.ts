import crypto from "crypto";

import { cookies } from "next/headers";

import { and, eq, gt } from "drizzle-orm";

import { db } from "@/db";
import { sessions } from "@/db/schema";
import { getCurrentUser } from "./current-user";

export const AUTH_COOKIE = "pyrne_session";

const SESSION_MAX_AGE =
  60 * 60 * 24 * 30;

const cookieOptions = {
  httpOnly: true,
  secure:
    process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function createSession(
  userId: string,
) {
  const token = generateToken();
  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() +
      SESSION_MAX_AGE * 1000,
  );

  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt,
  });

  const cookieStore = await cookies();

  cookieStore.set(
    AUTH_COOKIE,
    token,
    cookieOptions,
  );

  return {
    token,
    expiresAt,
  };
}


export const getSessionUser = getCurrentUser

export async function destroySession() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(AUTH_COOKIE)?.value;

  if (token) {
    await db
      .delete(sessions)
      .where(
        eq(
          sessions.tokenHash,
          hashToken(token),
        ),
      );
  }

  cookieStore.set(AUTH_COOKIE, "", {
    ...cookieOptions,
    maxAge: 0,
  });
}