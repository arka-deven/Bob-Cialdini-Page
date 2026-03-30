"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => setUser(data.user));

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  async function handleSignOut() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-(--border) bg-(--bg-primary)/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-(--text-primary)">
            Dr. Cialdini <span className="text-yellow">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          <Link
            href="/pricing"
            className="text-sm text-(--text-muted) transition-colors hover:text-(--text-primary)"
          >
            Pricing
          </Link>
          {user ? (
            <>
              <Link
                href="/chat"
                className="text-sm text-(--text-muted) transition-colors hover:text-(--text-primary)"
              >
                Chat
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-(--border) px-4 py-2 text-sm text-(--text-primary) transition-colors hover:bg-(--bg-tertiary)"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-lg bg-yellow px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-gold"
            >
              Get Started
            </Link>
          )}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 sm:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--border)"
            aria-label="Toggle menu"
          >
            <svg className="h-4 w-4 text-(--text-primary)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-(--border) bg-(--bg-primary) px-6 py-4 sm:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/pricing" className="text-sm text-(--text-muted)" onClick={() => setMenuOpen(false)}>
              Pricing
            </Link>
            {user ? (
              <>
                <Link href="/chat" className="text-sm text-(--text-muted)" onClick={() => setMenuOpen(false)}>
                  Chat
                </Link>
                <button onClick={handleSignOut} className="text-left text-sm text-(--text-muted)">
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="text-sm font-medium text-yellow" onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
