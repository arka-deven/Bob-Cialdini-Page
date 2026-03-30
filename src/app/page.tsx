import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { AnimatedHero, FadeUp } from "@/components/AnimatedHero";
import Marquee from "@/components/Marquee";
import ScrollLanding from "@/components/ScrollLanding";
import { cn } from "@/lib/utils";

const STATS = [
  { value: "#1", label: "Most Cited Social Psychologist" },
  { value: "5M+", label: "Books Sold Worldwide" },
  { value: "40+", label: "Years of Peer-Reviewed Research" },
  { value: "Fortune 500", label: "Trusted Advisor" },
  { value: "NYT", label: "Bestselling Author" },
  { value: "162", label: "Countries Reached" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Header />

      {/* Hero — first screen */}
      <section className="relative flex min-h-[calc(100vh-57px)] flex-col">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" />

        <div className="relative mx-auto flex flex-1 max-w-6xl flex-col items-center gap-10 px-6 py-10 lg:flex-row lg:gap-16 lg:py-16">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <AnimatedHero>
              <Badge variant="secondary" className="mb-6 text-xs uppercase tracking-widest">
                The Science of Influence
              </Badge>
            </AnimatedHero>

            <FadeUp delay={0.15}>
              <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                Ask Dr. Robert Cialdini
                <br />
                <span className="text-primary">Anything About Persuasion</span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.3}>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground lg:max-w-lg">
                Get personalized insights from the world&apos;s foremost authority on
                influence and persuasion. Chat or call — powered by decades of
                groundbreaking research.
              </p>
            </FadeUp>

            <FadeUp delay={0.45} className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link href="/auth/signup" className={cn(buttonVariants({ size: "lg" }))}>
                Start Free — 3 Sessions Included
              </Link>
              <Link href="/pricing" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                View Plans
              </Link>
            </FadeUp>
          </div>

          {/* Photo — visible on first screen, hidden on lg when scroll takes over */}
          <FadeUp delay={0.3} className="relative shrink-0 lg:block">
            <div className="relative h-85 w-65 overflow-hidden rounded-2xl border border-border shadow-2xl shadow-primary/10 sm:h-105 sm:w-80">
              <Image
                src="/robert-cialdini.jpg"
                alt="Dr. Robert Cialdini"
                fill
                className="object-cover object-top"
                priority
                sizes="(max-width: 640px) 260px, 320px"
              />
            </div>
          </FadeUp>
        </div>

        {/* Marquee social proof — pinned at bottom of first screen */}
        <div className="border-y border-border bg-muted/50 py-4">
          <Marquee items={STATS} speed={25} />
        </div>
      </section>

      {/* Scroll-driven principles section */}
      <ScrollLanding />

      <Footer />
    </div>
  );
}
