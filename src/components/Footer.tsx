import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <span className="text-sm text-muted-foreground">
          &copy; 2026 - 320 Media LLC. All rights reserved.
        </span>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/support" className="hover:text-foreground">
            Need Support?
          </Link>
        </div>
      </div>
    </footer>
  );
}
