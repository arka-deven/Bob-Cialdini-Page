"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { emailSignupSchema, phoneSchema, otpSchema, type EmailSignupInput, type PhoneInput, type OtpInput } from "@/lib/validations";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const supabase = createClient();

  const emailForm = useForm<EmailSignupInput>({ resolver: zodResolver(emailSignupSchema) });
  const phoneForm = useForm<PhoneInput>({ resolver: zodResolver(phoneSchema) });
  const otpForm = useForm<OtpInput>({ resolver: zodResolver(otpSchema) });

  async function handleGoogleSignup() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
    setLoading(false);
  }

  async function onEmailSubmit(data: EmailSignupInput) {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      ...data,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
    else toast.success("Check your email for a confirmation link.");
    setLoading(false);
  }

  async function onPhoneSubmit(data: PhoneInput) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: data.phone });
    if (error) toast.error(error.message);
    else { setOtpSent(true); setPhoneValue(data.phone); toast.success("Code sent!"); }
    setLoading(false);
  }

  async function onOtpSubmit(data: OtpInput) {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone: phoneValue, token: data.token, type: "sms" });
    if (error) { toast.error(error.message); setLoading(false); }
    else { window.location.href = "/chat"; }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Start learning the science of influence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <div className="flex rounded-lg bg-muted p-1">
              <button onClick={() => setMode("email")} className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === "email" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                Email
              </button>
              <button onClick={() => setMode("phone")} className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === "phone" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                Phone
              </button>
            </div>

            {mode === "email" ? (
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <div>
                  <Input type="email" placeholder="Email address" {...emailForm.register("email")} />
                  {emailForm.formState.errors.email && <p className="mt-1 text-xs text-destructive">{emailForm.formState.errors.email.message}</p>}
                </div>
                <div>
                  <Input type="password" placeholder="Password (min 6 characters)" {...emailForm.register("password")} />
                  {emailForm.formState.errors.password && <p className="mt-1 text-xs text-destructive">{emailForm.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            ) : otpSent ? (
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                <p className="text-sm text-muted-foreground">Enter the code sent to {phoneValue}</p>
                <div>
                  <Input type="text" placeholder="6-digit code" maxLength={6} className="text-center text-2xl tracking-widest" {...otpForm.register("token")} />
                  {otpForm.formState.errors.token && <p className="mt-1 text-xs text-destructive">{otpForm.formState.errors.token.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </Button>
              </form>
            ) : (
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                <div>
                  <Input type="tel" placeholder="+1 (555) 000-0000" {...phoneForm.register("phone")} />
                  {phoneForm.formState.errors.phone && <p className="mt-1 text-xs text-destructive">{phoneForm.formState.errors.phone.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending code..." : "Send Verification Code"}
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
