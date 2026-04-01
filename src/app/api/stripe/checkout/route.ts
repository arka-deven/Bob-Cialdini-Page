import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validations";
import { rateLimiters, rateLimit } from "@/lib/rate-limit";
import { getCachedProfile, invalidateProfile } from "@/lib/cache";
import { validateOrigin } from "@/lib/csrf";

// Server-side allowlist of valid Stripe price IDs
const ALLOWED_PRICE_IDS = [
  process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
  process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID,
].filter(Boolean);

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

  const rl = await rateLimit(rateLimiters?.checkout, user.id, "checkout");
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const stripe = getStripe();
  const { priceId, coupon } = parsed.data;

  // Validate price ID against server-side allowlist
  if (!ALLOWED_PRICE_IDS.includes(priceId)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  // Try cache first for customer ID lookup
  const cached = await getCachedProfile(user.id);
  let customerId = cached?.stripe_customer_id;

  if (!customerId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    customerId = profile?.stripe_customer_id;
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);

    await invalidateProfile(user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionParams: any = {
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${appUrl}/chat?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
  };

  if (coupon) {
    sessionParams.discounts = [{ coupon }];
  } else {
    sessionParams.allow_promotion_codes = true;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return NextResponse.json({ url: session.url });
}
