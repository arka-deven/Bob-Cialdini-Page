import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimiters, rateLimit } from "@/lib/rate-limit";
import { invalidateProfile } from "@/lib/cache";
import { validateOrigin } from "@/lib/csrf";

const updateSchema = z.object({
  full_name: z.string().max(100).optional(),
  phone: z
    .string()
    .max(20)
    .regex(/^\+1[2-9]\d{9}$/, "Please enter a valid US or Canadian phone number")
    .optional(),
  newsletter: z.boolean().optional(),
});

export async function POST(request: Request) {
  const csrfError = validateOrigin(request);
  if (csrfError) return csrfError;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit(rateLimiters?.api, `profile:${user.id}`);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  await invalidateProfile(user.id);
  return NextResponse.json({ success: true });
}
