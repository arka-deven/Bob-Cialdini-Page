"use client";

import { useState } from "react";
import { DELPHI_CHAT_URL, DELPHI_VOICE_URL } from "@/lib/constants";

export default function DelphiEmbed() {
  const [mode, setMode] = useState<"chat" | "voice">("chat");

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex items-center justify-center">
        <div className="flex rounded-lg bg-(--bg-secondary) p-1">
          <button
            onClick={() => setMode("chat")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "chat"
                ? "bg-(--card-bg) text-(--text-primary) shadow-sm"
                : "text-(--text-muted) hover:text-(--text-primary)"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </button>
          <button
            onClick={() => setMode("voice")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "voice"
                ? "bg-(--card-bg) text-(--text-primary) shadow-sm"
                : "text-(--text-muted) hover:text-(--text-primary)"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Voice Call
          </button>
        </div>
      </div>

      {/* Embed */}
      <iframe
        key={mode}
        src={mode === "chat" ? DELPHI_CHAT_URL : DELPHI_VOICE_URL}
        className="h-full w-full flex-1 rounded-xl border border-(--border)"
        allow="microphone; camera"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        title={mode === "chat" ? "Chat with Dr. Cialdini AI" : "Voice call with Dr. Cialdini AI"}
      />
    </div>
  );
}
