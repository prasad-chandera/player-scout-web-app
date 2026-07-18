import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV = [
  { href: "/", label: "Scout" },
  { href: "/undervalued", label: "Undervalued" },
  { href: "/team-fit", label: "Team Fit" },
];

/** Sticky app header — brand mark, primary nav, and the theme toggle. */
export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <Logo size={30} />
          <span className="font-display text-xl font-bold uppercase tracking-wide">
            Player <span className="text-series">Scout</span>
          </span>
        </Link>
        <nav className="flex gap-1 text-sm font-medium">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-1.5 text-ink-secondary transition-colors hover:bg-surface hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
