"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FREE_SESSION_LIMIT } from "@/lib/constants";

export default function SubscriptionGate({
  isSubscribed,
  sessionsUsed,
  userId,
  children,
}: {
  isSubscribed: boolean;
  sessionsUsed: number;
  userId: string;
  children: React.ReactNode;
}) {
  const [currentSessions, setCurrentSessions] = useState(sessionsUsed);
  const [sessionStarted, setSessionStarted] = useState(false);
  const remaining = FREE_SESSION_LIMIT - currentSessions;
  const isLocked = !isSubscribed && remaining <= 0;

  const startSession = useCallback(async () => {
    if (isSubscribed || sessionStarted) return;
    setSessionStarted(true);

    // Increment session count server-side
    const res = await fetch("/api/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      const data = await res.json();
      setCurrentSessions(data.sessionsUsed);
    }
  }, [isSubscribed, sessionStarted, userId]);

  useEffect(() => {
    if (!isLocked && !isSubscribed && !sessionStarted) {
      startSession();
    }
  }, [isLocked, isSubscribed, sessionStarted, startSession]);

  if (isLocked) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow/10">
            <svg
              className="h-8 w-8 text-yellow"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-(--text-primary)">
            You&apos;ve Used Your Free Sessions
          </h2>
          <p className="mt-3 text-(--text-muted)">
            Upgrade to Pro for unlimited chat and voice access to Dr. Cialdini AI.
          </p>
          <Link
            href="/pricing"
            className="mt-8 inline-block rounded-lg bg-yellow px-8 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {!isSubscribed && (
        <div className="border-b border-yellow/20 bg-yellow/5 px-6 py-2 text-center text-sm text-yellow">
          {remaining} free session{remaining !== 1 ? "s" : ""} remaining.{" "}
          <Link href="/pricing" className="font-medium underline hover:text-gold">
            Upgrade for unlimited access
          </Link>
        </div>
      )}
      {children}
    </div>
  );
}
