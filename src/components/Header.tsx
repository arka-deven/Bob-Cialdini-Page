"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
  const initial = (user?.email || "U").charAt(0).toUpperCase();

  useEffect(() => {
    import("@/lib/supabase/client")
      .then(({ createClient }) => {
        try {
          const supabase = createClient();
          supabase.auth.getUser().then(({ data }) => setUser(data.user));
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
            setUser(session?.user ?? null);
          });
          return () => subscription.unsubscribe();
        } catch {}
      })
      .catch(() => {});
  }, []);

  async function handleSignOut() {
    const { createClient } = await import("@/lib/supabase/client");
    await createClient().auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <nav className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-bold text-foreground">
          Dr. Cialdini <span className="text-primary">AI</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link href="/pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/support" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Support
          </Link>
          {user ? (
            <>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
              <Link href="/profile" className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border transition-opacity hover:opacity-80" title={user.email || ""}>
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Profile" fill className="object-cover" sizes="32px" referrerPolicy="no-referrer" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-semibold text-primary">
                    {initial}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <Link href="/auth/login" className={cn(buttonVariants({ size: "sm" }))}>
              Get Started
            </Link>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          {user && (
            <Link href="/profile" className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Profile" fill className="object-cover" sizes="32px" referrerPolicy="no-referrer" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-semibold text-primary">
                  {initial}
                </span>
              )}
            </Link>
          )}
          <ThemeToggle />
          <Button variant="outline" size="icon" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </Button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/pricing" className="text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <Link href="/support" className="text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>Support</Link>
            {user ? (
              <>
                <Link href="/profile" className="text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>Profile</Link>
                <button onClick={handleSignOut} className="text-left text-sm text-muted-foreground">Sign Out</button>
              </>
            ) : (
              <Link href="/auth/login" className="text-sm font-medium text-primary" onClick={() => setMenuOpen(false)}>Get Started</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
