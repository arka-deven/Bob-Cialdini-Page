"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  emailSignupSchema,
  profilePhoneSchema,
  phoneSchema,
  otpSchema,
  type EmailSignupInput,
  type ProfilePhoneInput,
  type PhoneInput,
  type OtpInput,
} from "@/lib/validations";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Step = "credentials" | "phone-collect" | "phone-signup" | "phone-otp" | "done";

export default function SignupPage() {
  const [step, setStep] = useState<Step>("credentials");
  const [loading, setLoading] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const supabase = createClient();

  const emailForm = useForm<EmailSignupInput>({ resolver: zodResolver(emailSignupSchema) });
  const profilePhoneForm = useForm<ProfilePhoneInput>({ resolver: zodResolver(profilePhoneSchema) });
  const phoneSignupForm = useForm<PhoneInput>({ resolver: zodResolver(phoneSchema) });
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
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          newsletter: data.newsletter ?? false,
        },
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Check your email for a confirmation link.");
    setStep("phone-collect");
    setLoading(false);
  }

  async function onProfilePhoneSubmit(data: ProfilePhoneInput) {
    setLoading(true);
    // Store phone in user metadata via update
    const { error } = await supabase.auth.updateUser({
      data: { phone_number: data.phone },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Phone number saved!");
    }
    setStep("done");
    setLoading(false);
  }

  function skipPhone() {
    setStep("done");
  }

  // Phone-first signup flow
  async function onPhoneSignupSubmit(data: PhoneInput) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: data.phone });
    if (error) toast.error(error.message);
    else { setPhoneValue(data.phone); setStep("phone-otp"); toast.success("Code sent!"); }
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
            <CardTitle className="text-2xl">
              {step === "phone-collect" ? "One More Thing" : step === "done" ? "You're All Set" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {step === "phone-collect"
                ? "Add your phone number so we can reach you"
                : step === "done"
                ? "Check your email to confirm, then start chatting"
                : "Start learning the science of influence"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Step: Done */}
            {step === "done" && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a confirmation link to your email. Click it to activate your account and start chatting with Dr. Cialdini AI.
                </p>
                <Link href="/auth/login" className="inline-block text-sm font-medium text-primary hover:underline">
                  Go to Sign In
                </Link>
              </div>
            )}

            {/* Step: Collect phone after email signup */}
            {step === "phone-collect" && (
              <form onSubmit={profilePhoneForm.handleSubmit(onProfilePhoneSubmit)} className="space-y-4">
                <div>
                  <Input type="tel" placeholder="+1 (555) 000-0000" {...profilePhoneForm.register("phone")} />
                  {profilePhoneForm.formState.errors.phone && (
                    <p className="mt-1 text-xs text-destructive">{profilePhoneForm.formState.errors.phone.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : "Save Phone Number"}
                </Button>
                <button type="button" onClick={skipPhone} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
                  Skip for now
                </button>
              </form>
            )}

            {/* Step: Credentials (email + password + newsletter) */}
            {step === "credentials" && (
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

                <div className="flex rounded-lg bg-muted p-1">
                  <button onClick={() => emailForm.reset()} className="flex-1 rounded-md bg-card py-2 text-sm font-medium text-foreground shadow-sm">
                    Email
                  </button>
                  <button onClick={() => setStep("phone-signup" as Step)} className="flex-1 rounded-md py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Phone
                  </button>
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
                      defaultChecked
                      {...emailForm.register("newsletter")}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm text-muted-foreground">Send me tips on influence & persuasion</span>
                  </label>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link>
                </p>
              </>
            )}

            {/* Phone-first signup */}
            {step === "phone-signup" && (
              <>
                <div className="flex rounded-lg bg-muted p-1">
                  <button onClick={() => setStep("credentials")} className="flex-1 rounded-md py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Email
                  </button>
                  <button className="flex-1 rounded-md bg-card py-2 text-sm font-medium text-foreground shadow-sm">
                    Phone
                  </button>
                </div>

                <form onSubmit={phoneSignupForm.handleSubmit(onPhoneSignupSubmit)} className="space-y-4">
                  <div>
                    <Input type="tel" placeholder="+1 (555) 000-0000" {...phoneSignupForm.register("phone")} />
                    {phoneSignupForm.formState.errors.phone && <p className="mt-1 text-xs text-destructive">{phoneSignupForm.formState.errors.phone.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending code..." : "Send Verification Code"}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link>
                </p>
              </>
            )}

            {/* Phone OTP verification */}
            {step === "phone-otp" && (
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
            )}

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
