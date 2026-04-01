import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimiters, rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { validateOrigin } from "@/lib/csrf";
import { phoneSchema } from "@/lib/validations";

export async function POST(request: Request) {
  // CSRF check
  const csrfError = validateOrigin(request);
  if (csrfError) return csrfError;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit by user ID: 3 OTP sends per 5 minutes
  const rl = await rateLimit(rateLimiters?.auth, `otp:${user.id}`);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait before requesting a new code." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { phone, turnstileToken } = body as { phone?: string; turnstileToken?: string };

  // Verify Turnstile CAPTCHA
  const captchaValid = await verifyTurnstile(turnstileToken ?? null);
  if (!captchaValid) {
    return NextResponse.json({ error: "CAPTCHA verification failed" }, { status: 400 });
  }

  // Validate phone format
  const parsed = phoneSchema.safeParse({ phone });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  // Send OTP via Supabase (uses updateUser for phone_change flow)
  const { error } = await supabase.auth.updateUser({ phone: parsed.data.phone });

  if (error) {
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
