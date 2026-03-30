"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
        } catch {
          // Supabase not configured yet — show logged-out state
        }
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
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-foreground">
          Dr. Cialdini <span className="text-primary">AI</span>
        </Link>

        <div className="hidden items-center gap-4 sm:flex">
          <Link href="/pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          {user ? (
            <>
              <Link href="/chat" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Chat
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/auth/login" className={cn(buttonVariants({ size: "sm" }))}>
              Get Started
            </Link>
          )}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 sm:hidden">
          <ThemeToggle />
          <Button variant="outline" size="icon" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </Button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-border bg-background px-6 py-4 sm:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/pricing" className="text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>Pricing</Link>
            {user ? (
              <>
                <Link href="/chat" className="text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>Chat</Link>
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
