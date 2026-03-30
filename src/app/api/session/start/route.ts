import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimiters, rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const rl = await rateLimit(rateLimiters?.api, user.id);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("sessions_used, subscription_status")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (profile.subscription_status === "active") {
    return NextResponse.json({ sessionsUsed: profile.sessions_used });
  }

  const newCount = (profile.sessions_used ?? 0) + 1;

  await supabase
    .from("profiles")
    .update({ sessions_used: newCount })
    .eq("id", user.id);

  return NextResponse.json({ sessionsUsed: newCount });
}
