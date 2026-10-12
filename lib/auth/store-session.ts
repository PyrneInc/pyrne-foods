import { cookies } from "next/headers";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserStore } from "@/lib/auth/store-access";

export const STORE_SESSION_COOKIE =
  "pyrne_store_id";

const STORE_SESSION_MAX_AGE =
  60 * 60 * 12;

const cookieOptions = {
  httpOnly: true,
  secure:
    process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: STORE_SESSION_MAX_AGE,
};

export async function getStoreSessionId() {
  const cookieStore = await cookies();

  return (
    cookieStore.get(
      STORE_SESSION_COOKIE,
    )?.value ?? null
  );
}

export async function setStoreSession(
  storeId: string,
) {
  const cookieStore = await cookies();

  cookieStore.set(
    STORE_SESSION_COOKIE,
    storeId,
    cookieOptions,
  );
}

export async function clearStoreSession() {
  const cookieStore = await cookies();

  cookieStore.set(
    STORE_SESSION_COOKIE,
    "",
    {
      ...cookieOptions,
      maxAge: 0,
    },
  );
}

export async function getActiveStore() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const storeId =
    await getStoreSessionId();

  if (!storeId) {
    return null;
  }

  return getUserStore(
    user.id,
    storeId,
  );
}

export async function requireActiveStore() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "NOT_AUTHENTICATED",
    );
  }

  const storeId =
    await getStoreSessionId();

  if (!storeId) {
    throw new Error(
      "STORE_SESSION_REQUIRED",
    );
  }

  const store = await getUserStore(
    user.id,
    storeId,
  );

  if (!store) {
    await clearStoreSession();

    throw new Error(
      "STORE_ACCESS_DENIED",
    );
  }

  return {
    user,
    store,
  };
}