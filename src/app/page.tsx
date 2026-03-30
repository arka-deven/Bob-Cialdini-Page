import Link from "next/link";
import Header from "@/components/Header";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnimatedHero } from "@/components/AnimatedHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { cn } from "@/lib/utils";

const PRINCIPLES = [
  { title: "Reciprocity", description: "People feel obligated to return favors. Learn how to ethically leverage this powerful principle." },
  { title: "Commitment & Consistency", description: "Once someone commits, they're driven to stay consistent. Master the art of meaningful commitments." },
  { title: "Social Proof", description: "People look to others to determine correct behavior. Understand how to build authentic proof." },
  { title: "Authority", description: "Expertise and credibility drive influence. Learn to establish and communicate authority effectively." },
  { title: "Liking", description: "People say yes to those they like. Discover the science behind building genuine rapport." },
  { title: "Scarcity", description: "Limited availability increases perceived value. Apply scarcity ethically to drive action." },
  { title: "Unity", description: "Shared identity drives deeper influence. Harness the power of belonging and togetherness." },
];

const STEPS = [
  { step: "01", title: "Create Your Account", desc: "Sign up with Google, email, or phone in seconds." },
  { step: "02", title: "Chat or Call", desc: "Type your question or start a voice call with Dr. Cialdini AI." },
  { step: "03", title: "Get Expert Insights", desc: "Receive personalized answers grounded in decades of scientific research." },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" />
        <AnimatedHero>
          <div className="relative mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 text-xs uppercase tracking-widest">
              The Science of Influence
            </Badge>
            <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-6xl">
              Ask Dr. Robert Cialdini
              <br />
              <span className="text-primary">Anything About Persuasion</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Get personalized insights from the world&apos;s foremost authority on
              influence and persuasion. Chat or call — powered by decades of
              groundbreaking research.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/signup" className={cn(buttonVariants({ size: "lg" }))}>
                Start Free — 3 Sessions Included
              </Link>
              <Link href="/pricing" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                View Plans
              </Link>
            </div>
          </div>
        </AnimatedHero>
      </section>

      {/* Social Proof */}
      <section className="border-y border-border bg-muted/50 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center text-sm text-muted-foreground">
          <span><strong className="text-foreground">5M+</strong> copies of &quot;Influence&quot; sold</span>
          <Separator orientation="vertical" className="hidden h-4 sm:block" />
          <span><strong className="text-foreground">40+</strong> years of research</span>
          <Separator orientation="vertical" className="hidden h-4 sm:block" />
          <span>Trusted by <strong className="text-foreground">Fortune 500</strong> companies</span>
          <Separator orientation="vertical" className="hidden h-4 sm:block" />
          <span><strong className="text-foreground">NYT</strong> Bestselling Author</span>
        </div>
      </section>

      {/* How It Works */}
      <AnimatedSection className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-foreground sm:text-4xl">How It Works</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Get expert guidance on influence and persuasion in three simple steps.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {STEPS.map((item) => (
              <Card key={item.step} className="text-center">
                <CardContent className="pt-8">
                  <span className="text-3xl font-bold text-primary/30">{item.step}</span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* 7 Principles */}
      <AnimatedSection className="border-t border-border bg-muted/50 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-foreground sm:text-4xl">
            The 7 Principles of Persuasion
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Explore the foundational principles that have shaped the science of influence worldwide.
          </p>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <Card key={p.title} className="transition-colors hover:border-primary/30">
                <CardContent className="pt-6">
                  <span className="text-sm font-semibold text-primary">0{i + 1}</span>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-linear-to-b from-primary/10 to-transparent p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to Master the Science of Influence?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start with 3 free sessions. No credit card required.
          </p>
          <Link href="/auth/signup" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Dr. Robert Cialdini AI. All rights reserved.
          </span>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
        </div>
      </footer>
    </div>
  );
}
