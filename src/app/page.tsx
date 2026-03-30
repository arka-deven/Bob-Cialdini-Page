import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnimatedHero, FadeUp } from "@/components/AnimatedHero";
import { StaggerContainer, StaggerItem, FadeInView } from "@/components/AnimatedSection";
import { cn } from "@/lib/utils";

const STATS = [
  { value: "5M+", label: 'copies of "Influence" sold' },
  { value: "40+", label: "years of research" },
  { value: "Fortune 500", label: "companies trust his work" },
  { value: "NYT", label: "Bestselling Author" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-28">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
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

          {/* Photo */}
          <FadeUp delay={0.3} className="relative shrink-0">
            <div className="relative h-[400px] w-[300px] overflow-hidden rounded-2xl border border-border shadow-2xl shadow-primary/10 sm:h-[480px] sm:w-[360px]">
              <Image
                src="/robert-cialdini.jpg"
                alt="Dr. Robert Cialdini"
                fill
                className="object-cover object-top"
                priority
                sizes="(max-width: 640px) 300px, 360px"
              />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-border bg-muted/50 px-6 py-8">
        <StaggerContainer className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center text-sm text-muted-foreground" stagger={0.08}>
          {STATS.map((stat, i) => (
            <StaggerItem key={stat.value} className="flex items-center gap-2">
              {i > 0 && <Separator orientation="vertical" className="mr-6 hidden h-4 sm:block" />}
              <span><strong className="text-foreground">{stat.value}</strong> {stat.label}</span>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* CTA */}
      <FadeInView className="px-6 py-24">
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
      </FadeInView>

      <Footer />
    </div>
  );
}
