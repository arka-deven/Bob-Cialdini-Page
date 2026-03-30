"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";

const PRINCIPLES = [
  { title: "Reciprocity", description: "People feel obligated to return favors — the give-and-take that builds trust." },
  { title: "Commitment", description: "Small yeses lead to big yeses — consistency drives deeper engagement." },
  { title: "Social Proof", description: "When uncertain, people follow what others do — the power of the crowd." },
  { title: "Authority", description: "Expertise commands attention — credibility opens doors before words do." },
  { title: "Liking", description: "We say yes to people we like — rapport is the invisible persuader." },
  { title: "Scarcity", description: "Less available means more desirable — urgency that moves people to act." },
  { title: "Unity", description: "Shared identity runs deeper than persuasion — belonging creates influence." },
];

export default function ScrollLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Photo shrinks as you scroll
  const photoScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.35]);
  const photoRadius = useTransform(scrollYProgress, [0, 0.3], [16, 12]);
  const photoX = useTransform(scrollYProgress, [0, 0.3], ["0%", "0%"]);
  const photoOpacity = useTransform(scrollYProgress, [0, 0.15, 0.3], [1, 1, 0.9]);

  return (
    <div ref={containerRef} className="relative" style={{ height: "250vh" }}>
      {/* Sticky photo that shrinks */}
      <motion.div
        className="pointer-events-none fixed right-8 top-24 z-40 hidden lg:block"
        style={{
          scale: photoScale,
          borderRadius: photoRadius,
          opacity: photoOpacity,
          x: photoX,
          transformOrigin: "top right",
        }}
      >
        <div className="relative h-105 w-80 overflow-hidden rounded-2xl border border-border shadow-2xl shadow-primary/10">
          <Image
            src="/robert-cialdini.jpg"
            alt="Dr. Robert Cialdini"
            fill
            className="object-cover object-top"
            priority
            sizes="320px"
          />
        </div>
      </motion.div>

      {/* Principles section */}
      <div className="sticky top-0 h-screen">
        <motion.div
          className="flex h-full flex-col justify-center px-6 pt-20"
          style={{ opacity: useTransform(scrollYProgress, [0.15, 0.3], [0, 1]) }}
        >
          <div className="mx-auto w-full max-w-5xl">
            <motion.h2
              className="text-3xl font-bold text-foreground sm:text-4xl"
              style={{
                opacity: useTransform(scrollYProgress, [0.15, 0.25], [0, 1]),
                y: useTransform(scrollYProgress, [0.15, 0.25], [40, 0]),
              }}
            >
              The 7 Principles of Persuasion
            </motion.h2>
            <motion.p
              className="mt-3 max-w-lg text-muted-foreground"
              style={{
                opacity: useTransform(scrollYProgress, [0.18, 0.28], [0, 1]),
                y: useTransform(scrollYProgress, [0.18, 0.28], [30, 0]),
              }}
            >
              The foundational science behind every &quot;yes.&quot;
            </motion.p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:pr-72">
              {PRINCIPLES.map((p, i) => {
                const start = 0.2 + i * 0.05;
                const end = start + 0.1;
                return (
                  <PrincipleCard
                    key={p.title}
                    index={i}
                    title={p.title}
                    description={p.description}
                    scrollYProgress={scrollYProgress}
                    start={start}
                    end={end}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PrincipleCard({
  index,
  title,
  description,
  scrollYProgress,
  start,
  end,
}: {
  index: number;
  title: string;
  description: string;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  end: number;
}) {
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const y = useTransform(scrollYProgress, [start, end], [60, 0]);

  return (
    <motion.div style={{ opacity, y }}>
      <Card className="h-full transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
        <CardContent className="pt-6">
          <span className="text-sm font-semibold text-primary">0{index + 1}</span>
          <h3 className="mt-2 text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
