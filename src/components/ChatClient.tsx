"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

function ChatInput() {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      toast.success(`Attached: ${file.name}`);
    }
  }

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error("Voice input not supported in this browser"); return; }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setText((prev) => (prev ? prev + " " : "") + transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  return (
    <div className="border-t border-border px-4 py-3">
      {fileName && (
        <div className="mx-auto mb-2 flex max-w-2xl items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          <span className="truncate">{fileName}</span>
          <button onClick={() => { setFileName(""); if (fileRef.current) fileRef.current.value = ""; }} className="ml-auto shrink-0 hover:text-foreground">&times;</button>
        </div>
      )}
      <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5">
        <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileChange} />
        <button onClick={() => fileRef.current?.click()} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Attach file">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button onClick={toggleVoice} className={`shrink-0 transition-colors ${listening ? "text-red-500 animate-pulse" : "text-muted-foreground hover:text-foreground"}`} aria-label="Voice input">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
        </button>
      </div>
    </div>
  );
}

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
  const currentLocked = mode === "chat" ? chatLocked : voiceLocked;
  const hasEmbed = (mode === "chat" && chatUrl) || (mode === "voice" && voiceUrl);

  // --- SSO ---
  useEffect(() => {
    fetch("/api/delphi/token").then((r) => r.json()).then((d) => { if (d.token) setSsoToken(d.token); }).catch(() => {});
  }, []);

  const handleIframeLoad = useCallback((iframe: HTMLIFrameElement | null) => {
    if (!iframe || !ssoToken) return;
    iframe.contentWindow?.postMessage({ type: "sso_login", token: ssoToken }, "https://embed.delphi.ai");
  }, [ssoToken]);

  useEffect(() => {
    if (ssoToken) { handleIframeLoad(chatIframeRef.current); handleIframeLoad(voiceIframeRef.current); }
  }, [ssoToken, handleIframeLoad]);

  // --- Message counting ---
  useEffect(() => {
    if (isSubscribed || mode !== "chat") return;
    const ORIGINS = ["https://embed.delphi.ai", "https://www.delphi.ai", "https://delphi.ai"];
    function handle(e: MessageEvent) {
      if (ORIGINS.includes(e.origin) && (e.data?.type === "user_message" || e.data?.type === "message_sent" || e.data?.event === "message")) consumeCredit();
    }
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, [isSubscribed, mode, messagesUsed]);

  const consumeCredit = useCallback(async () => {
    if (isSubscribed) return;
    const res = await fetch("/api/usage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "message" }) });
    if (res.status === 429) { toast.error("Slow down."); return; }
    const data = await res.json();
    if (!data.allowed) { setMessagesUsed(messagesLimit); setChatUrl(""); toast.error("You've used all 3 free messages."); }
    else { setMessagesUsed(messagesLimit - data.remaining); if (data.remaining === 1) toast.warning("1 free message left"); }
  }, [isSubscribed, messagesLimit]);

  // --- Voice tracking ---
  useEffect(() => {
    if (isSubscribed || mode !== "voice" || voiceLocked) return;
    voiceIntervalRef.current = setInterval(() => {
      fetch("/api/usage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "voice", voiceSeconds: 15 }) })
        .then(async (r) => { if (r.ok) { const d = await r.json(); if (!d.allowed) { setVoiceSecondsUsed(voiceSecondsLimit); setVoiceUrl(""); toast.error("Voice time is up."); } else setVoiceSecondsUsed(voiceSecondsLimit - d.remaining); } });
    }, 15000);
    return () => { if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current); };
  }, [isSubscribed, mode, voiceLocked, voiceSecondsLimit]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar overlay (mobile) */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-all duration-300 ease-in-out lg:relative lg:z-auto ${sidebarOpen ? "translate-x-0 lg:w-64" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:border-0 lg:overflow-hidden"}`}>
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="text-sm font-semibold text-foreground">Sessions</span>
          <button onClick={() => setSidebarOpen(false)} className="rounded-md p-1 text-muted-foreground hover:text-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <button className="mb-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Chat
          </button>
          <p className="mt-4 px-2 text-center text-xs text-muted-foreground">
            Past sessions appear here once connected.
          </p>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center border-b border-border px-4 py-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          </button>

          <div className="flex flex-1 items-center justify-center gap-4">
            <div className="flex rounded-lg bg-muted p-1">
              <Button variant={mode === "chat" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("chat")} className="gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                Chat
              </Button>
              <Button variant={mode === "voice" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("voice")} className="gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Voice
              </Button>
            </div>
          </div>

        </div>

        {/* Content */}
        {currentLocked ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {mode === "chat" ? "You've Used Your 3 Free Messages" : "Your 3-Minute Voice Call Has Ended"}
              </h2>
              <p className="mt-3 text-muted-foreground">Upgrade to Pro for unlimited {mode === "chat" ? "messages" : "voice calls"}.</p>
              <Link href="/pricing" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>Upgrade to Pro</Link>
            </div>
          </div>
        ) : hasEmbed ? (
          <div className="flex flex-1 flex-col">
            {mode === "chat" && chatUrl ? (
              <iframe ref={chatIframeRef} src={chatUrl} className="h-full w-full flex-1" allow="microphone; camera" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" title="Chat" onLoad={() => handleIframeLoad(chatIframeRef.current)} />
            ) : (
              <iframe ref={voiceIframeRef} src={voiceUrl} className="h-full w-full flex-1" allow="microphone; camera" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" title="Voice" onLoad={() => handleIframeLoad(voiceIframeRef.current)} />
            )}
          </div>
        ) : mode === "chat" ? (
          /* Chat placeholder */
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col items-center justify-center px-6">
              <div className="relative mb-3 h-14 w-14 overflow-hidden rounded-full border-2 border-primary/20">
                <Image src="/robert-cialdini.jpg" alt="Dr. Cialdini" fill className="object-cover object-top" sizes="56px" />
              </div>
              <p className="text-sm font-medium text-foreground">Dr. Cialdini</p>
              <p className="mt-1 text-xs text-muted-foreground">Ask me anything about influence and persuasion</p>
            </div>
            {!isSubscribed && (
              <div className="flex items-center justify-center gap-3 px-4 pt-2">
                <Badge variant="secondary" className="text-xs">
                  {messagesRemaining > 0 ? `${messagesRemaining}/${messagesLimit} messages` : "0 messages left"}
                </Badge>
                <Link href="/pricing" className="text-xs font-medium text-primary hover:underline">Upgrade</Link>
              </div>
            )}
            <ChatInput />
          </div>
        ) : (
          /* Voice placeholder */
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <div className="relative">
              {/* Pulsing rings */}
              <div className="absolute inset-0 -m-4 animate-ping rounded-full bg-primary/10" style={{ animationDuration: "2s" }} />
              <div className="absolute inset-0 -m-8 animate-ping rounded-full bg-primary/5" style={{ animationDuration: "3s" }} />
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-primary/30 shadow-lg shadow-primary/10">
                <Image src="/robert-cialdini.jpg" alt="Dr. Cialdini" fill className="object-cover object-top" sizes="96px" />
              </div>
            </div>
            <p className="mt-6 text-lg font-semibold text-foreground">Talk to Dr. Cialdini</p>
            <p className="mt-1 text-sm text-muted-foreground">Tap to start a voice conversation about persuasion</p>
            {!isSubscribed && <p className="mt-3 text-xs text-muted-foreground">3-minute free call included</p>}
          </div>
        )}
      </div>
    </div>
  );
}
