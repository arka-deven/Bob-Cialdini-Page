"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { PLANS } from "@/lib/constants";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubscribe(priceId: string | null) {
    if (!priceId) {
      router.push("/auth/signup");
      return;
    }

    setLoading(priceId);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();

    if (res.status === 401) {
      router.push("/auth/login?redirect=/pricing");
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    }
    setLoading(null);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-(--text-primary)">Choose Your Plan</h1>
            <p className="mt-4 text-lg text-(--text-muted)">
              Unlock unlimited access to Dr. Cialdini&apos;s AI-powered insights
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {PLANS.map((plan) => {
              const isPopular = "popular" in plan && plan.popular;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-8 ${
                    isPopular
                      ? "border-yellow bg-yellow/5"
                      : "border-(--border) bg-(--card-bg)"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow px-4 py-1 text-xs font-semibold text-ink">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-(--text-primary)">{plan.name}</h3>
                  <p className="mt-1 text-sm text-(--text-muted)">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-(--text-primary)">${plan.price}</span>
                    {plan.interval && <span className="text-(--text-muted)">/{plan.interval}</span>}
                  </div>
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-(--text-secondary)">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan.stripePriceId)}
                    disabled={loading === plan.stripePriceId}
                    className={`mt-8 w-full rounded-lg py-3 text-sm font-medium transition-colors disabled:opacity-50 ${
                      isPopular
                        ? "bg-yellow text-ink hover:bg-gold"
                        : "border border-(--border) text-(--text-primary) hover:bg-(--bg-secondary)"
                    }`}
                  >
                    {loading === plan.stripePriceId
                      ? "Loading..."
                      : plan.stripePriceId
                      ? "Subscribe"
                      : "Get Started Free"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
