export const SITE_NAME = "Dr. Robert Cialdini AI";
export const SITE_DESCRIPTION =
  "Get personalized insights on influence and persuasion from the world's foremost authority — Dr. Robert Cialdini.";

// Delphi embed URLs — set display mode in Delphi Studio > Integrations
export const DELPHI_CHAT_URL =
  process.env.NEXT_PUBLIC_DELPHI_CHAT_URL || "";
export const DELPHI_VOICE_URL =
  process.env.NEXT_PUBLIC_DELPHI_VOICE_URL || "";

// Free tier limits
export const FREE_MESSAGE_LIMIT = 3;
export const FREE_VOICE_SECONDS = 180; // 3 minutes

// Subscription tiers — update price IDs from your Stripe dashboard
export const PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Try it out with limited access",
    price: 0,
    interval: null,
    features: [
      "3 free text messages",
      "3-minute voice call",
      "Text-based responses",
      "Basic persuasion insights",
    ],
    stripePriceId: null,
  },
  {
    id: "monthly",
    name: "Pro",
    description: "Unlimited access to Dr. Cialdini AI",
    price: 29,
    interval: "month" as const,
    features: [
      "Unlimited text messages",
      "Unlimited voice calls",
      "Deep-dive persuasion strategies",
      "Priority response time",
      "Access to exclusive content",
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || "",
    popular: true,
  },
  {
    id: "yearly",
    name: "Pro Annual",
    description: "Best value — save 33%",
    price: 19,
    interval: "month" as const,
    billedAs: "year",
    features: [
      "Everything in Pro",
      "Billed annually ($228/year)",
      "Save $120 per year",
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || "",
  },
] as const;
