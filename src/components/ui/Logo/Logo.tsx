export interface LogoProps {
  size?: number;
}

/** Player Scout brand mark — a Test cricket red ball with a raised cream-stitched seam. */
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
      <defs>
        {/* glossy cherry-red leather: lit from upper-left, deepening toward the rim */}
        <radialGradient id="ball-leather" cx="37%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#e8402f" />
          <stop offset="42%" stopColor="#c81d1d" />
          <stop offset="82%" stopColor="#8f1414" />
          <stop offset="100%" stopColor="#6b0f0f" />
        </radialGradient>
      </defs>

      {/* leather */}
      <circle cx="16" cy="16" r="14" fill="url(#ball-leather)" />
      <circle cx="16" cy="16" r="14" stroke="#5e0d0d" strokeWidth="1" strokeOpacity="0.6" />

      {/* specular highlight */}
      <ellipse cx="10.8" cy="10" rx="4.6" ry="3.1" fill="#ffffff" opacity="0.22" />

      {/* seam */}
      <g fill="none" stroke="#efe6d2" strokeLinecap="round">
        {/* raised thread edges */}
        <path d="M12 3.5Q7 16 12 28.5" strokeWidth="0.9" opacity="0.9" />
        <path d="M15 3Q10.5 16 15 29" strokeWidth="0.9" opacity="0.9" />
        {/* cross-stitch rungs */}
        <g strokeWidth="1.1">
          <path d="M11.1 6L14.2 5.6" />
          <path d="M10.4 8.5L13.6 8.2" />
          <path d="M9.9 11L13.1 10.8" />
          <path d="M9.6 13.5L12.8 13.4" />
          <path d="M9.5 16L12.8 16" />
          <path d="M9.6 18.5L12.8 18.6" />
          <path d="M9.9 21L13.1 21.2" />
          <path d="M10.4 23.5L13.6 23.8" />
          <path d="M11.1 26L14.2 26.4" />
        </g>
      </g>
    </svg>
  );
}
