import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/components/AnimatedSection";

const FAQS = [
  {
    q: "How do I get started?",
    a: "Create a free account using Google, email, or phone. You'll get 3 free sessions to try out Dr. Cialdini AI before choosing a plan.",
  },
  {
    q: "What's included in the free tier?",
    a: "Free users get 3 chat or voice call sessions with Dr. Cialdini AI. After that, you'll need to upgrade to Pro for unlimited access.",
  },
  {
    q: "How do I upgrade or manage my subscription?",
    a: "Go to the Pricing page to subscribe. Once subscribed, you can manage billing, update payment methods, or cancel through the Stripe Customer Portal from your chat page.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes. You can cancel at any time through the billing portal. You'll retain access until the end of your current billing period.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use industry-standard encryption, Supabase row-level security, and strict Content Security Policies. We never share your conversation data with third parties.",
  },
  {
    q: "What's the difference between chat and voice call?",
    a: "Chat lets you type questions and receive text responses. Voice call lets you have a real-time spoken conversation with Dr. Cialdini AI. Both are available on all plans.",
  },
];

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-6 py-24">
        <AnimatedSection className="mx-auto max-w-3xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground">Support</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Need help? We&apos;re here for you.
            </p>
          </div>

          {/* Contact */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>
                Reach out and we&apos;ll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <a href="mailto:support@320media.com" className="text-sm text-primary hover:underline">
                    support@320media.com
                  </a>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                We typically respond within 24 hours on business days.
              </p>
            </CardContent>
          </Card>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
            <div className="mt-8 space-y-4">
              {FAQS.map((faq) => (
                <Card key={faq.q}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground">{faq.q}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">Still have questions?</p>
            <a href="mailto:support@320media.com" className={cn(buttonVariants({ size: "lg" }), "mt-4")}>
              Email Support
            </a>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
}
