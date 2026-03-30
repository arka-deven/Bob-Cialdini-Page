import Link from "next/link";
import Header from "@/components/Header";

const PRINCIPLES = [
  {
    title: "Reciprocity",
    description:
      "People feel obligated to return favors. Learn how to ethically leverage this powerful principle.",
  },
  {
    title: "Commitment & Consistency",
    description:
      "Once someone commits, they're driven to stay consistent. Master the art of meaningful commitments.",
  },
  {
    title: "Social Proof",
    description:
      "People look to others to determine correct behavior. Understand how to build authentic proof.",
  },
  {
    title: "Authority",
    description:
      "Expertise and credibility drive influence. Learn to establish and communicate authority effectively.",
  },
  {
    title: "Liking",
    description:
      "People say yes to those they like. Discover the science behind building genuine rapport.",
  },
  {
    title: "Scarcity",
    description:
      "Limited availability increases perceived value. Apply scarcity ethically to drive action.",
  },
  {
    title: "Unity",
    description:
      "Shared identity drives deeper influence. Harness the power of belonging and togetherness.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        <div className="absolute inset-0 bg-linear-to-b from-yellow/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-yellow">
            The Science of Influence
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-(--text-primary) sm:text-6xl">
            Ask Dr. Robert Cialdini
            <br />
            <span className="text-yellow">Anything About Persuasion</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-(--text-muted)">
            Get personalized insights from the world&apos;s foremost authority on
            influence and persuasion. Chat or call — powered by decades of
            groundbreaking research.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/signup"
              className="rounded-lg bg-yellow px-8 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-gold"
            >
              Start Free — 3 Sessions Included
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-(--border) px-8 py-3.5 text-sm font-semibold text-(--text-primary) transition-colors hover:bg-(--bg-secondary)"
            >
              View Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-(--border) bg-(--bg-secondary) px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center text-sm text-(--text-muted)">
          <span>
            <strong className="text-(--text-primary)">5M+</strong> copies of
            &quot;Influence&quot; sold
          </span>
          <span className="hidden sm:inline text-(--border)">|</span>
          <span>
            <strong className="text-(--text-primary)">40+</strong> years of research
          </span>
          <span className="hidden sm:inline text-(--border)">|</span>
          <span>
            Trusted by <strong className="text-(--text-primary)">Fortune 500</strong>{" "}
            companies
          </span>
          <span className="hidden sm:inline text-(--border)">|</span>
          <span>
            <strong className="text-(--text-primary)">NYT</strong> Bestselling Author
          </span>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-(--text-primary) sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-(--text-muted)">
            Get expert guidance on influence and persuasion in three simple steps.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create Your Account",
                desc: "Sign up with Google, email, or phone in seconds.",
              },
              {
                step: "02",
                title: "Chat or Call",
                desc: "Type your question or start a voice call with Dr. Cialdini AI.",
              },
              {
                step: "03",
                title: "Get Expert Insights",
                desc: "Receive personalized answers grounded in decades of scientific research.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-(--border) bg-(--card-bg) p-8 text-center"
              >
                <span className="text-3xl font-bold text-yellow/30">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-(--text-primary)">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-(--text-muted)">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Principles */}
      <section className="border-t border-(--border) bg-(--bg-secondary) px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-(--text-primary) sm:text-4xl">
            The 7 Principles of Persuasion
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-(--text-muted)">
            Explore the foundational principles that have shaped the science of
            influence worldwide.
          </p>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.title}
                className="rounded-xl border border-(--border) bg-(--card-bg) p-6 transition-colors hover:border-yellow/30"
              >
                <span className="text-sm font-semibold text-yellow">
                  0{i + 1}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-(--text-primary)">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-(--text-muted)">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-yellow/20 bg-linear-to-b from-yellow/10 to-transparent p-12 text-center">
          <h2 className="text-3xl font-bold text-(--text-primary)">
            Ready to Master the Science of Influence?
          </h2>
          <p className="mt-4 text-(--text-muted)">
            Start with 3 free sessions. No credit card required.
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-block rounded-lg bg-yellow px-8 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-gold"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-(--border) px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm text-(--text-muted)">
            &copy; {new Date().getFullYear()} Dr. Robert Cialdini AI. All rights
            reserved.
          </span>
          <div className="flex gap-6 text-sm text-(--text-muted)">
            <Link href="/pricing" className="hover:text-(--text-primary)">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
