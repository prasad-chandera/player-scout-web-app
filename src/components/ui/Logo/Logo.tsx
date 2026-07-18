export interface LogoProps {
  size?: number;
}

/** Player Scout brand mark — a cricket ball with a gold seam. Themes via currentColor + accent. */
export function Logo({ size = 28 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Player Scout"
      className="shrink-0"
    >
      <circle cx="16" cy="16" r="14" fill="var(--brand)" />
      <circle cx="16" cy="16" r="14" stroke="var(--brand-strong)" strokeWidth="1.5" />
      {/* seam */}
      <path
        d="M9 5.5c4 3.2 4 17.8 0 21M23 5.5c-4 3.2-4 17.8 0 21"
        stroke="var(--accent)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* stitches */}
      <g stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round">
        <path d="M9 9.5l2.2-.4M9 14l2.4.1M9 18.5l2.2.5M9 22.5l2-.9" />
        <path d="M23 9.5l-2.2-.4M23 14l-2.4.1M23 18.5l-2.2.5M23 22.5l-2-.9" />
      </g>
    </svg>
  );
}
