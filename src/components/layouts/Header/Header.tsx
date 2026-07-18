"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV = [
  { href: "/", label: "Discover" },
  { href: "/undervalued", label: "Hidden Gems" },
  { href: "/team-fit", label: "Team Fit" },
];

/** Sticky app header — brand mark, primary nav with active state, and the theme toggle. */
export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-background/70 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="group flex items-center gap-2.5">
          <Logo size={32} />
          <span className="font-display text-xl font-bold uppercase leading-none tracking-wide transition-colors group-hover:text-series">
            Player <span className="text-series group-hover:text-foreground">Scout</span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1.5">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm tracking-wide transition-all ${
                  active
                    ? "bg-series/12 font-semibold text-foreground ring-1 ring-inset ring-series/30"
                    : "font-medium text-ink-secondary hover:bg-surface hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <span className="mx-1 h-6 w-px bg-hairline" aria-hidden />
        <ThemeToggle />

        {/* broadcast lower-third accent along the header's bottom edge */}
        <span
          className="pointer-events-none absolute inset-x-0 -bottom-px h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 60%, transparent), transparent)",
          }}
          aria-hidden
        />
      </div>
    </header>
  );
}
