"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProfileFormProps {
  email: string;
  fullName: string;
  phone: string;
  subscriptionStatus: string;
  newsletter: boolean;
  backToChat?: boolean;
}

export default function ProfileForm({
  email,
  fullName: initialName,
  phone: initialPhone,
  subscriptionStatus,
  newsletter: initialNewsletter,
  backToChat,
}: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [newsletter, setNewsletter] = useState(initialNewsletter);
  const [saving, setSaving] = useState(false);

  const isSubscribed = subscriptionStatus === "active";

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, phone, newsletter }),
    });

    if (res.ok) {
      toast.success("Profile updated");
    } else if (res.status === 429) {
      toast.error("Too many requests");
    } else {
      toast.error("Failed to update");
    }
    setSaving(false);
  }

  async function handleManageBilling() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error("Unable to open billing portal");
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        {backToChat && (
          <Link href="/chat" className="rounded-md p-1 text-muted-foreground hover:text-foreground" aria-label="Back to Chat">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <Input value={email} disabled className="mt-1 opacity-60" />
            <p className="mt-1 text-xs text-muted-foreground">Sign in with a different address to change</p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Full Name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Phone</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
              className="mt-1"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm text-muted-foreground">Receive tips on influence & persuasion</span>
          </label>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Membership</p>
              <p className="text-xs text-muted-foreground">Current plan status</p>
            </div>
            <Badge variant={isSubscribed ? "default" : "secondary"}>
              {isSubscribed ? "Pro" : "Free Trial"}
            </Badge>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Phone linked</p>
              <p className="text-xs text-muted-foreground">For account verification</p>
            </div>
            <Badge variant={phone ? "default" : "secondary"}>
              {phone ? "Yes" : "No"}
            </Badge>
          </div>

          {isSubscribed ? (
            <Button variant="outline" className="mt-6 w-full" onClick={handleManageBilling}>
              Manage Billing
            </Button>
          ) : (
            <Link href="/pricing" className="mt-6 block">
              <Button className="w-full">Upgrade to Pro</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
