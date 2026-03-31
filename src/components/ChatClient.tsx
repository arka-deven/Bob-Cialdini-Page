"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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
  userEmail: string;
}

export default function ChatClient({
  isSubscribed,
  messagesUsed: initialMessagesUsed,
  messagesLimit,
  voiceSecondsUsed: initialVoiceSeconds,
  voiceSecondsLimit,
  chatUrl: initialChatUrl,
  voiceUrl: initialVoiceUrl,
  userEmail,
}: ChatClientProps) {
  const [mode, setMode] = useState<"chat" | "voice">("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messagesUsed, setMessagesUsed] = useState(initialMessagesUsed);
  const [voiceSecondsUsed, setVoiceSecondsUsed] = useState(initialVoiceSeconds);
  const [chatUrl, setChatUrl] = useState(initialChatUrl);
  const [voiceUrl, setVoiceUrl] = useState(initialVoiceUrl);
  const [ssoToken, setSsoToken] = useState<string | null>(null);
  const chatIframeRef = useRef<HTMLIFrameElement>(null);
  const voiceIframeRef = useRef<HTMLIFrameElement>(null);
  const voiceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const messagesRemaining = isSubscribed ? Infinity : messagesLimit - messagesUsed;
  const voiceSecondsRemaining = isSubscribed ? Infinity : voiceSecondsLimit - voiceSecondsUsed;

  const chatLocked = !isSubscribed && messagesRemaining <= 0 && !chatUrl;
  const voiceLocked = !isSubscribed && voiceSecondsRemaining <= 0 && !voiceUrl;

  // Fetch Delphi SSO token on mount
  useEffect(() => {
    fetch("/api/delphi/token")
      .then((res) => res.json())
      .then((data) => {
        if (data.token) setSsoToken(data.token);
      })
      .catch(() => {});
  }, []);

  const handleIframeLoad = useCallback(
    (iframe: HTMLIFrameElement | null) => {
      if (!iframe || !ssoToken) return;
      iframe.contentWindow?.postMessage(
        { type: "sso_login", token: ssoToken },
        "https://embed.delphi.ai"
      );
    },
    [ssoToken]
  );

  useEffect(() => {
    if (ssoToken) {
      handleIframeLoad(chatIframeRef.current);
      handleIframeLoad(voiceIframeRef.current);
    }
  }, [ssoToken, handleIframeLoad]);

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

  // Auto voice tracking
  useEffect(() => {
    if (isSubscribed || mode !== "voice" || voiceLocked) return;

    voiceIntervalRef.current = setInterval(() => {
      fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "voice", voiceSeconds: 15 }),
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (!data.allowed) {
            setVoiceSecondsUsed(voiceSecondsLimit);
            setVoiceUrl("");
            toast.error("Voice call time is up. Upgrade for unlimited calls.");
          } else {
            setVoiceSecondsUsed(voiceSecondsLimit - data.remaining);
          }
        }
      });
    }, 15000);

    return () => {
      if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current);
    };
  }, [isSubscribed, mode, voiceLocked, voiceSecondsLimit]);

  const currentLocked = mode === "chat" ? chatLocked : voiceLocked;
  const hasEmbed = (mode === "chat" && chatUrl) || (mode === "voice" && voiceUrl);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-sm font-semibold text-foreground">Chat History</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Session list */}
          <div className="flex-1 overflow-y-auto p-3">
            <p className="px-2 py-8 text-center text-xs text-muted-foreground">
              Your past sessions will appear here once Delphi is connected.
            </p>
          </div>

          {/* Sidebar footer — user info */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-foreground">{userEmail}</p>
                <p className="text-xs text-muted-foreground">
                  {isSubscribed ? "Pro" : "Free plan"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Toggle sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </button>

            {/* Mode toggle */}
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
          </div>

          {/* Right side — usage + upgrade */}
          {!isSubscribed && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                {mode === "chat"
                  ? messagesRemaining > 0
                    ? `${messagesRemaining}/${messagesLimit} messages`
                    : "0 messages left"
                  : voiceSecondsRemaining > 0
                  ? "Voice active"
                  : "Voice time up"}
              </Badge>
              <Link
                href="/pricing"
                className="text-xs font-medium text-primary hover:underline"
              >
                Upgrade
              </Link>
            </div>
          )}
        </div>

        {currentLocked ? (
          /* Paywall */
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
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
              <Link href="/pricing" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
                Upgrade to Pro
              </Link>
            </div>
          </div>
        ) : hasEmbed ? (
          /* Delphi iframe */
          <div className="flex flex-1 flex-col">
            {mode === "chat" && chatUrl ? (
              <iframe
                ref={chatIframeRef}
                src={chatUrl}
                className="h-full w-full flex-1"
                allow="microphone; camera"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                title="Chat with Dr. Cialdini AI"
                onLoad={() => handleIframeLoad(chatIframeRef.current)}
              />
            ) : (
              <iframe
                ref={voiceIframeRef}
                src={voiceUrl}
                className="h-full w-full flex-1"
                allow="microphone; camera"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                title="Voice call with Dr. Cialdini AI"
                onLoad={() => handleIframeLoad(voiceIframeRef.current)}
              />
            )}
          </div>
        ) : (
          /* Placeholder chat UI when Delphi not configured */
          <div className="flex flex-1 flex-col">
            {/* Chat area */}
            <div className="flex flex-1 flex-col items-center justify-center px-6">
              <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-full border-2 border-border">
                <Image
                  src="/robert-cialdini.jpg"
                  alt="Dr. Robert Cialdini"
                  fill
                  className="object-cover object-top"
                  sizes="64px"
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Dr. Cialdini AI</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "chat"
                  ? "Ask me anything about influence and persuasion."
                  : "Start a voice conversation about the science of influence."}
              </p>
            </div>

            {/* Input bar placeholder */}
            <div className="border-t border-border p-4">
              <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3">
                <button className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Attach file">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                  </svg>
                </button>
                <span className="flex-1 text-sm text-muted-foreground">Type...</span>
                <button className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Voice input">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>
              {!isSubscribed && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {messagesRemaining} Messages Remaining
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
