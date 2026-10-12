import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  clearStoreSession,
  getActiveStore,
  setStoreSession,
} from "@/lib/auth/store-session";
import { getUserStore } from "@/lib/auth/store-access";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      );
    }

    const store = await getActiveStore();

    if (!store) {
      return NextResponse.json(
        {
          data: {
            store: null,
          },
        },
      );
    }

    return NextResponse.json({
      data: {
        store,
      },
    });
  } catch (error) {
    console.error("Get store session error:", error);

    return NextResponse.json(
      { error: "Failed to get store session." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const storeId = body?.storeId;

    if (
      typeof storeId !== "string" ||
      !storeId.trim()
    ) {
      return NextResponse.json(
        { error: "storeId is required." },
        { status: 400 },
      );
    }

    const store = await getUserStore(
      user.id,
      storeId,
    );

    if (!store) {
      return NextResponse.json(
        { error: "You do not have access to this store." },
        { status: 403 },
      );
    }

    await setStoreSession(store.id);

    return NextResponse.json({
      data: {
        store,
      },
    });
  } catch (error) {
    console.error("Set store session error:", error);

    return NextResponse.json(
      { error: "Failed to select store." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await clearStoreSession();

    return NextResponse.json({
      data: {
        success: true,
      },
    });
  } catch (error) {
    console.error("Clear store session error:", error);

    return NextResponse.json(
      { error: "Failed to clear store session." },
      { status: 500 },
    );
  }
}