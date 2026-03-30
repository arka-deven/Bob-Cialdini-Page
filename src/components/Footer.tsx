import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <span className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Dr. Robert Cialdini AI
        </span>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link href="/support" className="hover:text-foreground">Support</Link>
        </div>
      </div>
    </footer>
  );
}
