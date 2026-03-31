import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimiters, rateLimit } from "@/lib/rate-limit";
import { FREE_MESSAGE_LIMIT, FREE_VOICE_SECONDS } from "@/lib/constants";

const usageSchema = z.object({
  type: z.enum(["message", "voice"]),
  voiceSeconds: z.number().int().min(0).max(300).optional(),
});

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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  // Strict rate limit: 10 per 10 seconds
  const rl = await rateLimit(rateLimiters?.api, `usage:${user.id}`);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Validate input with zod
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = usageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { type, voiceSeconds } = parsed.data;

  // Fetch current profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, messages_used, voice_seconds_used")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

    // Atomic update: only increment if current value matches what we read
    const { data, error } = await supabase
      .from("profiles")
      .update({ messages_used: used + 1 })
      .eq("id", user.id)
      .eq("messages_used", used)
      .select("messages_used")
      .single();

    if (error || !data) {
      // Race condition — re-read and check
      return NextResponse.json({ error: "Please retry" }, { status: 409 });
    }

    return NextResponse.json({
      allowed: true,
      remaining: FREE_MESSAGE_LIMIT - data.messages_used,
    });
  }

  if (type === "voice") {
    const seconds = voiceSeconds ?? 0;
    const used = profile.voice_seconds_used ?? 0;

    if (used >= FREE_VOICE_SECONDS) {
      return NextResponse.json({
        allowed: false,
        remaining: 0,
        reason: "voice_limit_reached",
      });
    }

    const newTotal = Math.min(used + seconds, FREE_VOICE_SECONDS + 10);

    const { data, error } = await supabase
      .from("profiles")
      .update({ voice_seconds_used: newTotal })
      .eq("id", user.id)
      .eq("voice_seconds_used", used)
      .select("voice_seconds_used")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Please retry" }, { status: 409 });
    }

    return NextResponse.json({
      allowed: true,
      remaining: Math.max(0, FREE_VOICE_SECONDS - data.voice_seconds_used),
    });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
