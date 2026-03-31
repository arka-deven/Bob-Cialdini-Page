import Link from "next/link";
import Header from "@/components/Header";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            This page doesn&apos;t exist.
          </p>
          <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
            Go Home
          </Link>
        </div>
      </main>
    </div>
  );
}
