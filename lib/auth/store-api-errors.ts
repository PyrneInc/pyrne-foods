import { NextResponse } from "next/server";

export function storeApiError(
  error: unknown,
) {
  if (!(error instanceof Error)) {
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }

  switch (error.message) {
    case "NOT_AUTHENTICATED":
      return NextResponse.json(
        {
          error: "Not authenticated.",
        },
        { status: 401 },
      );

    case "STORE_SESSION_REQUIRED":
      return NextResponse.json(
        {
          error:
            "No active store selected.",
        },
        { status: 409 },
      );

    case "STORE_ACCESS_DENIED":
      return NextResponse.json(
        {
          error:
            "You do not have access to this store.",
        },
        { status: 403 },
      );

    default:
      console.error(
        "Store API error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "An unexpected error occurred.",
        },
        { status: 500 },
      );
  }
}