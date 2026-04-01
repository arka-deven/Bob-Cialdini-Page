import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { invalidateProfile } from "@/lib/cache";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isValidUUID(id: string | null | undefined): id is string {
  return !!id && UUID_REGEX.test(id);
}

/** Map Stripe subscription status to our internal status */
function mapSubscriptionStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "paused":
      return "paused";
    default:
      return "inactive";
  }
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  // --- Idempotency: atomic INSERT ON CONFLICT to prevent TOCTOU race ---
  const { data: inserted } = await supabaseAdmin
    .from("webhook_events")
    .upsert(
      { event_id: event.id, event_type: event.type },
      { onConflict: "event_id", ignoreDuplicates: true }
    )
    .select("event_id");

  // If no rows returned, the event was already processed (duplicate)
  if (!inserted || inserted.length === 0) {
    return NextResponse.json({ received: true, skipped: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Single Stripe API call to get both user ID and status
      let userId = session.metadata?.supabase_user_id;
      let status = "active";

      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        userId = userId || sub.metadata.supabase_user_id;
        status = mapSubscriptionStatus(sub.status);
      }

      if (!isValidUUID(userId)) break;

      // Parallelize: DB update + cache invalidation are independent
      await Promise.all([
        supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: status,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq("id", userId),
        invalidateProfile(userId),
      ]);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.supabase_user_id;

      if (!isValidUUID(userId)) break;

      const current = await stripe.subscriptions.retrieve(subscription.id);
      const status = mapSubscriptionStatus(current.status);

      await Promise.all([
        supabaseAdmin
          .from("profiles")
          .update({ subscription_status: status })
          .eq("id", userId),
        invalidateProfile(userId),
      ]);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.supabase_user_id;

      if (!isValidUUID(userId)) break;

      await Promise.all([
        supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "canceled",
            stripe_subscription_id: null,
          })
          .eq("id", userId),
        invalidateProfile(userId),
      ]);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
