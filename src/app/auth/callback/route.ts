import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Whitelist of allowed redirect paths after auth
const ALLOWED_REDIRECTS = ["/chat", "/pricing", "/support", "/"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/chat";

  // Validate redirect path — prevent open redirect attacks
  const redirectPath = ALLOWED_REDIRECTS.includes(next) ? next : "/chat";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
