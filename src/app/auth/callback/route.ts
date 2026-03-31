import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_REDIRECTS = ["/chat", "/pricing", "/support", "/"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/chat";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // If Supabase returns an error
  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  const redirectPath = ALLOWED_REDIRECTS.includes(next) ? next : "/chat";

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // If no code, serve a client-side page to handle hash fragments
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head><title>Authenticating...</title></head>
      <body>
        <script>
          // Handle hash fragment tokens from OAuth implicit flow
          const hash = window.location.hash;
          if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken) {
              // Supabase client will pick up the session from the URL
              window.location.href = '/chat';
            } else {
              window.location.href = '/auth/login?error=auth_failed';
            }
          } else {
            window.location.href = '/auth/login?error=auth_failed';
          }
        </script>
      </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
