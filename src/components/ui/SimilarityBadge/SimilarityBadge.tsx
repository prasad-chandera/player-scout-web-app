export interface SimilarityBadgeProps {
  /** 0–100 */
  value: number;
  label?: string;
  size?: number;
}

/** Radial gauge — used for similarity %, readiness and fit scores.
 *  Broadcast styling: a green→gold gradient arc with a bold condensed numeral. */
export function SimilarityBadge({ value, label, size = 64 }: SimilarityBadgeProps) {
  const v = Math.max(0, Math.min(100, value));
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  const filled = (v / 100) * c;
  // Unique gradient id per size so multiple badges don't collide.
  const gid = `gauge-grad-${size}`;

  return (
    <div className="flex flex-col items-center gap-1" title={label ? `${label}: ${value}` : String(value)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label ?? "score"} ${value} out of 100`}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--baseline)" strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fill="var(--foreground)"
          fontSize={size / 3.1}
          fontWeight="700"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          {Math.round(v)}
        </text>
      </svg>
      {label && <span className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{label}</span>}
    </div>
  );
}
