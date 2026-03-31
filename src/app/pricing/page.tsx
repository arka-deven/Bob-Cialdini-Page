"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/constants";

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const router = useRouter();

  const monthly = PLANS.find((p) => p.id === "monthly")!;
  const yearly = PLANS.find((p) => p.id === "yearly")!;
  const selected = billing === "monthly" ? monthly : yearly;

  async function handleSubscribe() {
    if (!selected.stripePriceId) {
      router.push("/auth/signup");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: selected.stripePriceId,
        ...(couponApplied && coupon ? { coupon } : {}),
      }),
    });

    if (res.status === 401) {
      toast.error("Please sign in first");
      router.push("/auth/login?redirect=/pricing");
      return;
    }

    const data = await res.json();
    if (res.status === 429) {
      toast.error("Too many requests. Please try again shortly.");
      setLoading(false);
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <Link href="/chat" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Chat
          </Link>
        </div>
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_380px]">

          {/* Left column */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Choose Your Investment</h1>

            {/* Monthly option */}
            <button
              onClick={() => setBilling("monthly")}
              className={`mt-8 w-full rounded-xl border-2 p-6 text-left transition-all ${
                billing === "monthly"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${billing === "monthly" ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                    {billing === "monthly" && (
                      <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-lg font-semibold text-foreground">Monthly</span>
                </div>
                <span className="text-2xl font-bold text-foreground">$29<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
              </div>
              <div className="mt-4 ml-8">
                <p className="text-sm font-medium text-foreground">Included in your subscription</p>
                <ul className="mt-3 space-y-2">
                  {monthly.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Cancel Anytime / No Commitment
                  </li>
                </ul>
              </div>
            </button>

            {/* Yearly option */}
            <button
              onClick={() => setBilling("yearly")}
              className={`mt-4 w-full rounded-xl border-2 p-6 text-left transition-all ${
                billing === "yearly"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${billing === "yearly" ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                    {billing === "yearly" && (
                      <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-lg font-semibold text-foreground">Yearly</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground line-through">$29/mo</span>
                  <br />
                  <span className="text-2xl font-bold text-foreground">$19<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                  <p className="text-xs text-muted-foreground">billed at $228/yr</p>
                </div>
              </div>
              <div className="mt-3 ml-8">
                <Badge className="text-xs">SAVE 33% WITH YEARLY</Badge>
              </div>
            </button>
          </div>

          {/* Right column — summary card */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border">
                    <Image
                      src="/robert-cialdini.jpg"
                      alt="Dr. Robert Cialdini"
                      fill
                      className="object-cover object-top"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">Dr. Cialdini AI</h2>
                    <p className="text-sm text-muted-foreground">24/7 Access — Chat & Voice</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-primary">
                        ${billing === "monthly" ? "29" : "19"}
                      </span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                      {billing === "yearly" && (
                        <p className="text-xs text-muted-foreground">billed annually</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Coupon code */}
                <div className="mt-6 flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={coupon}
                    onChange={(e) => {
                      setCoupon(e.target.value.toUpperCase());
                      setCouponApplied(false);
                    }}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 px-4"
                    onClick={() => {
                      if (coupon.trim()) {
                        setCouponApplied(true);
                        toast.success(`Coupon "${coupon}" applied`);
                      }
                    }}
                    disabled={!coupon.trim() || couponApplied}
                  >
                    {couponApplied ? "Applied" : "Apply"}
                  </Button>
                </div>
                {couponApplied && (
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-green-500">Coupon &quot;{coupon}&quot; applied</span>
                    <button
                      onClick={() => { setCoupon(""); setCouponApplied(false); }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <Button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="mt-4 w-full"
                  size="lg"
                >
                  {loading ? "Loading..." : "Subscribe Now"}
                </Button>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Cancel anytime. No commitment required.
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
