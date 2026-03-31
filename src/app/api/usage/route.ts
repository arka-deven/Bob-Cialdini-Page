import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimiters, rateLimit } from "@/lib/rate-limit";
import { FREE_MESSAGE_LIMIT, FREE_VOICE_SECONDS } from "@/lib/constants";

// GET: Check current usage
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit(rateLimiters?.api, user.id);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, messages_used, voice_seconds_used")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const isSubscribed = profile.subscription_status === "active";

  return NextResponse.json({
    isSubscribed,
    messagesUsed: profile.messages_used ?? 0,
    messagesLimit: FREE_MESSAGE_LIMIT,
    messagesRemaining: isSubscribed
      ? Infinity
      : Math.max(0, FREE_MESSAGE_LIMIT - (profile.messages_used ?? 0)),
    voiceSecondsUsed: profile.voice_seconds_used ?? 0,
    voiceSecondsLimit: FREE_VOICE_SECONDS,
    voiceSecondsRemaining: isSubscribed
      ? Infinity
      : Math.max(0, FREE_VOICE_SECONDS - (profile.voice_seconds_used ?? 0)),
  });
}

// POST: Consume a credit
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Strict rate limit: 10 per 10 seconds (prevents rapid message spam)
  const rl = await rateLimit(rateLimiters?.api, `usage:${user.id}`);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const { type, voiceSeconds } = body as {
    type: "message" | "voice";
    voiceSeconds?: number;
  };

  if (!type || !["message", "voice"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Fetch current profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, messages_used, voice_seconds_used")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const isSubscribed = profile.subscription_status === "active";

  // Subscribed users have no limits
  if (isSubscribed) {
    return NextResponse.json({ allowed: true, remaining: Infinity });
  }

  if (type === "message") {
    const used = profile.messages_used ?? 0;
    if (used >= FREE_MESSAGE_LIMIT) {
      return NextResponse.json({
        allowed: false,
        remaining: 0,
        reason: "message_limit_reached",
      });
    }

    const newCount = used + 1;
    await supabase
      .from("profiles")
      .update({ messages_used: newCount })
      .eq("id", user.id);

    return NextResponse.json({
      allowed: true,
      remaining: FREE_MESSAGE_LIMIT - newCount,
    });
  }

  if (type === "voice") {
    const seconds = Math.min(Math.max(0, Math.round(voiceSeconds ?? 0)), 300);
    const used = profile.voice_seconds_used ?? 0;

    if (used >= FREE_VOICE_SECONDS) {
      return NextResponse.json({
        allowed: false,
        remaining: 0,
        reason: "voice_limit_reached",
      });
    }

    const newTotal = Math.min(used + seconds, FREE_VOICE_SECONDS + 10); // small grace
    await supabase
      .from("profiles")
      .update({ voice_seconds_used: newTotal })
      .eq("id", user.id);

    return NextResponse.json({
      allowed: true,
      remaining: Math.max(0, FREE_VOICE_SECONDS - newTotal),
    });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
