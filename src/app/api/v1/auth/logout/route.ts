import {
  NextResponse,
} from "next/server";

import {
  clearSessionCookie,
  getSessionToken,
} from "@/lib/auth/cookies";

import {
  deleteSession,
} from "@/lib/auth/session";

import {
  clearStoreSession,
} from "@/lib/auth/store-session";

export async function POST() {
  try {
    const token =
      await getSessionToken();

    if (token) {
      await deleteSession(
        token,
      );
    }

    await clearSessionCookie();
    await clearStoreSession()

    return NextResponse.json({
      data: {
        success: true,
      },
    });
  } catch (error) {
    console.error(
      "Logout error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to logout.",
      },
      { status: 500 },
    );
  }
}