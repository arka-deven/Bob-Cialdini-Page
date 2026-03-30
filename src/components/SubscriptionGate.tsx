"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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

    const res = await fetch("/api/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      const data = await res.json();
      setCurrentSessions(data.sessionsUsed);
      const left = FREE_SESSION_LIMIT - data.sessionsUsed;
      if (left > 0 && left <= 2) {
        toast.info(`${left} free session${left !== 1 ? "s" : ""} remaining`);
      }
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
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">You&apos;ve Used Your Free Sessions</h2>
          <p className="mt-3 text-muted-foreground">
            Upgrade to Pro for unlimited chat and voice access to Dr. Cialdini AI.
          </p>
          <Link href="/pricing" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {!isSubscribed && (
        <div className="flex items-center justify-center gap-3 border-b border-primary/20 bg-primary/5 px-6 py-2">
          <Badge variant="secondary" className="text-xs">
            {remaining} free session{remaining !== 1 ? "s" : ""} left
          </Badge>
          <Link href="/pricing" className="text-sm font-medium text-primary hover:underline">
            Upgrade for unlimited access
          </Link>
        </div>
      )}
      {children}
    </div>
  );
}
