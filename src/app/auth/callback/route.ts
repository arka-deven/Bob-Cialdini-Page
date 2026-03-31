import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ALLOWED_REDIRECTS = ["/chat", "/pricing", "/support", "/"];

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/chat";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  const redirectPath = ALLOWED_REDIRECTS.includes(next) ? next : "/chat";

  if (code) {
    // Build redirect response first, then set cookies on it
    const redirectUrl = new URL(redirectPath, origin);
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
