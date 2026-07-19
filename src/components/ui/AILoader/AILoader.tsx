"use client";

import { useEffect, useState } from "react";

const DEFAULT_MESSAGES = [
  "Analyzing player data…",
  "Computing skill vectors…",
  "Scanning the domestic pool…",
  "Ranking the best matches…",
  "Crunching the numbers…",
];

export interface AILoaderProps {
  /** AI-themed captions cycled ~every 2s. */
  messages?: string[];
  /** Optional persistent heading above the cycling caption. */
  label?: string;
  /** Wrap in a card box (for section/grid slots). */
  card?: boolean;
  className?: string;
}

/**
 * "Orbiting spark + glow" loader — signals that AI is computing the result.
 * A glowing gradient orb with a sparkle, small dots orbiting it, and a caption
 * that rotates through AI-themed messages.
 */
export function AILoader({ messages = DEFAULT_MESSAGES, label, card, className }: AILoaderProps) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 2000);
    return () => clearInterval(t);
  }, [messages.length]);

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      {/* orb + orbiting dots */}
      <div className="relative size-14">
        <div
          className="flex size-14 items-center justify-center rounded-full text-on-primary [animation:glow-pulse_2s_ease-in-out_infinite]"
          style={{ background: "var(--grad-brand)" }}
        >
          <SparkleIcon />
        </div>
        {/* spinning ring carrying the orbit dots */}
        <div className="absolute inset-[-6px] animate-spin [animation-duration:2.8s]" aria-hidden>
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rounded-full bg-series" />
          <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-accent" />
          <span className="absolute left-0 top-1/2 size-1 -translate-y-1/2 rounded-full" style={{ background: "var(--brand)" }} />
        </div>
      </div>

      <div className="space-y-1">
        {label && <p className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">{label}</p>}
        {/* keyed span so each swap re-triggers the rise-in fade */}
        <p key={i} className="rise-in flex items-center justify-center gap-1.5 text-sm text-ink-secondary">
          <span className="text-series" aria-hidden>
            ✦
          </span>
          <span aria-live="polite">{messages[i]}</span>
        </p>
      </div>
    </div>
  );

  if (card) {
    return <div className={`card flex items-center justify-center rounded-2xl p-8 ${className ?? ""}`}>{content}</div>;
  }
  return <div className={`flex items-center justify-center py-12 ${className ?? ""}`}>{content}</div>;
}

function SparkleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.9 5.6a3 3 0 0 0 1.9 1.9L21.5 11l-5.7 1.5a3 3 0 0 0-1.9 1.9L12 20l-1.9-5.6a3 3 0 0 0-1.9-1.9L2.5 11l5.7-1.5a3 3 0 0 0 1.9-1.9L12 2z" />
    </svg>
  );
}
