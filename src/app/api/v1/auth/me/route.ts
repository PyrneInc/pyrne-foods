import {
  NextResponse,
} from "next/server";

import {
  getSessionToken,
} from "@/lib/auth/cookies";
import { getSessionUser } from "@/lib/auth/session";


export async function GET() {
  try {
    const token = await getSessionToken();

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Not authenticated.",
        },
        { status: 401 },
      );
    }

    const result = await getSessionUser()

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Not authenticated.",
        },
        { status: 401 },
      );
    }

    const user = result;

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
      "Get current user error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to get current user.",
      },
      { status: 500 },
    );
  }
}