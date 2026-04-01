import { NextResponse } from "next/server";

/**
 * Validate that the request Origin matches our app URL.
 * Returns a 403 response if the origin is invalid, or null if OK.
 */
export function validateOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // In development, allow requests without origin (e.g. Postman, curl)
  if (!origin) return null;

  // Reject if origin doesn't match our app URL
  if (appUrl && origin !== appUrl) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
