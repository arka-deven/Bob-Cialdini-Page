"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  emailSignupSchema,
  phoneSchema,
  otpSchema,
  type EmailSignupInput,
  type PhoneInput,
  type OtpInput,
} from "@/lib/validations";
import Header from "@/components/Header";
import Turnstile from "@/components/Turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Step = "email" | "verify-email" | "phone" | "otp" | "done";

export default function SignupPage() {
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [phoneValue, setPhoneValue] = useState("");
  const supabase = createClient();

  const [cancelling, setCancelling] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const emailForm = useForm<EmailSignupInput>({ resolver: zodResolver(emailSignupSchema) });
  const phoneForm = useForm<PhoneInput>({ resolver: zodResolver(phoneSchema) });
  const otpForm = useForm<OtpInput>({ resolver: zodResolver(otpSchema) });

  const handleTurnstile = useCallback((token: string) => setTurnstileToken(token), []);

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

  async function handleGoogleSignup() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error("Unable to sign in with Google. Please try again.");
    setLoading(false);
  }

  async function onEmailSubmit(data: EmailSignupInput) {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { newsletter },
      },
    });
    if (error) {
      toast.error("Unable to create account. Please try again.");
      setLoading(false);
      return;
    }
    toast.success("Check your email for a confirmation link.");
    setStep("verify-email");
    setLoading(false);
  }

  async function onPhoneSubmit(data: PhoneInput) {
    setLoading(true);
    // Send OTP via server-side route (applies rate limiting + Turnstile)
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: data.phone, turnstileToken }),
    });
    if (res.ok) {
      setPhoneValue(data.phone);
      setStep("otp");
      toast.success("Verification code sent!");
    } else {
      const err = await res.json().catch(() => null);
      toast.error(err?.error || "Failed to send code. Please try again.");
    }
    setLoading(false);
  }

  async function onOtpSubmit(data: OtpInput) {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: phoneValue,
      token: data.token,
      type: "phone_change",
    });
    if (error) {
      toast.error("Invalid or expired code. Please try again.");
      setLoading(false);
    } else {
      toast.success("Phone verified!");
      window.location.assign("/chat");
    }
  }

  const stepLabels: Record<Step, { title: string; desc: string }> = {
    email: { title: "Create Account", desc: "Start learning the science of influence" },
    "verify-email": { title: "Verify Your Email", desc: "We sent a confirmation link to your inbox" },
    phone: { title: "Verify Your Phone", desc: "We need your phone number to complete signup" },
    otp: { title: "Enter Verification Code", desc: `Code sent to ${phoneValue}` },
    done: { title: "You're All Set", desc: "Your account is ready" },
  };

  const current = stepLabels[step];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{current.title}</CardTitle>
            <CardDescription>{current.desc}</CardDescription>
            {step !== "email" && step !== "done" && (
              <div className="mx-auto mt-4 flex gap-1.5">
                {["email", "verify-email", "phone", "otp"].map((s, i) => (
                  <div
                    key={s}
                    className={`h-1.5 w-8 rounded-full ${
                      i <= ["email", "verify-email", "phone", "otp"].indexOf(step)
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Step 1: Email + Password */}
            {step === "email" && (
              <>
                <Button variant="outline" className="w-full" onClick={handleGoogleSignup} disabled={loading}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-xs text-muted-foreground">or</span>
                </div>

                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <div>
                    <Input type="email" placeholder="Email address" {...emailForm.register("email")} />
                    {emailForm.formState.errors.email && <p className="mt-1 text-xs text-destructive">{emailForm.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <Input type="password" placeholder="Password (min 6 characters)" {...emailForm.register("password")} />
                    {emailForm.formState.errors.password && <p className="mt-1 text-xs text-destructive">{emailForm.formState.errors.password.message}</p>}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm text-muted-foreground">Send me tips on influence & persuasion</span>
                  </label>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Continue"}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link>
                </p>
              </>
            )}

            {/* Step 2: Verify email prompt */}
            {step === "verify-email" && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  Click the link in your email to verify, then continue to phone verification.
                </p>
                <Button className="w-full" onClick={() => setStep("phone")}>
                  I&apos;ve Verified — Continue to Phone
                </Button>
              </div>
            )}

            {/* Step 3: Phone number */}
            {step === "phone" && (
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                <div>
                  <Input type="tel" placeholder="+12125551234" {...phoneForm.register("phone")} />
                  {phoneForm.formState.errors.phone && <p className="mt-1 text-xs text-destructive">{phoneForm.formState.errors.phone.message}</p>}
                </div>
                <Turnstile onVerify={handleTurnstile} />
                <Button type="submit" className="w-full" disabled={loading || !turnstileToken}>
                  {loading ? "Sending code..." : "Send Verification Code"}
                </Button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling || loading}
                  className="w-full text-sm text-destructive hover:text-destructive/80 disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel signup"}
                </button>
              </form>
            )}

            {/* Step 4: OTP */}
            {step === "otp" && (
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                <div>
                  <Input type="text" placeholder="6-digit code" maxLength={6} className="text-center text-2xl tracking-widest" {...otpForm.register("token")} />
                  {otpForm.formState.errors.token && <p className="mt-1 text-xs text-destructive">{otpForm.formState.errors.token.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verifying..." : "Verify Phone"}
                </Button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling || loading}
                  className="w-full text-sm text-destructive hover:text-destructive/80 disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel signup"}
                </button>
              </form>
            )}

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
