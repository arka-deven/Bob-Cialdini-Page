"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

interface ChatClientProps {
  isSubscribed: boolean;
  messagesUsed: number;
  messagesLimit: number;
  voiceSecondsUsed: number;
  voiceSecondsLimit: number;
  chatUrl: string;
  voiceUrl: string;
  userId: string;
}

export default function ChatClient({
  isSubscribed,
  messagesUsed: initialMessagesUsed,
  messagesLimit,
  voiceSecondsUsed: initialVoiceSeconds,
  voiceSecondsLimit,
  chatUrl: initialChatUrl,
  voiceUrl: initialVoiceUrl,
}: ChatClientProps) {
  const [mode, setMode] = useState<"chat" | "voice">("chat");
  const [messagesUsed, setMessagesUsed] = useState(initialMessagesUsed);
  const [voiceSecondsUsed, setVoiceSecondsUsed] = useState(initialVoiceSeconds);
  const [chatUrl, setChatUrl] = useState(initialChatUrl);
  const [voiceUrl, setVoiceUrl] = useState(initialVoiceUrl);
  const [voiceActive, setVoiceActive] = useState(false);
  const voiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const messagesRemaining = isSubscribed ? Infinity : messagesLimit - messagesUsed;
  const voiceSecondsRemaining = isSubscribed ? Infinity : voiceSecondsLimit - voiceSecondsUsed;

  const chatLocked = !isSubscribed && messagesRemaining <= 0 && !chatUrl;
  const voiceLocked = !isSubscribed && voiceSecondsRemaining <= 0 && !voiceUrl;

  // Listen for postMessage from Delphi iframe to count messages
  useEffect(() => {
    if (isSubscribed || mode !== "chat") return;

    const ALLOWED_ORIGINS = [
      "https://embed.delphi.ai",
      "https://www.delphi.ai",
      "https://delphi.ai",
    ];

    function handleMessage(event: MessageEvent) {
      if (
        ALLOWED_ORIGINS.includes(event.origin) &&
        (event.data?.type === "user_message" ||
          event.data?.type === "message_sent" ||
          event.data?.event === "message")
      ) {
        consumeMessageCredit();
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isSubscribed, mode, messagesUsed]);

  const consumeMessageCredit = useCallback(async () => {
    if (isSubscribed) return;

    const res = await fetch("/api/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "message" }),
    });

    if (res.status === 429) {
      toast.error("Slow down — too many requests.");
      return;
    }

    const data = await res.json();
    if (!data.allowed) {
      setMessagesUsed(messagesLimit);
      setChatUrl("");
      toast.error("You've used all 3 free messages. Upgrade to continue.");
    } else {
      setMessagesUsed(messagesLimit - data.remaining);
      if (data.remaining <= 1 && data.remaining > 0) {
        toast.warning(`${data.remaining} free message${data.remaining === 1 ? "" : "s"} left`);
      }
    }
  }, [isSubscribed, messagesLimit]);

  // Voice timer
  function startVoice() {
    if (voiceLocked) return;
    setVoiceActive(true);

    voiceTimerRef.current = setInterval(() => {
      setVoiceSecondsUsed((prev) => {
        const next = prev + 1;
        if (!isSubscribed && next >= voiceSecondsLimit) {
          stopVoice(next);
          toast.error("Voice call time is up. Upgrade for unlimited calls.");
        }
        // Sync with server every 15 seconds
        if (next % 15 === 0) {
          fetch("/api/usage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "voice", voiceSeconds: 15 }),
          });
        }
        return next;
      });
    }, 1000);
  }

  function stopVoice(finalSeconds?: number) {
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }

    // Final sync
    const elapsed = (finalSeconds ?? voiceSecondsUsed) - initialVoiceSeconds;
    if (elapsed > 0) {
      fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "voice", voiceSeconds: elapsed }),
      });
    }

    if (!isSubscribed && (finalSeconds ?? voiceSecondsUsed) >= voiceSecondsLimit) {
      setVoiceUrl("");
    }

    setVoiceActive(false);
  }

  useEffect(() => {
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, []);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const currentLocked = mode === "chat" ? chatLocked : voiceLocked;

  return (
    <div className="flex flex-1 flex-col">
      {/* Usage bar */}
      {!isSubscribed && (
        <div className="flex items-center justify-center gap-4 border-b border-primary/20 bg-primary/5 px-6 py-2">
          {mode === "chat" ? (
            <Badge variant="secondary" className="text-xs">
              {messagesRemaining > 0
                ? `${messagesRemaining} free message${messagesRemaining !== 1 ? "s" : ""} left`
                : "No messages remaining"}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              {voiceSecondsRemaining > 0
                ? `${formatTime(voiceSecondsRemaining)} voice time left`
                : "Voice time used up"}
            </Badge>
          )}
          <Link
            href="/pricing"
            className="text-xs font-medium text-primary hover:underline"
          >
            Upgrade for unlimited
          </Link>
        </div>
      )}

      {currentLocked ? (
        /* Paywall */
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-8 w-8 text-primary"
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
            <h2 className="text-2xl font-bold text-foreground">
              {mode === "chat"
                ? "You've Used Your 3 Free Messages"
                : "Your 3-Minute Voice Call Has Ended"}
            </h2>
            <p className="mt-3 text-muted-foreground">
              Upgrade to Pro for unlimited {mode === "chat" ? "messages" : "voice calls"} with Dr. Cialdini AI.
            </p>
            <Link
              href="/pricing"
              className={cn(buttonVariants({ size: "lg" }), "mt-8")}
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      ) : (
        /* Chat/Voice UI */
        <div className="flex flex-1 flex-col px-4 py-4 sm:px-6">
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4">
            {/* Mode toggle */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex rounded-lg bg-muted p-1">
                <Button
                  variant={mode === "chat" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setMode("chat")}
                  className="gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat
                </Button>
                <Button
                  variant={mode === "voice" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setMode("voice")}
                  className="gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Voice
                </Button>
              </div>

              {/* Voice timer controls */}
              {mode === "voice" && !isSubscribed && (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">
                    {formatTime(voiceSecondsUsed)} / {formatTime(voiceSecondsLimit)}
                  </span>
                  {!voiceActive ? (
                    <Button size="xs" onClick={startVoice} disabled={voiceSecondsRemaining <= 0}>
                      Start Timer
                    </Button>
                  ) : (
                    <Button size="xs" variant="destructive" onClick={() => stopVoice()}>
                      Stop
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Iframe */}
            {mode === "chat" && chatUrl ? (
              <iframe
                ref={iframeRef}
                src={chatUrl}
                className="h-full w-full flex-1 rounded-xl border border-border"
                allow="microphone; camera"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                title="Chat with Dr. Cialdini AI"
              />
            ) : mode === "voice" && voiceUrl ? (
              <iframe
                src={voiceUrl}
                className="h-full w-full flex-1 rounded-xl border border-border"
                allow="microphone; camera"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                title="Voice call with Dr. Cialdini AI"
              />
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border">
                <p className="text-sm text-muted-foreground">
                  {mode === "chat" ? "Chat" : "Voice"} embed not configured
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
