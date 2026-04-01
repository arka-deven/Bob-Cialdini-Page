import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { validateOrigin } from "@/lib/csrf";
import { rateLimiters, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const csrfError = validateOrigin(request);
  if (csrfError) return csrfError;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = await rateLimit(rateLimiters?.auth, `cancel:${user.id}`, "auth");
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Only allow cancellation for users without a verified phone
  // SECURITY: only check user.phone (server-validated)
  if (user.phone) {
    return NextResponse.json(
      { error: "Account already verified" },
      { status: 400 }
    );
  }

  // Use admin client to delete the user and their profile (cascade)
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }

  // Sign out the current session
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
