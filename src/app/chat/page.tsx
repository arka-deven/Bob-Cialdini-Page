import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FREE_MESSAGE_LIMIT, FREE_VOICE_SECONDS } from "@/lib/constants";
import Header from "@/components/Header";
import ChatClient from "@/components/ChatClient";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, messages_used, voice_seconds_used")
    .eq("id", user.id)
    .single();

  const isSubscribed = profile?.subscription_status === "active";
  const messagesUsed = profile?.messages_used ?? 0;
  const voiceSecondsUsed = profile?.voice_seconds_used ?? 0;

  // Server-side gating: only pass embed URLs if user has credits or is subscribed
  const hasMessageCredits = isSubscribed || messagesUsed < FREE_MESSAGE_LIMIT;
  const hasVoiceCredits = isSubscribed || voiceSecondsUsed < FREE_VOICE_SECONDS;

  const chatUrl = hasMessageCredits ? (process.env.NEXT_PUBLIC_DELPHI_CHAT_URL || "") : "";
  const voiceUrl = hasVoiceCredits ? (process.env.NEXT_PUBLIC_DELPHI_VOICE_URL || "") : "";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <ChatClient
          isSubscribed={isSubscribed}
          messagesUsed={messagesUsed}
          messagesLimit={FREE_MESSAGE_LIMIT}
          voiceSecondsUsed={voiceSecondsUsed}
          voiceSecondsLimit={FREE_VOICE_SECONDS}
          chatUrl={chatUrl}
          voiceUrl={voiceUrl}
          userId={user.id}
        />
      </main>
    </div>
  );
}
