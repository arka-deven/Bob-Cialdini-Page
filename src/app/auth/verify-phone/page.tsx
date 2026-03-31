"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function VerifyPhonePage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSendOtp() {
    if (!phone.trim()) { toast.error("Enter your phone number"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ phone });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Verification code sent!");
      setStep("otp");
    }
    setLoading(false);
  }

  async function handleVerifyOtp() {
    if (!token.trim()) { toast.error("Enter the verification code"); return; }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: "phone_change" });
    if (error) {
      toast.error(error.message);
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
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button onClick={handleSendOtp} className="w-full" disabled={loading}>
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
                <button onClick={() => { setStep("phone"); setToken(""); }} className="w-full text-sm text-muted-foreground hover:text-foreground">
                  Use a different number
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
