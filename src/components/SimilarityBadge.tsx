/** Radial percent badge — used for similarity %, readiness and fit scores. */
export default function SimilarityBadge({
  value,
  label,
  size = 64,
}: {
  /** 0–100 */
  value: number;
  label?: string;
  size?: number;
}) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1" title={label ? `${label}: ${value}` : String(value)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label ?? "score"} ${value} out of 100`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--baseline)" strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--series-1)"
          strokeWidth="4"
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
          fontSize={size / 3.6}
          fontWeight="600"
        >
          {Math.round(value)}
        </text>
      </svg>
      {label && <span className="text-xs text-ink-muted">{label}</span>}
    </div>
  );
}
