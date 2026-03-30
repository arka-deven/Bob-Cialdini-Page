import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
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
    a: "Head to the Pricing page to subscribe. Once subscribed, you can manage billing, update payment methods, or cancel through the billing portal.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes. You can cancel at any time. You'll retain access until the end of your current billing period.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use industry-standard encryption, row-level security, and strict Content Security Policies. Your conversation data is never shared with third parties.",
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

      <main className="flex-1 px-6 py-12">
        <AnimatedSection className="mx-auto max-w-3xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground">Support</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Frequently asked questions about Dr. Cialdini AI.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {FAQS.map((faq) => (
              <Card key={faq.q}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </AnimatedSection>
      </main>

      <Footer />
    </div>
  );
}
