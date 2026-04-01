import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimiters, rateLimit } from "@/lib/rate-limit";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip auth checks if Supabase isn't configured yet
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  // Let the callback handle its own session — middleware must not interfere
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    return NextResponse.next({ request });
  }

  // IP-based rate limiting on signup page to prevent trial abuse
  // Limits account creation attempts to 5 per hour per IP
  if (request.nextUrl.pathname === "/auth/signup" && request.method === "GET") {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = await rateLimit(rateLimiters?.auth, `signup-page:${ip}`, "auth");
    if (!rl.success) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/login";
      redirectUrl.searchParams.set("error", "too_many_attempts");
      return NextResponse.redirect(redirectUrl);
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ["/chat", "/profile", "/api/stripe/checkout", "/api/stripe/portal", "/api/profile"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Phone verification enforcement — chat requires a verified phone
  // SECURITY: only check user.phone (server-validated), NOT user_metadata (user-writable)
  const hasPhone = !!user?.phone;

  if (user && !hasPhone && pathname.startsWith("/chat")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/verify-phone";
    return NextResponse.redirect(redirectUrl);
  }

  // Already verified phone — bounce away from verify-phone page
  if (user && hasPhone && pathname === "/auth/verify-phone") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/chat";
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect logged-in users from auth pages and landing page
  const redirectPaths = ["/auth/login", "/auth/signup", "/"];
  if (user && redirectPaths.includes(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = hasPhone ? "/chat" : "/auth/verify-phone";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
