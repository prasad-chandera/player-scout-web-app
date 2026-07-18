export interface SectionHeadingProps {
  children: React.ReactNode;
  sub?: string;
}

/** Condensed section heading with the 22-yard pitch-line accent. */
export function SectionHeading({ children, sub }: SectionHeadingProps) {
  return (
    <div className="space-y-2">
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide">{children}</h2>
      <div className="pitch-line" />
      {sub && <p className="text-sm text-ink-secondary">{sub}</p>}
    </div>
  );
}
