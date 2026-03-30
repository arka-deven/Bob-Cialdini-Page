import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

// Use service role key for webhook handler (no user session)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId =
        session.metadata?.supabase_user_id ||
        (session.subscription
          ? (
              await stripe.subscriptions.retrieve(
                session.subscription as string
              )
            ).metadata.supabase_user_id
          : null);

      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "active",
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.supabase_user_id;

      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status:
              subscription.status === "active" ? "active" : "inactive",
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.supabase_user_id;

      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "inactive",
            stripe_subscription_id: null,
          })
          .eq("id", userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
