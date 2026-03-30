"use client";

export default function Marquee({
  items,
  speed = 30,
}: {
  items: { value: string; label: string }[];
  speed?: number;
}) {
  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex w-max animate-marquee items-center gap-12"
        style={{ "--marquee-speed": `${speed}s` } as React.CSSProperties}
      >
        {doubled.map((item, i) => (
          <div key={`${item.value}-${i}`} className="flex shrink-0 items-center gap-3">
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">{item.value}</strong>{" "}
              {item.label}
            </span>
            <span className="text-border">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
