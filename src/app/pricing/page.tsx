"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/AnimatedSection";
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

    if (res.status === 401) {
      toast.error("Please sign in first");
      router.push("/auth/login?redirect=/pricing");
      return;
    }

    const data = await res.json();
    if (res.status === 429) {
      toast.error("Too many requests. Please try again shortly.");
      setLoading(null);
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(null);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-6 py-24">
        <AnimatedSection className="mx-auto max-w-5xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground">Choose Your Plan</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Unlock unlimited access to Dr. Cialdini&apos;s AI-powered insights
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 items-stretch gap-8 sm:grid-cols-3">
            {PLANS.map((plan) => {
              const isPopular = "popular" in plan && plan.popular;
              return (
                <div key={plan.id} className={isPopular ? "pt-3" : "pt-3"}>
                  <Card className={`relative flex h-full flex-col overflow-visible ${isPopular ? "border-primary shadow-lg shadow-primary/10" : ""}`}>
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">Most Popular</Badge>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                        {plan.interval && <span className="text-muted-foreground">/{plan.interval}</span>}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <ul className="flex-1 space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleSubscribe(plan.stripePriceId)}
                        disabled={loading === plan.stripePriceId}
                        variant={isPopular ? "default" : "outline"}
                        className="mt-8 w-full"
                      >
                        {loading === plan.stripePriceId ? "Loading..." : plan.stripePriceId ? "Subscribe" : "Get Started Free"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
}
