/** Condensed section heading with the 22-yard pitch-line accent. */
export default function SectionHeading({
  children,
  sub,
}: {
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="space-y-2">
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide">{children}</h2>
      <div className="pitch-line" />
      {sub && <p className="text-sm text-ink-secondary">{sub}</p>}
    </div>
  );
}
