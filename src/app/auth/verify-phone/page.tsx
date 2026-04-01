"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Turnstile from "@/components/Turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function VerifyPhonePage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const supabase = createClient();

  const handleTurnstile = useCallback((t: string) => setTurnstileToken(t), []);

  async function handleCancel() {
    setCancelling(true);
    const res = await fetch("/api/auth/cancel-signup", { method: "POST" });
    if (res.ok) {
      window.location.href = "/auth/signup";
    } else {
      toast.error("Failed to cancel. Please try again.");
      setCancelling(false);
    }
  }

  async function handleSendOtp() {
    if (!phone.trim()) { toast.error("Enter your phone number"); return; }
    setLoading(true);
    // Send OTP via server-side route (applies rate limiting + Turnstile)
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, turnstileToken }),
    });
    if (res.ok) {
      toast.success("Verification code sent!");
      setStep("otp");
    } else {
      const err = await res.json().catch(() => null);
      toast.error(err?.error || "Failed to send code. Please try again.");
    }
    setLoading(false);
  }

  async function handleVerifyOtp() {
    if (!token.trim()) { toast.error("Enter the verification code"); return; }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: "phone_change" });
    if (error) {
      toast.error("Invalid or expired code. Please try again.");
      setLoading(false);
    } else {
      toast.success("Phone verified!");
      window.location.href = "/chat";
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verify Your Phone</CardTitle>
            <CardDescription>
              {step === "phone" ? "A verified phone number is required to use the chat" : `Code sent to ${phone}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "phone" ? (
              <>
                <Input
                  type="tel"
                  placeholder="+12125551234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Turnstile onVerify={handleTurnstile} />
                <Button onClick={handleSendOtp} className="w-full" disabled={loading || !turnstileToken}>
                  {loading ? "Sending..." : "Send Verification Code"}
                </Button>
              </>
            ) : (
              <>
                <Input
                  type="text"
                  placeholder="6-digit code"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <Button onClick={handleVerifyOtp} className="w-full" disabled={loading}>
                  {loading ? "Verifying..." : "Verify Phone"}
                </Button>
                <button onClick={() => { setStep("phone"); setToken(""); setTurnstileToken(null); }} className="w-full text-sm text-muted-foreground hover:text-foreground">
                  Use a different number
                </button>
              </>
            )}

            <div className="pt-2 border-t">
              <button
                onClick={handleCancel}
                disabled={cancelling || loading}
                className="w-full text-sm text-destructive hover:text-destructive/80 disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel and delete my account"}
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
