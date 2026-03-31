import { NextResponse } from "next/server";
import { SignJWT, importPKCS8 } from "jose";
import { createClient } from "@/lib/supabase/server";
import { rateLimiters, rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit(rateLimiters?.api, `delphi:${user.id}`);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const privateKeyPem = process.env.DELPHI_SSO_PRIVATE_KEY;
  if (!privateKeyPem) {
    // SSO not configured — return empty so chat still works without SSO
    return NextResponse.json({ token: null });
  }

  try {
    const privateKey = await importPKCS8(privateKeyPem, "RS256");

    const token = await new SignJWT({ email: user.email })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(privateKey);

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "SSO configuration error" }, { status: 500 });
  }
}
