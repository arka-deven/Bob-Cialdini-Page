import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import DelphiEmbed from "@/components/DelphiEmbed";
import SubscriptionGate from "@/components/SubscriptionGate";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, sessions_used")
    .eq("id", user.id)
    .single();

  const isSubscribed = profile?.subscription_status === "active";
  const sessionsUsed = profile?.sessions_used ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <SubscriptionGate
          isSubscribed={isSubscribed}
          sessionsUsed={sessionsUsed}
          userId={user.id}
        >
          <div className="flex flex-1 flex-col px-4 py-4 sm:px-6">
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
              <DelphiEmbed />
            </div>
          </div>
        </SubscriptionGate>
      </main>
    </div>
  );
}
