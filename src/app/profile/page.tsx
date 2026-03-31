import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, subscription_status, newsletter")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-6 py-12">
        <ProfileForm
          email={user.email || ""}
          fullName={profile?.full_name || ""}
          phone={profile?.phone || ""}
          subscriptionStatus={profile?.subscription_status || "inactive"}
          newsletter={profile?.newsletter ?? false}
        />
      </main>
    </div>
  );
}
