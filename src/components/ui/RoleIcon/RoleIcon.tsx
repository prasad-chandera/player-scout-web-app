import type { Role } from "@/lib/types";

/** Single source of truth for how each player role is labelled and coloured. */
export const ROLE_META: Record<Role, { label: string; accent: string }> = {
  batter: { label: "Batter", accent: "var(--accent)" },
  bowler: { label: "Bowler", accent: "var(--brand)" },
  allrounder: { label: "All-rounder", accent: "var(--ball)" },
  wicketkeeper: { label: "Wicket-Keeper", accent: "var(--role-keeper)" },
};

export interface RoleIconProps {
  role: Role;
  size?: number;
}

/**
 * Line-icon glyph for a player's role. Colour comes from the parent's `color`
 * (currentColor), matching the SunIcon/MoonIcon convention. Decorative — the
 * role label carries the meaning, so this is aria-hidden.
 */
export function RoleIcon({ role, size = 16 }: RoleIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden
    >
      {ROLE_GLYPH[role]}
    </svg>
  );
}

const ROLE_GLYPH: Record<Role, React.ReactNode> = {
  // cricket bat, angled — blade + handle
  batter: (
    <>
      <path d="M6.5 17.5 15 9" />
      <path d="M14 8l2-2a1.8 1.8 0 0 1 2.6 2.6l-2 2z" />
      <path d="M5 19l1.5-1.5" />
    </>
  ),
  // seamed ball
  bowler: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M7 6.5c3 3.4 3 8.6 0 12M17 6.5c-3 3.4-3 8.6 0 12" />
    </>
  ),
  // bat + ball together
  allrounder: (
    <>
      <path d="M4.5 18.5 12 11" />
      <path d="M11 10l1.8-1.8a1.7 1.7 0 0 1 2.4 2.4L13.4 12z" />
      <circle cx="18" cy="17.5" r="2.6" />
    </>
  ),
  // three stumps + bails
  wicketkeeper: (
    <>
      <path d="M8 8v11M12 8v11M16 8v11" />
      <path d="M7 8h5M12 8h5" />
    </>
  ),
};
