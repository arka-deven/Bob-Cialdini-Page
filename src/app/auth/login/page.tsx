"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    setLoading(false);
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/chat";
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) setError(error.message);
    else setOtpSent(true);
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/chat";
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-(--text-primary)">Welcome Back</h1>
            <p className="mt-2 text-(--text-muted)">Sign in to continue your conversation</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-500">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-(--border) bg-(--card-bg) px-4 py-3 text-sm font-medium text-(--text-primary) transition-colors hover:bg-(--bg-secondary) disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-(--border)" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-(--bg-primary) px-4 text-(--text-muted)">or</span>
            </div>
          </div>

          <div className="flex rounded-lg bg-(--bg-secondary) p-1">
            <button
              onClick={() => { setMode("email"); setError(""); }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "email" ? "bg-(--card-bg) text-(--text-primary) shadow-sm" : "text-(--text-muted) hover:text-(--text-primary)"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => { setMode("phone"); setError(""); }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "phone" ? "bg-(--card-bg) text-(--text-primary) shadow-sm" : "text-(--text-muted) hover:text-(--text-primary)"
              }`}
            >
              Phone
            </button>
          </div>

          {mode === "email" ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-(--border) bg-(--bg-secondary) px-4 py-3 text-(--text-primary) placeholder:text-(--text-muted) focus:border-yellow focus:outline-none focus:ring-1 focus:ring-yellow"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-(--border) bg-(--bg-secondary) px-4 py-3 text-(--text-primary) placeholder:text-(--text-muted) focus:border-yellow focus:outline-none focus:ring-1 focus:ring-yellow"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-yellow py-3 text-sm font-medium text-ink transition-colors hover:bg-gold disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : otpSent ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-(--text-muted)">Enter the code sent to {phone}</p>
              <input
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                className="w-full rounded-lg border border-(--border) bg-(--bg-secondary) px-4 py-3 text-center text-2xl tracking-widest text-(--text-primary) placeholder:text-sm placeholder:tracking-normal placeholder:text-(--text-muted) focus:border-yellow focus:outline-none focus:ring-1 focus:ring-yellow"
              />
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-yellow py-3 text-sm font-medium text-ink transition-colors hover:bg-gold disabled:opacity-50">
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-lg border border-(--border) bg-(--bg-secondary) px-4 py-3 text-(--text-primary) placeholder:text-(--text-muted) focus:border-yellow focus:outline-none focus:ring-1 focus:ring-yellow"
              />
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-yellow py-3 text-sm font-medium text-ink transition-colors hover:bg-gold disabled:opacity-50">
                {loading ? "Sending code..." : "Send Verification Code"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-(--text-muted)">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-yellow hover:text-gold">Sign up</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
